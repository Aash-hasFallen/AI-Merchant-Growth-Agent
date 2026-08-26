"""
main.py — FastAPI application for the AI Merchant Growth Agent.
"""
import os
import re
import uuid
import traceback
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator

from models import Product, LedgerStep, SessionActivity
from data import CATALOG, POLICY, ACTIVITY_LOG
from agent import generate_agent_proposal, AgentError, LLM_MODE
from policy import evaluate_proposal
from email_service import send_welcome_email, EmailServiceError, is_configured as email_is_configured

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app = FastAPI(title="AI Merchant Growth Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class EvaluateRequest(BaseModel):
    customer_request: str


class WelcomeEmailRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip()
        if not EMAIL_PATTERN.match(value):
            raise ValueError("Invalid email address.")
        return value


class WelcomeEmailResponse(BaseModel):
    status: str  # "sent" | "skipped"
    message: str

class ViolationInfo(BaseModel):
    attempted_discount: float
    policy_limit: float
    fallback_discount: float
    fallback_price: float
    message: str

class SessionResult(BaseModel):
    session_id: str
    timestamp: str
    customer_request: str
    llm_mode: str
    selected_product: dict
    original_price: float
    proposed_discount: float
    applied_discount: float
    final_price: float
    status: str
    reason: str
    is_violation: bool
    violation_info: Optional[ViolationInfo] = None
    ledger_steps: List[LedgerStep]

def build_ledger(customer_request: str, proposal, product: Product, policy_result) -> List[LedgerStep]:
    steps = []
    steps.append(LedgerStep(id="s1", label="Intent detected", detail=customer_request[:120]))
    in_stock_count = sum(1 for p in CATALOG if p.inventory > 0)
    steps.append(LedgerStep(id="s2", label="Catalog searched", detail=f"{len(CATALOG)} products scanned, {in_stock_count} in stock"))
    steps.append(LedgerStep(id="s3", label="Product selected", detail=f"{product.name} — ₹{product.price:,.0f} ({product.inventory} units in stock)"))
    steps.append(LedgerStep(id="s4", label="Offer proposed", detail=f"{policy_result.proposed_discount:.0f}% → ₹{product.price * (1 - policy_result.proposed_discount / 100):,.0f}  |  {proposal.rationale}"))
    
    if policy_result.is_violation:
        steps.append(LedgerStep(
            id="s5",
            label="Policy validated",
            detail=policy_result.reason,
            is_violation=True,
            violation_data={
                "attempted": f"{policy_result.proposed_discount:.0f}%",
                "limit": f"{policy_result.policy_limit:.0f}%" if policy_result.policy_limit else "N/A",
                "message": policy_result.violation_message or "",
            },
        ))
    else:
        steps.append(LedgerStep(id="s5", label="Policy validated", detail=policy_result.reason))

    if policy_result.status == "REJECTED" and policy_result.fallback_discount is not None:
        steps.append(LedgerStep(id="s6", label="Fallback generated", detail=f"Safe offer: {policy_result.fallback_discount:.0f}% → ₹{policy_result.fallback_price:,.0f}"))

    return steps

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s", traceback.format_exc())
    return JSONResponse(status_code=500, content={"error": "internal_server_error", "detail": "An unexpected error occurred."})

@app.get("/health")
def health(): return {"status": "ok", "llm_mode": LLM_MODE}

@app.get("/api/catalog", response_model=List[Product])
def get_catalog(): return CATALOG

@app.get("/api/policies")
def get_policies(): return POLICY

@app.get("/api/activity")
def get_activity(): return list(reversed(ACTIVITY_LOG))[:50]

@app.post("/api/sessions/evaluate", response_model=SessionResult)
def evaluate_session(req: EvaluateRequest):
    session_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now(timezone.utc).isoformat()

    try:
        proposal = generate_agent_proposal(req.customer_request, CATALOG)
    except AgentError as e:
        if e.error_code in ("no_suitable_product", "invalid_sku"):
            return SessionResult(
                session_id=session_id, timestamp=timestamp, customer_request=req.customer_request,
                llm_mode=LLM_MODE, selected_product={}, original_price=0.0, proposed_discount=0.0,
                applied_discount=0.0, final_price=0.0, status="REJECTED", reason=e.message, is_violation=False,
                ledger_steps=[
                    LedgerStep(id="s1", label="Intent detected", detail=req.customer_request[:120]),
                    LedgerStep(id="s2", label="No product found", detail=e.message, is_violation=False)
                ]
            )
        return JSONResponse(status_code=503, content={"error": e.error_code, "detail": "The AI agent encountered an error."})

    product = next((p for p in CATALOG if p.sku == proposal.sku), None)
    policy_result = evaluate_proposal(proposal, product, POLICY)
    ledger_steps = build_ledger(req.customer_request, proposal, product, policy_result)
    
    violation_info = None
    if policy_result.is_violation and policy_result.fallback_discount is not None:
        violation_info = ViolationInfo(
            attempted_discount=policy_result.proposed_discount,
            policy_limit=policy_result.policy_limit or POLICY.max_discount_pct,
            fallback_discount=policy_result.fallback_discount,
            fallback_price=policy_result.fallback_price,
            message=policy_result.violation_message or ""
        )

    ACTIVITY_LOG.append(SessionActivity(session_id=session_id, timestamp=datetime.fromisoformat(timestamp), customer_intent=req.customer_request, status=policy_result.status, ledger_steps=ledger_steps))

    return SessionResult(
        session_id=session_id, timestamp=timestamp, customer_request=req.customer_request, llm_mode=LLM_MODE,
        selected_product={"sku": product.sku, "name": product.name, "category": product.category, "inventory": product.inventory},
        original_price=policy_result.original_price, proposed_discount=policy_result.proposed_discount,
        applied_discount=policy_result.applied_discount, final_price=policy_result.final_price, status=policy_result.status,
        reason=policy_result.reason, is_violation=policy_result.is_violation, violation_info=violation_info, ledger_steps=ledger_steps
    )

@app.post("/api/welcome", response_model=WelcomeEmailResponse)
def submit_welcome_email(req: WelcomeEmailRequest):
    """
    Sends the "Welcome to AI Merchant Growth Agent" email.

    Email format is validated by WelcomeEmailRequest's field_validator —
    FastAPI turns a validation failure into a 422 automatically, so no
    manual re-check is needed here.

    This never raises: if SMTP isn't configured, or the send fails, we
    return a "skipped" result rather than a 500 — the frontend can still
    tell the person their address was recorded, without pretending an
    email actually went out. No SMTP host/credential/error detail is ever
    included in the response; failures are logged server-side only
    (see email_service.py).
    """
    if not email_is_configured():
        logger.info("Welcome email requested for %s but SMTP is not configured; skipping.", req.email)
        return WelcomeEmailResponse(
            status="skipped",
            message="Thanks — you're noted. Email delivery isn't configured on this deployment yet.",
        )

    try:
        send_welcome_email(req.email)
    except EmailServiceError:
        return WelcomeEmailResponse(
            status="skipped",
            message="Thanks — you're noted. We couldn't send the confirmation email right now.",
        )

    return WelcomeEmailResponse(status="sent", message="Welcome email sent.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
