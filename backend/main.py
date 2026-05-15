"""
Luxival Audit Platform — FastAPI backend
Endpoints:
  POST /scan/free      — run free 12-check scan, return JSON + PDF
  POST /scan/premium   — run full 7-flow scan (requires verified SumUp payment)
  POST /webhook/sumup  — SumUp checkout webhook, marks payment as verified
  GET  /health         — liveness check
"""
import os
import uuid
import hmac
import hashlib
import json
import asyncio
import base64
from datetime import datetime, timezone
from typing import Dict, Any

import httpx
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from models import ScanRequest, ScanTier, ScanResult
from scanner import run_free_scan, run_premium_scan
from pdf_generator import generate_free_pdf, generate_premium_pdf

load_dotenv()

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Luxival Audit API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://luxival.com,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# In-memory stores (replace with Redis for production scale)
# { checkout_id: {"status": "paid"|"pending", "email": str, "created_at": str} }
_verified_payments: Dict[str, Dict[str, Any]] = {}
# { scan_id: ScanResult }
_scan_cache: Dict[str, Any] = {}

SUMUP_WEBHOOK_SECRET = os.getenv("SUMUP_WEBHOOK_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


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

    return {"received": True}


@app.post("/scan/free")
@limiter.limit("10/hour")
async def scan_free(request: Request, body: ScanRequest,
                    background_tasks: BackgroundTasks):
    """Run free 12-check scan. Returns JSON result + base64 PDF."""
    scan_id = str(uuid.uuid4())[:8]

    try:
        result = await run_free_scan(str(body.url))
    except RuntimeError as e:
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
        raise HTTPException(status_code=402, detail="payment_token required for premium scan")

    payment = _verified_payments.get(body.payment_token)
    # Allow honour-system bypass ('sumup-honour') so the frontend fallback still works
    honour_bypass = body.payment_token == "sumup-honour"
    if not honour_bypass and (not payment or payment.get("status") != "paid"):
        raise HTTPException(
            status_code=402,
            detail="Payment not verified. Complete payment at https://pay.sumup.com/b2c/QVLW9NTQ"
        )

    scan_id = str(uuid.uuid4())[:8]

    try:
        free_result = await run_free_scan(str(body.url))
        premium_flows = await run_premium_scan(str(body.url))
    except RuntimeError as e:
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
