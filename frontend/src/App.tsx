import React, { useCallback, useEffect, useState } from 'react';
import { AppShell } from './AppShell';
import { LandingPage } from './landing/LandingPage';

type View = 'landing' | 'workspace';

function viewFromPath(pathname: string): View {
  return pathname.startsWith('/app') ? 'workspace' : 'landing';
}

/**
 * Minimal client-side routing between the marketing landing page (`/`)
 * and the existing workspace application (`/app`). Deliberately
 * dependency-free (no react-router) — the whole app only has two
 * destinations, and this keeps the "avoid unnecessary dependencies"
 * constraint intact.
 *
 * Note for deployment: this only intercepts in-app navigation. If you
 * serve the built app as static files and someone hard-refreshes on
 * /app directly, your static host needs to fall back to
 * index.html for unknown paths (Vite's own dev server already does this
 * automatically, so `npm run dev` / `vite preview` need no extra config).
 */
export const App: React.FC = () => {
  const [view, setView] = useState<View>(() => viewFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openWorkspace = useCallback(() => {
    window.history.pushState({}, '', '/app');
    setView('workspace');
    window.scrollTo(0, 0);
  }, []);

  const backToSite = useCallback(() => {
    window.history.pushState({}, '', '/');
    setView('landing');
    window.scrollTo(0, 0);
  }, []);

  if (view === 'workspace') {
    return <AppShell onExit={backToSite} />;
  }

  return <LandingPage onOpenWorkspace={openWorkspace} />;
};
