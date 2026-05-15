from pydantic import BaseModel, HttpUrl, EmailStr
from typing import Optional, List, Dict, Any
from enum import Enum


class ScanTier(str, Enum):
    free = "free"
    premium = "premium"


class ScanRequest(BaseModel):
    url: str
    email: EmailStr
    tier: ScanTier = ScanTier.free
    payment_token: Optional[str] = None  # SumUp checkout ID for premium


class CheckResult(BaseModel):
    id: str
    label: str
    status: str  # "pass" | "fail" | "warn" | "info"
    detail: str
    score: int  # 0 or 1


class FlowResult(BaseModel):
    flow_id: str
    flow_name: str
    score: int
    max_score: int
    checks: List[CheckResult]


class ScanResult(BaseModel):
    url: str
    email: str
    tier: ScanTier
    overall_score: int
    max_score: int
    page_title: Optional[str]
    free_checks: List[CheckResult]
    premium_flows: Optional[List[FlowResult]] = None
    performance: Optional[Dict[str, Any]] = None
    pdf_url: Optional[str] = None
    scan_id: str
    created_at: str


class SumUpWebhook(BaseModel):
    event_type: str
    payload: Dict[str, Any]
