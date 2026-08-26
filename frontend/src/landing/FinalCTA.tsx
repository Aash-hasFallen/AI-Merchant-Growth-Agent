import React from 'react';
import { Reveal } from './Reveal';

export const FinalCTA: React.FC<{ onOpenWorkspace: () => void }> = ({ onOpenWorkspace }) => {
  return (
    <section className="lp-section lp-final-cta">
      <div className="lp-container">
        <Reveal>
          <h2 className="lp-display">
            From customer request
            <br />
            to merchant decision.
          </h2>
          <p className="lp-lede">
            One workflow. Deterministic guardrails. A decision you can explain.
          </p>
          <div className="lp-cta-row">
            <button type="button" className="btn btn-primary lp-btn-lg" onClick={onOpenWorkspace}>
              Open workspace →
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
