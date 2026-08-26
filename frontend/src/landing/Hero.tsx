import React from 'react';

export const Hero: React.FC<{ onOpenWorkspace: () => void; onScrollToStory: () => void }> = ({
  onOpenWorkspace,
  onScrollToStory,
}) => {
  return (
    <section className="lp-hero">
      <div className="lp-container-wide">
        <span className="lp-eyebrow">AI Merchant Growth Agent</span>
        <h1 className="lp-display">
          Turn customer intent
          <br />
          into the right offer.
        </h1>
        <p className="lp-lede lp-hero-sub">
          AI Merchant Growth Agent connects customer intent, product discovery, offer
          formulation and merchant policy into one decision.
        </p>
        <div className="lp-cta-row">
          <button type="button" className="btn btn-primary lp-btn-lg" onClick={onOpenWorkspace}>
            Open workspace →
          </button>
          <button type="button" className="lp-cta-secondary" onClick={onScrollToStory}>
            See how it works ↓
          </button>
        </div>

        <div className="lp-hero-mark">
          <span>Intent</span>
          <span className="lp-hero-mark-line" />
          <span>Discovery</span>
          <span className="lp-hero-mark-line" />
          <span>Offer</span>
          <span className="lp-hero-mark-line" />
          <span>Policy</span>
          <span className="lp-hero-mark-line" />
          <span>Ledger</span>
        </div>
      </div>
    </section>
  );
};
