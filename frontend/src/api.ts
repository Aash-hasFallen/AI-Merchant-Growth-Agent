export interface Product {
  sku: string;
  name: string;
  price: number;
  inventory: number;
  category: string;
}

export interface MerchantPolicy {
  max_discount_pct: number;
  min_order_value: number;
  auto_approval_threshold_pct: number;
  out_of_stock_behavior: string;
}

export interface LedgerStep {
  id: string;
  label: string;
  detail: string;
  is_violation: boolean;
  violation_data: {
    attempted: string;
    limit: string;
    message: string;
  } | null;
}

export interface ViolationInfo {
  attempted_discount: number;
  policy_limit: number;
  fallback_discount: number;
  fallback_price: number;
  message: string;
}

export interface SessionResult {
  session_id: string;
  timestamp: string;
  customer_request: string;
  llm_mode: string;
  selected_product: {
    sku: string;
    name: string;
    category: string;
    inventory: number;
  };
  original_price: number;
  proposed_discount: number;
  applied_discount: number;
  final_price: number;
  status: 'AUTO_APPROVED' | 'MANUAL_APPROVAL' | 'REJECTED';
  reason: string;
  is_violation: boolean;
  violation_info: ViolationInfo | null;
  ledger_steps: LedgerStep[];
}

export interface ActivityEntry {
  session_id: string;
  timestamp: string;
  customer_intent: string;
  status: string;
  ledger_steps: LedgerStep[];
}

export interface WelcomeEmailResponse {
  status: 'sent' | 'skipped';
  message: string;
}
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://ai-merchant-growth-agent-api.onrender.com';
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  
  const res = await fetch(`${API_BASE_URL}${url}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getCatalog: () => apiFetch<Product[]>('/api/catalog'),
  getPolicies: () => apiFetch<MerchantPolicy>('/api/policies'),
  getActivity: () => apiFetch<ActivityEntry[]>('/api/activity'),
  evaluateSession: (customerRequest: string) =>
    apiFetch<SessionResult>('/api/sessions/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_request: customerRequest }),
    }),
  submitWelcomeEmail: (email: string) =>
    apiFetch<WelcomeEmailResponse>('/api/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),
};
