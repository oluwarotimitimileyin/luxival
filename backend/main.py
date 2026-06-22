"""
Luxival Audit Platform — FastAPI backend
Endpoints:
  POST /scan/free      — run free 12-check scan, return JSON + PDF
  POST /scan/premium   — run full 7-flow scan (requires verified SumUp payment)
  POST /webhook/sumup  — SumUp checkout webhook, marks payment as verified
  GET  /health         — liveness check
"""
import atexit
import os
import uuid
import hmac
import hashlib
import json
import asyncio
import base64
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Dict, Any, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from posthog import Posthog
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from models import ScanRequest, ScanTier, ScanResult
from scanner import run_free_scan, run_premium_scan
from pdf_generator import generate_free_pdf, generate_premium_pdf
from location_suggestions import suggest_locations

load_dotenv()

posthog_client: Optional[Posthog] = None

SUMUP_WEBHOOK_SECRET = os.getenv("SUMUP_WEBHOOK_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
MAX_REQUEST_BYTES = int(os.getenv("MAX_REQUEST_BYTES", "1048576"))


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    global posthog_client
    posthog_client = Posthog(
        project_api_key=os.getenv("POSTHOG_PROJECT_TOKEN", ""),
        host=os.getenv("POSTHOG_HOST", "https://eu.i.posthog.com"),
        enable_exception_autocapture=True,
    )
    atexit.register(posthog_client.shutdown)
    yield
    posthog_client.shutdown()


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Luxival Audit API", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "https://www.luxival.com").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def security_headers_and_size_limit(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            request_size = int(content_length)
        except ValueError:
            return JSONResponse(status_code=400, content={"detail": "Invalid Content-Length"})
        if request_size > MAX_REQUEST_BYTES:
            return JSONResponse(status_code=413, content={"detail": "Request body too large"})

    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Cache-Control", "no-store")
    response.headers.setdefault(
        "Permissions-Policy",
        "camera=(), microphone=(), payment=(), usb=(), interest-cohort=()",
    )
    return response

# In-memory stores (replace with Redis for production scale)
# { checkout_id: {"status": "paid"|"pending", "email": str, "created_at": str} }
_verified_payments: Dict[str, Dict[str, Any]] = {}
# { scan_id: ScanResult }
_scan_cache: Dict[str, Any] = {}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def _user_id(email: str) -> str:
    """Return a stable, non-reversible distinct_id derived from the email."""
    return hashlib.sha256(email.strip().lower().encode()).hexdigest()


async def _save_lead_to_supabase(email: str, url: str, tier: str, scan_id: str):
    if not SUPABASE_URL:
        return
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            await client.post(
                f"{SUPABASE_URL}/rest/v1/contact_inquiries",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "email": email,
                    "service": f"audit-{tier}",
                    "message": f"Automated audit submitted for {url} (scan_id: {scan_id})",
                    "source": "audit-backend",
                },
            )
    except Exception:
        pass  # non-critical


def _verify_sumup_signature(body: bytes, signature: str) -> bool:
    if not SUMUP_WEBHOOK_SECRET:
        return True  # skip verification if secret not set
    mac = hmac.HMAC(SUMUP_WEBHOOK_SECRET.encode(), body, hashlib.sha256)
    expected = mac.hexdigest()
    return hmac.compare_digest(expected, signature.removeprefix("sha256="))


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "luxival-audit-api"}


@app.get("/locations/suggest")
@limiter.limit("60/minute")
async def locations_suggest(request: Request, q: str = "", limit: int = 6):
    """Return Finnish address/location suggestions for customer-facing forms."""
    try:
        suggestions = await suggest_locations(q, limit)
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Location suggestion service unavailable")

    return {"suggestions": suggestions}


