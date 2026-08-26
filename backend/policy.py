from pydantic import BaseModel
from typing import Optional
from models import AgentProposal, Product, MerchantPolicy

class PolicyEvaluationResult(BaseModel):
    status: str
    original_price: float
    proposed_discount: float
    applied_discount: float
    final_price: float
    is_violation: bool
    policy_limit: Optional[float] = None
    fallback_discount: Optional[float] = None
    fallback_price: Optional[float] = None
    violation_message: Optional[str] = None
    reason: str

def evaluate_proposal(
    proposal: AgentProposal, 
    product: Product, 
    policy: MerchantPolicy
) -> PolicyEvaluationResult:
    
    original_price = product.price
    proposed_discount = proposal.discount_percentage
    
    if product.inventory <= 0:
        return PolicyEvaluationResult(
            status="REJECTED",
            original_price=original_price,
            proposed_discount=proposed_discount,
            applied_discount=0.0,
            final_price=original_price,
            is_violation=True,
            violation_message=f"Product is out of stock.",
            reason="Product out of stock. Offer rejected."
        )

    if proposed_discount < 0:
        return PolicyEvaluationResult(
            status="REJECTED",
            original_price=original_price,
            proposed_discount=proposed_discount,
            applied_discount=0.0,
            final_price=original_price,
            is_violation=True,
            fallback_discount=0.0,
            fallback_price=original_price,
            violation_message="Proposed discount is negative.",
            reason="Rejected due to invalid/negative discount."
        )

    if proposed_discount > policy.max_discount_pct:
        safe_fallback_discount = policy.max_discount_pct
        safe_fallback_price = original_price * (1 - safe_fallback_discount / 100)
        
        return PolicyEvaluationResult(
            status="REJECTED",
            original_price=original_price,
            proposed_discount=proposed_discount,
            applied_discount=safe_fallback_discount,
            final_price=safe_fallback_price,
            is_violation=True,
            policy_limit=policy.max_discount_pct,
            fallback_discount=safe_fallback_discount,
            fallback_price=safe_fallback_price,
            violation_message=f"Attempted discount {proposed_discount}% exceeds maximum {policy.max_discount_pct}%.",
            reason=f"Discount exceeds limit. Fallback generated at {safe_fallback_discount}%."
        )

    applied_discount = proposed_discount
    final_price = original_price * (1 - applied_discount / 100)

    if final_price < policy.min_order_value:
        safe_discount = ((original_price - policy.min_order_value) / original_price) * 100
        if safe_discount < 0: 
            safe_discount = 0.0
            
        safe_price = original_price * (1 - safe_discount / 100)
        
        return PolicyEvaluationResult(
            status="REJECTED",
            original_price=original_price,
            proposed_discount=proposed_discount,
            applied_discount=safe_discount,
            final_price=safe_price,
            is_violation=True,
            fallback_discount=safe_discount,
            fallback_price=safe_price,
            violation_message=f"Final price {final_price} is below min order value {policy.min_order_value}.",
            reason="Price below minimum order value. Fallback discount applied."
        )

    if proposed_discount > policy.auto_approval_threshold_pct and proposed_discount <= policy.max_discount_pct:
        status = "MANUAL_APPROVAL"
        reason = "Discount exceeds auto-approval threshold and requires manual review."
    elif proposed_discount <= policy.auto_approval_threshold_pct:
        status = "AUTO_APPROVED"
        reason = "Discount within auto-approval limits."

    return PolicyEvaluationResult(
        status=status,
        original_price=original_price,
        proposed_discount=proposed_discount,
        applied_discount=applied_discount,
        final_price=final_price,
        is_violation=False,
        reason=reason
    )
