import React from 'react';

export const Footer: React.FC<{ onOpenWelcomeModal: () => void; onOpenWorkspace: () => void }> = ({
  onOpenWelcomeModal,
  onOpenWorkspace,
}) => {
  return (
    <footer className="lp-footer">
      <span>AI Merchant Growth Agent — built with love & questionable amounts of caffeine : Aashray</span>
      <div className="lp-footer-links">
        <button type="button" onClick={onOpenWelcomeModal}>Give Feedback</button>
        <button type="button" onClick={onOpenWorkspace}>Workspace</button>
      </div>
    </footer>
  );
};
