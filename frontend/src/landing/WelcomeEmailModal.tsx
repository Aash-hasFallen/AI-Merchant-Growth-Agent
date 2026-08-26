import React, { useEffect } from 'react';

import { Button } from '../components';

const GOOGLE_FORM_URL = 'https://forms.gle/67R5icLewy3CfGDf9';

export const WelcomeEmailModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const openFeedbackForm = () => {
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="lp-modal-overlay" onClick={onClose}>
      <div
        className="lp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Give feedback"
      >
        <div className="lp-modal-title">Help us make this better</div>

        <p className="lp-modal-sub">
          Got 30 seconds? Tell us what you think about the AI Merchant Growth Agent.
        </p>

        <div className="lp-modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Maybe later
          </Button>

          <Button variant="primary" onClick={openFeedbackForm}>
            Give feedback →
          </Button>
        </div>
      </div>
    </div>
  );
};