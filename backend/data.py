from models import Product, MerchantPolicy, SessionActivity
from typing import List

CATALOG: List[Product] = [
    Product(sku="RUN-001", name="Trailrunner Pro 2", price=7499.0, inventory=42, category="Shoes"),
    Product(sku="RUN-002", name="Roadster Flex", price=5499.0, inventory=18, category="Shoes"),
    Product(sku="RUN-003", name="SprintTech Lite", price=5499.0, inventory=0, category="Shoes"),
    Product(sku="RUN-004", name="UltraBoost Elite", price=12999.0, inventory=5, category="Shoes"),
    Product(sku="APP-001", name="AeroDry T-Shirt", price=1499.0, inventory=120, category="Apparel"),
    Product(sku="APP-002", name="Thermal Base Layer", price=2499.0, inventory=35, category="Apparel"),
    Product(sku="APP-003", name="Compression Tights", price=3299.0, inventory=45, category="Apparel"),
    Product(sku="ACC-001", name="Hydration Vest", price=4299.0, inventory=0, category="Accessories"),
    Product(sku="ACC-002", name="Reflective Armband", price=499.0, inventory=200, category="Accessories"),
    Product(sku="ACC-003", name="GPS Sport Watch", price=18500.0, inventory=8, category="Electronics"),
    Product(sku="EL-HP-001", name="SonicNoise Canceller Headphones", price=4500.0, inventory=20, category="Electronics"),
    Product(sku="EL-LAP-001", name="DevBook Pro Laptop", price=65000.0, inventory=5, category="Electronics")
]

POLICY = MerchantPolicy(
    max_discount_pct=20.0,
    min_order_value=500.0,
    auto_approval_threshold_pct=15.0,
    out_of_stock_behavior="suggest_alternative"
)

ACTIVITY_LOG: List[SessionActivity] = []
