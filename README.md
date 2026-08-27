# AI Merchant Growth Agent

> An AI-powered merchant growth agent that turns customer intent into personalized, policy-safe offers while keeping every decision explainable, bounded, and gated.

**Built for Razorpay AI Buildathon 2026 — Track 01: AI Growth & Agentic Commerce**

---

## 🚀 Overview

**AI Merchant Growth Agent** is an agentic commerce prototype designed to help merchants convert customer requests into intelligent product recommendations and personalized offers.

Instead of simply matching a query to a product, the agent follows a structured decision workflow:

**Customer Intent → Product Discovery → Offer Formulation → Policy Validation → Final Decision**

The key design principle is:

> **AI proposes. Deterministic logic validates.**

The AI can formulate an offer, but it does not have unrestricted authority over business decisions. Every proposed offer is checked against merchant-defined policies before it can be approved.

A transparent **Decision Ledger** records each step so merchants can understand what the agent decided, why it decided it, and whether any policy violations were detected.

---

## 🎯 What Problem Does It Solve?

Merchants often have to manually handle customer requests, product discovery, discounts, and offer decisions. This can lead to:

* Inconsistent offers
* Missed conversion opportunities
* Discounts that exceed merchant limits
* Recommendations for unavailable products
* Lack of visibility into why an AI made a particular decision

The AI Merchant Growth Agent automates this workflow while keeping merchant policies in control.

---

## 💡 How It Works

```text
Customer Request
       ↓
Intent Detection
       ↓
Product Discovery
       ↓
Offer Formulation
       ↓
Policy Validation
       ↓
 ┌───────────────┐
 │               │
Valid          Violation
 │               │
 ↓               ↓
Approve       Fallback
 │               │
 └───────┬───────┘
         ↓
  Decision Ledger
         ↓
   Final Decision
```

### Example

**Customer:**

> "I need running shoes under ₹6000."

The agent:

1. Understands the customer's intent and budget.
2. Searches the merchant catalog.
3. Identifies a suitable in-stock product.
4. Formulates a personalized offer.
5. Validates the proposed discount against merchant policies.
6. Records every step in the Decision Ledger.
7. Returns the final approved or fallback offer.

---

# ✨ Key Features

## 🧠 Customer Intent Detection

Understands natural-language customer requests and extracts relevant requirements such as:

* Product category
* Budget constraints
* Customer preferences
* Purchase intent

---

## 🛍️ Intelligent Product Discovery

Searches the merchant catalog and identifies suitable products based on:

* Product category
* Price constraints
* Inventory availability
* Customer requirements

---

## 💰 Personalized Offer Formulation

The agent can formulate an offer based on:

* Customer requirements
* Selected product
* Merchant-defined discount limits
* Order value
* Applicable business rules

---

## 🛡️ Policy Validation

Every AI-generated proposal passes through deterministic validation before being accepted.

The policy engine can check:

* Maximum discount percentage
* Minimum order value
* Automatic approval thresholds
* Product inventory
* Out-of-stock behavior

If a proposal violates a merchant policy, the system can:

* Detect the violation
* Reject the unsafe proposal
* Apply a valid fallback
* Record the violation
* Explain why the final decision changed

---

## 📜 Decision Ledger

Every agent session produces a transparent sequence of decisions:

```text
1. Customer Request
       ↓
2. Intent Detected
       ↓
3. Catalog Searched
       ↓
4. Product Selected
       ↓
5. Offer Proposed
       ↓
6. Policy Validated
       ↓
7. Final Decision
```

The ledger makes the decision process auditable rather than presenting the merchant with an unexplained AI recommendation.

---

# 🔐 Explainable, Bounded & Gated AI

The system is designed around a simple principle:

> **AI proposes. Deterministic logic validates.**

```text
             AI Proposal
                  ↓
        Deterministic Validation
                  ↓
             Policy Check
                  ↓
          ┌───────┴───────┐
          ↓               ↓
       Valid           Invalid
          ↓               ↓
      Approve          Fallback
          └───────┬───────┘
                  ↓
          Decision Ledger
```

