# AI Merchant Growth Agent

> An AI-powered merchant growth agent for intelligent product discovery, personalized offers, and policy-safe decisions.

## Overview

**AI Merchant Growth Agent** is an AI-driven decision system designed to help merchants respond to customer requests intelligently.

Instead of simply matching keywords to products, the agent follows a structured decision workflow:

**Customer Intent → Product Discovery → Offer Formulation → Policy Validation → Final Decision**

Every decision is presented through a transparent **Decision Ledger**, allowing merchants to understand how and why an offer was generated.

---

## ✨ Features

### 🧠 Customer Intent Detection

Understands natural-language customer requests and extracts relevant requirements such as:

- Product category
- Budget constraints
- Customer preferences
- Purchase intent

### 🛍️ Intelligent Product Discovery

Searches the merchant catalog and identifies suitable products based on:

- Category
- Price constraints
- Inventory availability
- Customer requirements

### 💰 Personalized Offers

The agent can formulate discounts based on the customer request and selected product.

### 🛡️ Policy Validation

Every proposed offer is validated against deterministic merchant policies before being applied.

If an AI-generated discount violates a merchant policy, the system can:

- Detect the violation
- Reject the unsafe proposal
- Apply a valid fallback
- Explain why the decision was changed

### 📜 Decision Ledger

Every agent session produces a transparent sequence of decisions:

```text
Customer Request
       ↓
Intent Detected
       ↓
Catalog Searched
       ↓
Product Selected
       ↓
Offer Proposed
       ↓
Policy Validated
       ↓
Final Decision
```

This makes the agent's reasoning auditable instead of presenting the user with an unexplained AI-generated answer.

### 🌐 Interactive Landing Page

The project includes a polished landing page explaining the agent workflow through interactive sections covering:

- Customer intent
- Product discovery
- Offer formulation
- Policy validation
- Decision ledger
- Final call-to-action

### 📝 Feedback System

The landing page includes a feedback flow connected to Google Forms, allowing users and judges to submit feedback without requiring a custom email infrastructure.

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
                Valid offer          Violation
                    │                     │
                    ▼                     ▼
               Auto-approve        Apply fallback
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

- React
- TypeScript
- Vite
- CSS

## Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

## AI / Decision Layer

- Agent-based decision workflow
- Structured proposal generation
- Deterministic policy validation
- Catalog-based product selection

## Feedback

- Google Forms

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

- Python 3
- Node.js
- npm

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

---

# Backend

Open a terminal and run:

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

The Vite development server will normally run at:

```text
http://localhost:5173/
```

Open that URL in your browser.

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

The API also returns the complete decision ledger for the session.

---

# 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check |
| GET | `/api/catalog` | Retrieve product catalog |
| GET | `/api/policies` | Retrieve merchant policies |
| GET | `/api/activity` | Retrieve agent activity |
| POST | `/api/sessions/evaluate` | Evaluate a customer request |
| POST | `/api/welcome` | Welcome endpoint |

---

# 🔐 Policy-Safe AI

A core design principle of this project is:

> **AI proposes. Deterministic logic validates.**

The AI layer is not given unrestricted authority to make business decisions.

Instead:

```text
AI Proposal
     ↓
Deterministic Validation
     ↓
Policy Check
     ↓
Approved / Rejected / Fallback
```

This helps prevent an AI-generated offer from violating merchant-defined business rules.

---

# 📊 Example Decision Ledger

For a request such as:

```text
I need running shoes under ₹6000
```

the system can produce:

```text
1. Intent detected
   Customer wants running shoes under ₹6000.

2. Catalog searched
   12 products scanned, 10 in stock.

3. Product selected
   Roadster Flex — ₹5,499.

4. Offer proposed
   10% discount → ₹4,949.

5. Policy validated
   Discount is within auto-approval limits.

6. Final decision
   AUTO_APPROVED
```

The ledger makes the complete decision process visible to the user.

---

# 🎯 Why This Approach?

Traditional recommendation systems often focus primarily on:

```text
Query → Product
```

This project expands that workflow into:

```text
Customer Intent
      ↓
Product
      ↓
Offer
      ↓
Business Policy
      ↓
Decision
```

The goal is to make AI useful for actual merchant decision-making while maintaining business-rule control and transparency.

---

# 🏆 Hackathon Context

This project was developed as a hackathon build focused on creating an AI-powered merchant growth workflow.

The primary objective was to demonstrate how an AI agent can combine:

- Natural-language understanding
- Product discovery
- Offer generation
- Deterministic business rules
- Transparent decision tracking

into a single merchant-facing experience.

---

# 🧩 Core Design Principle

The project separates **AI reasoning** from **business-rule enforcement**.

The AI can recommend an action, but the final decision is checked by deterministic application logic.

```text
                ┌─────────────────┐
                │ Customer Intent │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │   AI Proposal   │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Policy Engine   │
                └────────┬────────┘
                         ↓
              ┌──────────┴──────────┐
              ↓                     ↓
           Valid                  Invalid
              ↓                     ↓
        Approve Offer        Apply Fallback
              └──────────┬──────────┘
                         ↓
                ┌─────────────────┐
                │ Decision Ledger │
                └─────────────────┘
```

This architecture improves transparency, controllability, and reliability when using AI for merchant-facing decisions.

---

# 🔮 Future Improvements

Potential future extensions include:

- Real LLM integration
- Persistent merchant databases
- Real-time inventory systems
- Shopify / WooCommerce integrations
- Merchant analytics dashboards
- Customer segmentation
- Conversion prediction
- A/B testing for offers
- Multi-agent workflows
- Authentication and merchant accounts
- Production deployment
- Automated policy configuration

---

# 📈 Example Use Cases

The agent could eventually support merchants with workflows such as:

### Budget-Constrained Shopping

> "I need running shoes under ₹6000."

The agent identifies suitable products and generates a policy-compliant offer.

### Discount Requests

> "Can you give me 20% off this product?"

The agent checks whether the requested discount is allowed by merchant policy.

### Product Discovery

> "Show me something suitable for running under ₹5000."

The agent searches the catalog and recommends an appropriate product.

### Policy Enforcement

If an AI-generated offer exceeds the merchant's configured discount limit:

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

# 🧪 Development

## Build Frontend

```bash
cd frontend
npm run build
```

A successful build should produce the production files inside:

```text
frontend/dist/
```

## Run Backend

```bash
cd backend
python3 main.py
```

## Run Frontend in Development

```bash
cd frontend
npm run dev
```

---

# 📝 Feedback

The project includes a feedback form accessible from the landing page.

Feedback can be submitted through Google Forms to collect:

- Overall experience
- Suggestions
- Issues
- Feature requests
- General feedback

---

# ⚠️ Current Limitations

This project is currently designed as a hackathon / prototype implementation.

The current backend may operate in **demo mode** rather than relying on a production LLM provider.

Additional production infrastructure would be required for:

- Persistent data
- Authentication
- Real merchant accounts
- Production inventory
- Scalable AI inference
- Secure secrets management
- Production email delivery
- Deployment infrastructure

---

# 🏁 Project Status

**Status: Completed Hackathon Prototype**

The current implementation includes:

- Interactive landing page
- Merchant workspace
- Product catalog
- Customer intent processing
- Product selection
- Offer generation
- Policy validation
- Decision Ledger
- FastAPI backend
- React + TypeScript frontend
- API documentation
- Feedback collection

---

# 👨‍💻 Author

**Aashray Biswal**

Built with love, logic & late night coffee.

---

## 📄 License

This project is currently intended as a hackathon / portfolio project.
