from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

class Product(BaseModel):
    sku: str
    name: str
    price: float
    inventory: int
    category: str

class MerchantPolicy(BaseModel):
    max_discount_pct: float = Field(default=20.0, ge=0.0, le=100.0)
    min_order_value: float = Field(default=500.0, ge=0.0)
    auto_approval_threshold_pct: float = Field(default=15.0, ge=0.0, le=100.0)
    out_of_stock_behavior: str = Field(default="suggest_alternative")

class LedgerStep(BaseModel):
    id: str
    label: str
    detail: str
    is_violation: bool = False
    violation_data: Optional[Dict[str, Any]] = None

class SessionActivity(BaseModel):
    session_id: str
    timestamp: datetime
    customer_intent: str
    status: str
    ledger_steps: List[LedgerStep]

class AgentProposal(BaseModel):
    sku: str
    discount_percentage: float = Field(ge=0.0)
    rationale: str