This separation ensures that the AI does not have unrestricted authority over merchant business rules.

### Explainable

Every decision is accompanied by a clear sequence of actions and reasons.

### Bounded

The agent operates within merchant-defined constraints such as discount and order-value limits.

### Gated

A proposed money-related action must pass deterministic policy validation before it can be approved.

This directly supports the Track 01 requirement that money actions should be **explainable, bounded, and gated**.

---

# 🏗️ Architecture

```text
                         Customer Request
                                │
                                ▼
                     ┌────────────────────┐
                     │   Intent Detection │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │ Product Discovery  │
                     │   & Catalog Search │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │ Offer Formulation  │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │ Policy Validation  │
                     └─────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                 Valid                 Violation
                    │                     │
                    ▼                     ▼
               Auto-approve          Apply Fallback
                    │                     │
                    └──────────┬──────────┘
                               ▼
                     ┌────────────────────┐
                     │  Decision Ledger   │
                     └────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* CSS

## Backend

* Python
* FastAPI
* Uvicorn
* Pydantic

## AI / Decision Layer

* Agent-based decision workflow
* Structured proposal generation
* Deterministic policy validation
* Catalog-based product selection
* Decision Ledger

## Feedback

* Google Forms

---

# 📁 Project Structure

```text
merchant-growth-agent/
│
├── backend/
│   ├── agent.py
│   ├── data.py
│   ├── email_service.py
│   ├── main.py
│   ├── models.py
│   ├── policy.py
│   └── tests/
│       └── test_agent.py
│
├── frontend/
│   ├── src/
│   │   ├── landing/
│   │   │   ├── FinalCTA.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── IntentStory.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LedgerStory.tsx
│   │   │   ├── Nav.tsx
│   │   │   ├── OfferStory.tsx
│   │   │   ├── PolicyStory.tsx
│   │   │   ├── ProductDiscovery.tsx
│   │   │   ├── Reveal.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── WelcomeEmailModal.tsx
│   │   │   ├── landing.css
│   │   │   └── useReveal.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── AppShell.tsx
│   │   ├── api.ts
│   │   ├── components.tsx
│   │   ├── DecisionLedger.tsx
│   │   ├── main.tsx
│   │   ├── pages.tsx
│   │   ├── styles.css
│   │   └── theme.ts
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Python 3
* Node.js
* npm

---

## 1. Clone the Repository

```bash
git clone https://github.com/Aash-hasFallen/AI-Merchant-Growth-Agent.git
cd AI-Merchant-Growth-Agent
```

---

# Backend

Open a terminal:

```bash
cd backend
python3 main.py
```

The FastAPI server runs on:

```text
http://127.0.0.1:8001
```

### Check the Backend

```bash
curl http://127.0.0.1:8001/health
```

Expected response:

```json
{
  "status": "ok",
  "llm_mode": "demo"
}
```

### API Documentation

FastAPI automatically provides interactive API documentation at:

```text
http://127.0.0.1:8001/docs
```

---

# Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173/
```

Open the URL in your browser.

---

# 🧪 Testing the Agent

The agent can be tested directly through the API.

Example:

```bash
curl -X POST http://127.0.0.1:8001/api/sessions/evaluate \
  -H "Content-Type: application/json" \
  -d '{"customer_request":"I need running shoes under ₹6000"}'
```

Example decision:

```text
Customer Request:
I need running shoes under ₹6000

Product Selected:
Roadster Flex

Original Price:
₹5,499

Proposed Discount:
10%

Final Price:
₹4,949.10

Status:
AUTO_APPROVED
```

The API also returns the complete Decision Ledger for the session.

---

# 🔌 API Endpoints

| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| GET    | `/health`                | Backend health check        |
| GET    | `/api/catalog`           | Retrieve product catalog    |
| GET    | `/api/policies`          | Retrieve merchant policies  |
| GET    | `/api/activity`          | Retrieve agent activity     |
| POST   | `/api/sessions/evaluate` | Evaluate a customer request |
| POST   | `/api/welcome`           | Welcome endpoint            |

---

# 📊 Example Decision Ledger

For:

```text
I need running shoes under ₹6000
```

The system can produce:

```text
1. Intent detected
   Customer wants running shoes under ₹6000.

