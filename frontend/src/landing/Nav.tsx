import React, { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Nav: React.FC<{ onOpenWorkspace: () => void; onScrollToStory: () => void }> = ({
  onOpenWorkspace,
  onScrollToStory,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
      <span className="lp-nav-mark">AI Merchant Growth Agent</span>
      <div className="lp-nav-links">
        <button type="button" className="lp-nav-link" onClick={onScrollToStory}>
          How it works
        </button>
        <button type="button" className="lp-nav-link" onClick={onOpenWorkspace}>
          Workspace
        </button>
        <ThemeToggle />
      </div>
    </nav>
  );
};
