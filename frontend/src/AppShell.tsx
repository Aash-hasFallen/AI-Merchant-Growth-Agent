import React, { useState } from 'react';
import { Overview, Sessions, Catalog, Policies, Activity } from './pages';
import { ThemeToggle } from './landing/ThemeToggle';

export type Page = 'Overview' | 'Sessions' | 'Catalog' | 'Policies' | 'Activity';

export interface AppShellProps {
  /** Called when the person wants to leave the workspace and return to the
   * marketing site. Optional so AppShell still works standalone (e.g. in
   * tests) without a router wired up around it. */
  onExit?: () => void;
}

const NavItems: { id: Page; label: string; icon: string }[] = [
  { id: 'Overview', label: 'Overview', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { id: 'Sessions', label: 'Sessions', icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z' },
  { id: 'Catalog', label: 'Catalog', icon: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z' },
  { id: 'Policies', label: 'Policies', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
  { id: 'Activity', label: 'Activity', icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z' },
];

export const AppShell: React.FC<AppShellProps> = ({ onExit }) => {
  const [currentPage, setCurrentPage] = useState<Page>('Overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'Overview': return <Overview onNavigate={setCurrentPage} />;
      case 'Sessions': return <Sessions />;
      case 'Catalog': return <Catalog />;
      case 'Policies': return <Policies />;
      case 'Activity': return <Activity />;
      default: return <Overview onNavigate={setCurrentPage} />;
    }
  };

  const navContent = NavItems.map(item => {
    const isActive = currentPage === item.id;
    return (
      <a
        key={item.id}
        className={`sidebar-item tab-item ${isActive ? 'active' : ''}`}
        onClick={() => setCurrentPage(item.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(item.id)}
        title={item.label}
      >
        <span className="sidebar-item-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke={isActive ? 'none' : 'currentColor'} strokeWidth={isActive ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
            <path d={item.icon} fill={isActive ? 'currentColor' : 'none'} stroke="none" />
          </svg>
        </span>
        <span className="sidebar-item-label t-body">{item.label}</span>
      </a>
    );
  });

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <nav className="sidebar-nav">
          {navContent}
        </nav>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <header className="top-bar">
          <h1 className="t-page-title">{currentPage}</h1>
          <div className="top-bar-right">
            {onExit && (
              <a className="t-body exit-link" role="button" tabIndex={0} onClick={onExit} onKeyDown={(e) => e.key === 'Enter' && onExit()}>
                ← Back to site
              </a>
            )}
            <ThemeToggle />
            <span>Merchant demo store</span>
            <div className="avatar-stub">MD</div>
          </div>
        </header>

        <main className="main-content">
          <div className="page-container">
            {renderPage()}
          </div>
        </main>
      </div>

      <nav className="bottom-tab-bar">
        {navContent}
      </nav>
    </div>
  );
};
