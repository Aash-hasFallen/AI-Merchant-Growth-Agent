import React, { type ReactNode } from 'react';

export type StatusType = 'approved' | 'rejected' | 'pending';
export const StatusPill: React.FC<{ status: StatusType; label?: string }> = ({ status, label }) => {
  const iconMap = { approved: '✓', rejected: '✕', pending: '•' };
  return (
    <span className={`status-pill status-${status}`}>
      <span className="status-icon">{iconMap[status]}</span>
      <span className="t-eyebrow">{label || status}</span>
    </span>
  );
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger-ghost';
  loading?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'secondary', loading = false, disabled, ...props }) => (
  <button className={`btn btn-${variant}`} disabled={disabled || loading} {...props}>
    {loading ? <span className="spinner"></span> : children}
  </button>
);

export const Card: React.FC<{ children: ReactNode; elevated?: boolean; className?: string; style?: React.CSSProperties }> = ({ children, elevated, className = '', style }) => (
  <div className={`card ${elevated ? 'elevated' : ''} ${className}`} style={style}>{children}</div>
);

export const MetricTile: React.FC<{ title: string; value: string; trend?: { value: string; isPositive: boolean } }> = ({ title, value, trend }) => (
  <Card>
    <div className="metric-tile">
      <span className="t-caption">{title}</span>
      <span className="metric-value">{value}</span>
      {trend && <span className={`metric-trend ${trend.isPositive ? 'positive' : 'negative'}`}>{trend.isPositive ? '↑' : '↓'} {trend.value}</span>}
    </div>
  </Card>
);

export interface Column<T> { header: string; accessor: (row: T) => ReactNode; }
export interface DataTableProps<T> { columns: Column<T>[]; data: T[]; onRowClick?: (row: T) => void; expandedRowRender?: (row: T) => ReactNode; expandedRowId?: string | number | null; getRowId: (row: T) => string | number; }
export function DataTable<T>({ columns, data, onRowClick, expandedRowRender, expandedRowId, getRowId }: DataTableProps<T>) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>{columns.map((col, idx) => (<th key={idx} scope="col">{col.header}</th>))}</tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const id = getRowId(row);
            const isExpanded = expandedRowId === id;
            return (
              <React.Fragment key={id || idx}>
                <tr className={onRowClick ? 'clickable' : ''} onClick={() => onRowClick && onRowClick(row)} tabIndex={onRowClick ? 0 : undefined} onKeyDown={(e) => { if (onRowClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onRowClick(row); } }}>
                  {columns.map((col, cIdx) => (<td key={cIdx} data-label={col.header}>{col.accessor(row)}</td>))}
                </tr>
                {isExpanded && expandedRowRender && (
                  <tr><td colSpan={columns.length} style={{ padding: 0 }}><div className="expanded-row-content">{expandedRowRender(row)}</div></td></tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const PolicyRuleRow: React.FC<{ label: string; value: string; onEdit: () => void }> = ({ label, value, onEdit }) => (
  <div className="policy-row">
    <span className="policy-label t-body">{label}</span>
    <span className="policy-value">{value}</span>
    <Button variant="secondary" onClick={onEdit}>Edit</Button>
  </div>
);

export const EmptyState: React.FC<{ message: string; actionLabel?: string; onAction?: () => void }> = ({ message, actionLabel, onAction }) => (
  <div className="empty-state">
    <span className="t-body" style={{ color: 'var(--color-text-secondary)' }}>{message}</span>
    {actionLabel && onAction && <Button variant="secondary" onClick={onAction}>{actionLabel}</Button>}
  </div>
);

export const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="error-banner">
    <div className="error-banner-content">
      <span style={{ fontWeight: 'bold' }}>!</span>
      <span className="t-body">{message}</span>
    </div>
    {onRetry && <Button variant="secondary" onClick={onRetry}>Retry</Button>}
  </div>
);

export const Skeleton: React.FC<{ width?: string; height?: string; className?: string }> = ({ width = '100%', height = '20px', className = '' }) => (
  <div className={`skeleton ${className}`} style={{ width, height }}></div>
);
