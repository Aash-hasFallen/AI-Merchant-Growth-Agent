import React, { useState, useEffect } from 'react';
import { MetricTile, DataTable, StatusPill, Card, PolicyRuleRow, Button, EmptyState, ErrorBanner, Skeleton } from './components';
import { DecisionLedger, type LedgerStepData } from './DecisionLedger';
import type { Page } from './AppShell';
import { api, type Product, type MerchantPolicy, type ActivityEntry, type SessionResult, type LedgerStep } from './api';

function toLedgerStepData(steps: LedgerStep[]): LedgerStepData[] {
  return steps.map((s) => ({
    id: s.id,
    label: s.label,
    detail: s.detail,
    isViolation: s.is_violation,
    violationData: s.violation_data
      ? {
          attempted: s.violation_data.attempted,
          limit: s.violation_data.limit,
          applied: '',
          message: s.violation_data.message,
        }
      : undefined,
  }));
}

function statusToType(status: string): 'approved' | 'rejected' | 'pending' {
  if (status === 'AUTO_APPROVED' || status === 'MANUAL_APPROVAL') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
}

function statusToFinalAction(status: string): 'APPROVED' | 'REJECTED' {
  return status === 'REJECTED' ? 'REJECTED' : 'APPROVED';
}

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export const Overview: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.getActivity()
      .then(setActivity)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const sessions = activity.length;
  const approved = activity.filter(a => a.status !== 'REJECTED').length;
  const acceptPct = sessions > 0 ? ((approved / sessions) * 100).toFixed(1) : '—';

  type OverviewRow = { id: string; time: string; session: string; action: string; status: 'approved' | 'rejected' | 'pending' };

  const tableData: OverviewRow[] = activity.slice(0, 5).map((a) => ({
    id: a.session_id,
    time: new Date(a.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    session: `Session #${a.session_id.slice(0, 6)}`,
    action: 'Offer generation',
    status: statusToType(a.status),
  }));

  const columns = [
    { header: 'Time', accessor: (row: OverviewRow) => <span className="t-mono">{row.time}</span> },
    { header: 'Session', accessor: (row: OverviewRow) => row.session },
    { header: 'Action', accessor: (row: OverviewRow) => row.action },
    { header: 'Status', accessor: (row: OverviewRow) => <StatusPill status={row.status} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div className="metric-grid">
        <MetricTile title="Sessions" value={sessions > 0 ? String(sessions) : '—'} />
        <MetricTile title="Accept %" value={acceptPct !== '—' ? `${acceptPct}%` : '—'} />
        <MetricTile title="AOV" value="₹4,250" trend={{ value: '12%', isPositive: true }} />
        <MetricTile title="Uplift" value="+18%" trend={{ value: '2.4%', isPositive: true }} />
        <MetricTile title="Revenue" value="₹3.2M" trend={{ value: '15%', isPositive: true }} />
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
          <h2 className="t-section-heading">Recent agent activity</h2>
          <Button variant="secondary" onClick={() => onNavigate('Activity')}>View all →</Button>
        </div>
        {error && <ErrorBanner message={`Could not load activity: ${error}`} onRetry={load} />}
        {loading && <Skeleton height="120px" />}
        {!loading && !error && tableData.length === 0 && (
          <EmptyState message="No sessions yet. Submit a customer request on the Sessions page." />
        )}
        {!loading && !error && tableData.length > 0 && (
          <DataTable columns={columns} data={tableData} getRowId={(r) => r.id} />
        )}
      </Card>
    </div>
  );
};

export const Sessions: React.FC = () => {
  const [customerRequest, setCustomerRequest] = useState('');
  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [result, setResult] = useState<SessionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const submit = async () => {
    const req = customerRequest.trim();
    if (!req || sessionState === 'running') return;

    setSessionState('running');
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await api.evaluateSession(req);
      setResult(res);
      setSessionState('completed');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setErrorMsg(msg);
      setSessionState('error');
    }
  };

  const reset = () => {
    setSessionState('idle');
    setResult(null);
    setErrorMsg(null);
  };

  const ledgerSteps: LedgerStepData[] = result
    ? toLedgerStepData(result.ledger_steps).map((s) => {
        if (s.isViolation && s.violationData && result.violation_info) {
          return {
            ...s,
            violationData: {
              ...s.violationData,
              applied: `${result.violation_info.fallback_discount}% → ${fmt(result.violation_info.fallback_price)}`,
            },
          };
        }
        return s;
      })
    : [];

  const finalAction = result ? statusToFinalAction(result.status) : 'APPROVED';

  return (
    <div className="sessions-layout">
      <div className="sessions-left" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Card elevated>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <span className="t-eyebrow" style={{ color: 'var(--color-text-secondary)' }}>Customer intent</span>
            {result && <span className="t-caption">Session #{result.session_id.slice(0, 6)}</span>}
          </div>

          <textarea
            value={customerRequest}
            onChange={(e) => setCustomerRequest(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="e.g. I need running shoes under ₹8,000"
            disabled={sessionState === 'running'}
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-body)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-canvas)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
              marginBottom: 'var(--space-3)',
              boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Button
              variant="primary"
              onClick={submit}
              loading={sessionState === 'running'}
              disabled={!customerRequest.trim() || sessionState === 'running'}
              style={{ flex: 1 }}
            >
              {sessionState === 'running' ? 'Evaluating…' : 'Evaluate'}
            </Button>
            {sessionState !== 'idle' && (
              <Button variant="secondary" onClick={reset}>New</Button>
            )}
          </div>

          {result && result.selected_product && result.selected_product.sku && (
            <>
              <h3 className="t-eyebrow" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Selected product</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="t-body">{result.selected_product.name}</span>
                  <span className="t-mono">{fmt(result.original_price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="t-body" style={{ color: 'var(--color-text-secondary)' }}>Category</span>
                  <span className="t-body">{result.selected_product.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="t-body" style={{ color: 'var(--color-text-secondary)' }}>Inventory</span>
                  <span className="t-mono">{result.selected_product.inventory} units</span>
                </div>
              </div>

              <h3 className="t-eyebrow" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Offer</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="t-body" style={{ color: 'var(--color-text-secondary)' }}>Proposed</span>
                  <span className="t-mono">{result.proposed_discount}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="t-body" style={{ color: 'var(--color-text-secondary)' }}>Applied</span>
                  <span className="t-mono">{result.applied_discount}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-2)' }}>
                  <span className="t-body" style={{ fontWeight: 600 }}>Final price</span>
                  <span className="t-mono" style={{ fontWeight: 600 }}>{fmt(result.final_price)}</span>
                </div>
              </div>

              <h3 className="t-eyebrow" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Decision</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <StatusPill status={statusToType(result.status)} label={result.status.replace('_', ' ')} />
                <span className="t-caption" style={{ color: 'var(--color-text-secondary)' }}>{result.reason}</span>
              </div>
            </>
          )}

          {sessionState === 'idle' && (
            <div className="t-body" style={{ color: 'var(--color-text-secondary)' }}>
              Enter a customer request above to see the agent recommend, price, and validate an offer.
            </div>
          )}

          {sessionState === 'running' && (
            <div className="t-body" style={{ color: 'var(--color-text-secondary)' }}>Agent is evaluating request…</div>
          )}
        </Card>
      </div>

      <div className="sessions-right">
        <Card elevated style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2 className="t-section-heading" style={{ marginBottom: 'var(--space-4)' }}>Decision ledger</h2>

          <div style={{ flex: 1 }}>
            {sessionState === 'idle' && (
              <EmptyState message="No sessions yet. Start one to see the agent recommend, price, and validate an offer." actionLabel="Start session" onAction={() => { if (customerRequest.trim()) submit(); }} />
            )}
            {sessionState === 'running' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Skeleton height="28px" width="60%" />
                <Skeleton height="28px" width="75%" />
                <Skeleton height="28px" width="50%" />
              </div>
            )}
            {sessionState === 'error' && (
              <ErrorBanner message={errorMsg ?? 'The agent encountered an error. Please try again.'} onRetry={submit} />
            )}
            {sessionState === 'completed' && result && (
              <DecisionLedger steps={ledgerSteps} finalAction={finalAction} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export const Catalog: React.FC = () => {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    api.getCatalog()
      .then(setCatalog)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = catalog.filter(p => search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  type CatalogRow = { id: string; product: string; price: string; inventory: string; category: string; availability: string; inStock: boolean };
  const rows: CatalogRow[] = filtered.map(p => ({
    id: p.sku,
    product: p.name,
    price: fmt(p.price),
    inventory: `${p.inventory} units`,
    category: p.category,
    availability: p.inventory > 0 ? 'In Stock' : 'Out of Stock',
    inStock: p.inventory > 0,
  }));

  const columns = [
    { header: 'SKU', accessor: (r: CatalogRow) => <span className="t-mono" style={{ color: 'var(--color-text-secondary)' }}>{r.id}</span> },
    { header: 'Product', accessor: (r: CatalogRow) => <span style={{ fontWeight: 500 }}>{r.product}</span> },
    { header: 'Price', accessor: (r: CatalogRow) => <span className="t-mono">{r.price}</span> },
    { header: 'Inventory', accessor: (r: CatalogRow) => <span className="t-mono">{r.inventory}</span> },
    { header: 'Category', accessor: (r: CatalogRow) => <span className="t-body">{r.category}</span> },
    { header: 'Availability', accessor: (r: CatalogRow) => <StatusPill status={r.inStock ? 'approved' : 'rejected'} label={r.availability} /> },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <input
          type="text"
          placeholder="Search catalog by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', height: '36px', padding: '0 var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)', backgroundColor: 'var(--color-canvas)', color: 'var(--color-text-primary)' }}
        />
      </div>
      {error && <ErrorBanner message={`Could not load catalog: ${error}`} onRetry={load} />}
      {loading && <Skeleton height="160px" />}
      {!loading && !error && rows.length === 0 && <EmptyState message={search ? 'No products match your search.' : 'Catalog is empty.'} />}
      {!loading && !error && rows.length > 0 && <DataTable columns={columns} data={rows} getRowId={(r) => r.id} />}
    </Card>
  );
};

export const Policies: React.FC = () => {
  const [policy, setPolicy] = useState<MerchantPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.getPolicies()
      .then(setPolicy)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const approvalLabel = policy ? `Auto ≤${policy.auto_approval_threshold_pct}%, else manual` : '—';
  const oosBehaviorLabel = policy?.out_of_stock_behavior === 'suggest_alternative' ? 'Suggest alternative' : policy?.out_of_stock_behavior ?? '—';

  return (
    <Card>
      <h2 className="t-section-heading" style={{ marginBottom: 'var(--space-2)' }}>Agent Guardrails</h2>
      <p className="t-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
        These policies act as hard limits for the agent during negotiation and offer generation.
      </p>
      {error && <ErrorBanner message={`Could not load policies: ${error}`} onRetry={load} />}
      {loading && <Skeleton height="160px" />}
      {!loading && !error && policy && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <PolicyRuleRow label="Maximum discount" value={`${policy.max_discount_pct}%`} onEdit={() => {}} />
          <PolicyRuleRow label="Minimum order value" value={fmt(policy.min_order_value)} onEdit={() => {}} />
          <PolicyRuleRow label="Out-of-stock behavior" value={oosBehaviorLabel} onEdit={() => {}} />
          <PolicyRuleRow label="Approval requirement" value={approvalLabel} onEdit={() => {}} />
        </div>
      )}
    </Card>
  );
};

export const Activity: React.FC = () => {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.getActivity()
      .then(setActivity)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  type AuditRow = { id: string; time: string; session: string; action: string; status: 'approved' | 'rejected' | 'pending'; policy: string; ledger_steps: typeof activity[0]['ledger_steps'] };
  const rows: AuditRow[] = activity.map((a) => ({
    id: a.session_id,
    time: new Date(a.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    session: `Session #${a.session_id.slice(0, 6)}`,
    action: 'Offer generation',
    status: statusToType(a.status),
    policy: a.status === 'REJECTED' ? 'Failed limit check' : 'Passed',
    ledger_steps: a.ledger_steps,
  }));

  const columns = [
    { header: 'Timestamp', accessor: (r: AuditRow) => <span className="t-mono">{r.time}</span> },
    { header: 'Session', accessor: (r: AuditRow) => r.session },
    { header: 'Action', accessor: (r: AuditRow) => r.action },
    { header: 'Result', accessor: (r: AuditRow) => <StatusPill status={r.status} /> },
    { header: 'Policy status', accessor: (r: AuditRow) => <span className="t-body" style={{ color: r.status === 'rejected' ? 'var(--color-danger)' : 'inherit' }}>{r.policy}</span> },
  ];

  const renderExpandedRow = (row: AuditRow) => {
    const steps = toLedgerStepData(row.ledger_steps);
    const action = statusToFinalAction(row.status === 'rejected' ? 'REJECTED' : 'AUTO_APPROVED');
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-4) 0' }}>
        <h4 className="t-eyebrow" style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Audit Trace: {row.session}</h4>
        <DecisionLedger steps={steps} finalAction={action} />
      </div>
    );
  };

  return (
    <Card>
      <h2 className="t-section-heading" style={{ marginBottom: 'var(--space-4)' }}>Full Audit Trail</h2>
      {error && <ErrorBanner message={`Could not load activity: ${error}`} onRetry={load} />}
      {loading && <Skeleton height="160px" />}
      {!loading && !error && rows.length === 0 && <EmptyState message="No sessions recorded yet. Submit a customer request on the Sessions page." />}
      {!loading && !error && rows.length > 0 && (
        <DataTable columns={columns} data={rows} getRowId={(r) => r.id} onRowClick={(r) => setExpandedId(prev => prev === r.id ? null : r.id)} expandedRowId={expandedId} expandedRowRender={renderExpandedRow} />
      )}
    </Card>
  );
};