@app.post("/webhook/sumup")
async def sumup_webhook(request: Request,
                        x_sumup_signature: str = Header(default="")):
    """Receives SumUp payment webhooks, marks checkout as paid."""
    body = await request.body()

    if SUMUP_WEBHOOK_SECRET and not _verify_sumup_signature(body, x_sumup_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        payload = json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_type = payload.get("event_type", "")
    checkout_id = payload.get("id") or payload.get("checkout_id", "")
    email = payload.get("checkout_reference", "") or payload.get("customer_email", "")

    if event_type == "PAYMENT_COMPLETED" and checkout_id:
        _verified_payments[checkout_id] = {
            "status": "paid",
            "email": email,
            "created_at": _now(),
        }
        if posthog_client and email:
            posthog_client.capture(
                distinct_id=_user_id(email),
                event="payment_verified",
                properties={"checkout_id": checkout_id},
            )

    return {"received": True}


@app.post("/scan/free")
@limiter.limit("10/hour")
async def scan_free(request: Request, body: ScanRequest,
                    background_tasks: BackgroundTasks):
    """Run free 12-check scan. Returns JSON result + base64 PDF."""
    scan_id = str(uuid.uuid4())[:8]

    if posthog_client:
        posthog_client.capture(
            distinct_id=_user_id(body.email),
            event="free_scan_requested",
            properties={"scan_id": scan_id, "tier": "free"},
        )

    try:
        result = await run_free_scan(str(body.url))
    except RuntimeError as e:
        if posthog_client:
            posthog_client.capture(
                distinct_id=_user_id(body.email),
                event="free_scan_failed",
                properties={"scan_id": scan_id},
            )
        raise HTTPException(status_code=422, detail=str(e))

    pdf_bytes = generate_free_pdf(
        url=str(body.url),
        score=result["score"],
        max_score=result["max_score"],
        checks=result["checks"],
        created_at=_now(),
    )
    pdf_b64 = base64.b64encode(pdf_bytes).decode()

    background_tasks.add_task(
        _save_lead_to_supabase, body.email, str(body.url), "free", scan_id
    )

    if posthog_client:
        posthog_client.capture(
            distinct_id=_user_id(body.email),
            event="free_scan_completed",
            properties={
                "scan_id": scan_id,
                "score": result["score"],
                "max_score": result["max_score"],
                "tier": "free",
            },
        )

    return {
        "scan_id": scan_id,
        "url": str(body.url),
        "score": result["score"],
        "max_score": result["max_score"],
        "page_title": result["meta"].get("title", ""),
        "checks": [c.model_dump() for c in result["checks"]],
        "pdf_base64": pdf_b64,
        "tier": "free",
        "created_at": _now(),
    }


@app.post("/scan/premium")
@limiter.limit("5/hour")
async def scan_premium(request: Request, body: ScanRequest,
                       background_tasks: BackgroundTasks):
    """Run full 7-flow premium scan. Requires verified SumUp payment_token."""
    if not body.payment_token:
        if posthog_client:
            posthog_client.capture(
                distinct_id=_user_id(body.email),
                event="payment_rejected",
                properties={"reason": "missing_token"},
            )
        raise HTTPException(status_code=402, detail="payment_token required for premium scan")

    payment = _verified_payments.get(body.payment_token)
    # Allow honour-system bypass ('sumup-honour') so the frontend fallback still works
    honour_bypass = body.payment_token == "sumup-honour"
    if not honour_bypass and (not payment or payment.get("status") != "paid"):
        if posthog_client:
            posthog_client.capture(
                distinct_id=_user_id(body.email),
                event="payment_rejected",
                properties={"reason": "unverified_payment"},
            )
        raise HTTPException(
            status_code=402,
            detail="Payment not verified. Complete payment at https://pay.sumup.com/b2c/QVLW9NTQ"
        )

    scan_id = str(uuid.uuid4())[:8]

    if posthog_client:
        posthog_client.capture(
            distinct_id=_user_id(body.email),
            event="premium_scan_requested",
            properties={"scan_id": scan_id, "tier": "premium"},
        )

    try:
        free_result = await run_free_scan(str(body.url))
        premium_flows = await run_premium_scan(str(body.url))
    except RuntimeError as e:
        if posthog_client:
            posthog_client.capture(
                distinct_id=_user_id(body.email),
                event="premium_scan_failed",
                properties={"scan_id": scan_id},
            )
        raise HTTPException(status_code=422, detail=str(e))

    all_scores = [c.score for c in free_result["checks"]]
    for flow in premium_flows:
        all_scores.extend(c.score for c in flow.checks)
    overall = sum(all_scores)
    max_overall = len(all_scores)

    pdf_bytes = generate_premium_pdf(
        url=str(body.url),
        overall_score=overall,
        max_score=max_overall,
        flows=premium_flows,
        created_at=_now(),
    )
    pdf_b64 = base64.b64encode(pdf_bytes).decode()

    # Consume payment token (one-use) — skip for honour bypass
    if not honour_bypass:
        del _verified_payments[body.payment_token]

    background_tasks.add_task(
        _save_lead_to_supabase, body.email, str(body.url), "premium", scan_id
    )

    if posthog_client:
        posthog_client.capture(
            distinct_id=_user_id(body.email),
            event="premium_scan_completed",
            properties={
                "scan_id": scan_id,
                "overall_score": overall,
                "max_score": max_overall,
                "tier": "premium",
            },
        )

    return {
        "scan_id": scan_id,
        "url": str(body.url),
        "overall_score": overall,
        "max_score": max_overall,
        "page_title": free_result["meta"].get("title", ""),
        "free_checks": [c.model_dump() for c in free_result["checks"]],
        "premium_flows": [f.model_dump() for f in premium_flows],
        "pdf_base64": pdf_b64,
        "tier": "premium",
        "created_at": _now(),
    }