2. Catalog searched
   Suitable products identified from the merchant catalog.

3. Product selected
   Roadster Flex — ₹5,499.

4. Offer proposed
   10% discount → ₹4,949.

5. Policy validated
   Discount is within the merchant's configured limits.

6. Final decision
   AUTO_APPROVED
```

The ledger exposes the complete decision path instead of hiding it behind a single AI response.

---

# ⚠️ Graceful Failure Handling

The agent is designed to handle policy violations and unsuitable requests safely.

For example:

```text
Requested Discount: 25%
Merchant Policy Limit: 15%

        ↓

Policy Violation Detected

        ↓

Unsafe Proposal Rejected

        ↓

Fallback Discount: 15%

        ↓

Final Offer Generated

        ↓

Decision Ledger Records The Change
```

This prevents an AI-generated proposal from bypassing merchant-defined business rules.

---

# 🎯 Why This Approach?

Traditional recommendation systems often focus on:

```text
Customer Query
      ↓
Product
```

This project expands the workflow into:

```text
Customer Intent
      ↓
Product
      ↓
Offer
      ↓
Merchant Policy
      ↓
Final Decision
```

The goal is to combine AI-driven customer understanding with deterministic business-rule enforcement, allowing merchants to automate growth opportunities without giving an AI unrestricted control over business decisions.

---

# 🏆 Hackathon Context

**AI Merchant Growth Agent** was developed for **Razorpay AI Buildathon 2026 — Track 01: AI Growth & Agentic Commerce**.

The project focuses on the merchant-growth side of agentic commerce by enabling an AI agent to:

* Understand customer intent
* Discover relevant products
* Formulate personalized offers
* Apply merchant-defined policies
* Prevent unsafe or invalid offers
* Provide an explainable decision trail

The architecture is specifically designed around the principle that every money-related action should be **explainable, bounded, and gated**.

---

# 🔮 Future Improvements

Potential extensions include:

* Real-time LLM integration
* Razorpay test-mode commerce actions
* Persistent merchant databases
* Real-time inventory systems
* Shopify / WooCommerce integrations
* Merchant analytics
* Customer segmentation
* Conversion prediction
* A/B testing for offers
* Multi-agent workflows
* Authentication and merchant accounts
* Production deployment
* Automated policy configuration

---

# 📈 Example Use Cases

## Budget-Constrained Shopping

> "I need running shoes under ₹6000."

The agent identifies suitable products and generates a policy-compliant offer.

## Discount Requests

> "Can you give me 20% off this product?"

The agent evaluates the requested discount against merchant policy before approving or modifying the offer.

## Product Discovery

> "Show me something suitable for running under ₹5000."

The agent searches the catalog and recommends an appropriate product based on the request.

## Policy Enforcement

If an AI-generated offer exceeds the merchant's configured limit:

```text
Requested Discount: 25%
Policy Limit: 15%

        ↓

Violation Detected

        ↓

Fallback Discount: 15%

        ↓

Final Offer Generated
```

---

# ⚠️ Current Limitations

This project is currently a **hackathon prototype** rather than a production commerce system.

The current implementation may operate in **demo mode** rather than relying on a production LLM provider.

Production deployment would require additional infrastructure for:

* Persistent data
* Authentication
* Real merchant accounts
* Production inventory systems
* Scalable AI inference
* Secure secrets management
* Production communication channels
* Payment/commerce integrations

---

# 🏁 Project Status

**Status: Completed Hackathon Prototype**

The current implementation includes:

* Interactive landing page
* Merchant workspace
* Product catalog
* Customer intent processing
* Product selection
* Offer generation
* Policy validation
* Decision Ledger
* FastAPI backend
* React + TypeScript frontend
* API documentation
* Feedback collection
* Automated backend tests

---

# 👨‍💻 Author

**Aashray Biswal**

Built with love, logic & late-night coffee.

---

## 📄 License

This project is currently intended as a hackathon / portfolio project.
