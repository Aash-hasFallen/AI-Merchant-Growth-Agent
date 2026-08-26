import React from 'react';
import { Card, StatusPill } from '../components';
import { Reveal } from './Reveal';

export const PolicyStory: React.FC = () => {
  return (
    <section className="lp-section">
      <div className="lp-container">
        <Reveal>
          <span className="lp-eyebrow">04 — Policy validation</span>
          <p className="lp-quote">Give me a 50% discount.</p>
        </Reveal>

        <Reveal>
          <div className="lp-policy-grid">
            <Card className="lp-policy-tile lp-policy-requested">
              <span className="t-caption lp-policy-tile-label">Requested</span>
              <span className="lp-policy-tile-value">50%</span>
            </Card>
            <Card className="lp-policy-tile lp-policy-limit">
              <span className="t-caption lp-policy-tile-label">Merchant limit</span>
              <span className="lp-policy-tile-value">20%</span>
            </Card>
            <Card className="lp-policy-tile lp-policy-result">
              <span className="t-caption lp-policy-tile-label">Result</span>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-1)' }}>
                <StatusPill status="rejected" label="Rejected" />
              </div>
            </Card>
          </div>

          <div className="lp-policy-fallback">
            <span className="t-body" style={{ color: 'var(--color-text-secondary)' }}>Safe fallback</span>
            <span className="t-mono lp-policy-fallback-price">20% OFF → ₹3,600</span>
          </div>

          <p className="lp-lede" style={{ margin: 'var(--space-6) auto 0 auto', textAlign: 'center' }}>
            The model proposes. The deterministic policy engine decides — the LLM never has
            final authority over a live offer.
          </p>
        </Reveal>
      </div>
    </section>
  );
};
