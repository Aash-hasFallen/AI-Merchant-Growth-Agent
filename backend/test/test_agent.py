import pytest
from fastapi.testclient import TestClient

from main import app
from data import CATALOG
from agent import _validate_and_build_proposal, AgentError


client = TestClient(app)


def test_shoes_under_6000():
    resp = client.post(
        "/api/sessions/evaluate",
        json={"customer_request": "I need running shoes under ₹6000"},
    )
    data = resp.json()

    assert data["status"] == "AUTO_APPROVED"
    assert data["selected_product"]["sku"] == "RUN-002"


def test_headphones_under_5000():
    resp = client.post(
        "/api/sessions/evaluate",
        json={"customer_request": "Find headphones under ₹5000"},
    )
    data = resp.json()

    assert data["status"] == "AUTO_APPROVED"
    assert data["selected_product"]["sku"] == "EL-HP-001"


def test_impossible_request_1_rupee():
    resp = client.post(
        "/api/sessions/evaluate",
        json={"customer_request": "I need running shoes under ₹1"},
    )
    data = resp.json()

    assert data["status"] == "REJECTED"


def test_laptop_under_70000():
    resp = client.post(
        "/api/sessions/evaluate",
        json={"customer_request": "Find a laptop under ₹70000"},
    )
    data = resp.json()

    assert data["selected_product"]["sku"] == "EL-LAP-001"


def test_price_formats_parsing():
    requests = [
        "Find headphones under Rs. 5000",
        "Find headphones under Rs 5000",
        "Find headphones under ₹5,000",
        "Find headphones under 5k",
        "Find headphones under 5 grand",
        "Find running shoes under ₹7,000",
    ]

    for request in requests:
        resp = client.post(
            "/api/sessions/evaluate",
            json={"customer_request": request},
        )
        assert resp.status_code == 200


def test_guardrail_violation_price():
    raw_proposal = {
        "sku": "RUN-002",
        "discount_percentage": 10.0,
        "rationale": "Attempting bypass",
    }

    with pytest.raises(AgentError) as excinfo:
        _validate_and_build_proposal(
            raw_proposal,
            CATALOG,
            "I need running shoes under ₹1",
        )

    assert excinfo.value.error_code == "no_suitable_product"


def test_guardrail_violation_category():
    raw_proposal = {
        "sku": "RUN-002",
        "discount_percentage": 10.0,
        "rationale": "Wrong category bypass",
    }

    with pytest.raises(AgentError) as excinfo:
        _validate_and_build_proposal(
            raw_proposal,
            CATALOG,
            "Find headphones under ₹5000",
        )

    assert excinfo.value.error_code == "no_suitable_product"