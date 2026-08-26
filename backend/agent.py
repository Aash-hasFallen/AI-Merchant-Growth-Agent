"""
agent.py — LLM integration layer with deterministic price parsing and post-LLM guardrails.
"""
import os
import json
import logging
import re
from typing import List, Tuple, Optional
from pydantic import ValidationError
from models import AgentProposal, Product

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
LLM_MODE = "real" if GEMINI_API_KEY else "demo"

class AgentError(Exception):
    def __init__(self, message: str, error_code: str):
        super().__init__(message)
        self.error_code = error_code
        self.message = message

def parse_customer_intent(customer_request: str) -> Tuple[Optional[str], Optional[float]]:
    request_lower = customer_request.lower()

    max_price = None
    price_match = re.search(
        r"(?:under|below|less\s+than|within|max|upto|up\s+to|around)\s*(?:₹|rs\.?|rs|inr)?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(k|grand)?[^a-z0-9]",
        request_lower + " ",
        re.IGNORECASE
    )
    if not price_match:
        price_match = re.search(
            r"(?:under|below|less\s+than|within|max|upto|up\s+to|around)\s*(?:₹|rs\.?|rs|inr)?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(k|grand)?",
            request_lower,
            re.IGNORECASE
        )

    if price_match:
        base_val = float(price_match.group(1).replace(",", ""))
        multiplier = price_match.group(2)
        if multiplier:
            m_lower = multiplier.lower()
            if m_lower in ('k', 'grand'):
                base_val *= 1000
        max_price = base_val

    category_map = {
        "Shoes": ["shoe", "shoes", "running", "runner", "sneaker", "sneakers", "boot", "boots", "footwear"],
        "Apparel": ["apparel", "shirt", "shirts", "t-shirt", "tee", "tights", "clothing"],
        "Accessories": ["accessory", "accessories", "vest", "hydration", "armband"],
        "Electronics": ["electronics", "electronic", "watch", "watches", "gps", "gadget", "device", "laptop", "laptops", "headphone", "headphones", "earbud", "earbuds"]
    }

    matched_category = None
    for cat, keywords in category_map.items():
        if any(re.search(rf"\b{kw}\b", request_lower) for kw in keywords):
            matched_category = cat
            break

    return matched_category, max_price

def _build_prompt(customer_request: str, catalog: List[Product]) -> str:
    catalog_text = "\n".join(
        f"  - SKU: {p.sku} | Name: {p.name} | Price: ₹{p.price:,.0f} "
        f"| Inventory: {p.inventory} units | Category: {p.category}"
        for p in catalog
    )
    return f"""You are a merchant growth agent. Your only job is to analyze
the customer's request and select the single best product from the catalog below,
then propose a discount to close the sale.

RULES:
- You must ONLY select a SKU from the catalog below. Never invent products or SKUs.
- Select the product that best matches the customer's needs.
- If the customer states a maximum price, only consider products at or below that price.
- You may propose any reasonable discount percentage as a number between 0 and 100.
- If no product in the catalog matches, respond with:
  {{"error": "no_suitable_product", "reason": "<brief explanation>"}}

CATALOG:
{catalog_text}

CUSTOMER REQUEST:
"{customer_request}"

Respond with ONLY a JSON object:
{{"sku": "<SKU>", "discount_percentage": <number>, "rationale": "<reason>"}}
"""

def _call_llm(prompt: str) -> dict:
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        raise AgentError("google-genai package is not installed.", "llm_import_error")

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
    except Exception as e:
        raise AgentError(f"LLM API call failed: {e}", "llm_api_error")

    raw_text = response.text.strip() if response.text else ""
    if not raw_text:
        raise AgentError("LLM returned an empty response.", "llm_empty_response")
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise AgentError(f"LLM returned malformed JSON: {e}", "llm_malformed_json")

def _demo_proposal(customer_request: str, catalog: List[Product]) -> dict:
    matched_category, max_price = parse_customer_intent(customer_request)
    request_lower = customer_request.lower()

    eligible = [
        p for p in catalog
        if p.inventory > 0
        and (not matched_category or p.category.lower() == matched_category.lower())
        and (max_price is None or p.price <= max_price)
    ]

    if not eligible:
        return {"error": "no_suitable_product", "reason": "No in-stock products match constraints."}

    discount_match = re.search(r'(\d+)%\s*discount', request_lower)
    proposed_discount = float(discount_match.group(1)) if discount_match else 10.0

        # Product-specific intent matching.
    # Category matching alone is not enough because multiple products
    # can belong to the same category (e.g. headphones + laptop = Electronics).
    product_keywords = {
        "laptop": ["laptop", "laptops"],
        "headphones": ["headphone", "headphones", "earbud", "earbuds"],
        "shoes": [
            "shoe", "shoes", "running", "runner",
            "sneaker", "sneakers", "boot", "boots", "footwear"
        ],
        "shirts": ["shirt", "shirts", "t-shirt", "tee"],
        "tights": ["tights"],
        "watch": ["watch", "watches", "gps"],
        "vest": ["vest", "hydration"],
        "armband": ["armband"],
    }

    requested_product_terms = []

    for product_type, keywords in product_keywords.items():
        if any(
            re.search(rf"\b{re.escape(keyword)}\b", request_lower)
            for keyword in keywords
        ):
            requested_product_terms.append(product_type)

    # If the user explicitly requested a product type,
    # prefer products whose names match that product type.
    if requested_product_terms:
        product_matched = [
            p for p in eligible
            if any(
                re.search(
                    rf"\b{re.escape(keyword)}\b",
                    p.name.lower()
                )
                for product_type in requested_product_terms
                for keyword in product_keywords[product_type]
            )
        ]

        if product_matched:
            eligible = product_matched

    # Among products matching the user's specific intent,
    # choose the cheapest eligible product.
    best = min(eligible, key=lambda p: p.price)

    return {
        "sku": best.sku,
        "discount_percentage": proposed_discount,
        "rationale": f"{best.name} matches your requirements.",
    }

def _validate_and_build_proposal(raw: dict, catalog: List[Product], customer_request: str) -> AgentProposal:
    if "error" in raw:
        raise AgentError(raw.get("reason", "No suitable product found."), "no_suitable_product")

    catalog_skus = {p.sku for p in catalog}
    proposed_sku = raw.get("sku", "")
    if proposed_sku not in catalog_skus:
        raise AgentError(f"Model proposed unknown SKU '{proposed_sku}'.", "invalid_sku")

    product = next((p for p in catalog if p.sku == proposed_sku), None)
    if not product:
        raise AgentError(f"Proposed SKU '{proposed_sku}' not found in catalog.", "invalid_sku")

    if product.inventory <= 0:
        raise AgentError(f"Proposed product {product.name} is out of stock.", "no_suitable_product")

    matched_category, max_price = parse_customer_intent(customer_request)

    if matched_category and product.category.lower() != matched_category.lower():
        raise AgentError(f"Proposed product category '{product.category}' does not match requested category '{matched_category}'.", "no_suitable_product")

    if max_price is not None and product.price > max_price:
        raise AgentError(f"Proposed product price ₹{product.price:,.0f} exceeds customer maximum price of ₹{max_price:,.0f}.", "no_suitable_product")

    try:
        proposal = AgentProposal(**raw)
    except ValidationError as e:
        raise AgentError(f"AgentProposal validation failed: {e}", "proposal_validation_error")

    return proposal

def generate_agent_proposal(customer_request: str, catalog: List[Product]) -> AgentProposal:
    if LLM_MODE == "real":
        raw = _call_llm(_build_prompt(customer_request, catalog))
    else:
        raw = _demo_proposal(customer_request, catalog)
    return _validate_and_build_proposal(raw, catalog, customer_request)
