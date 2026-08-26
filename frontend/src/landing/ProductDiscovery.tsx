import React from 'react';
import { Card } from '../components';
import { Reveal } from './Reveal';

/**
 * These values mirror the "Roadster Flex" entry in the real backend
 * catalog (data.py — SKU RUN-002). This section deliberately reuses the
 * app's own <Card> component rather than a custom illustration, so what
 * you see here is the same visual language as the workspace, not a
 * marketing mockup.
 */
export const ProductDiscovery: React.FC = () => {
  return (
    <section className="lp-section">
      <div className="lp-container">
        <Reveal>
          <span className="lp-eyebrow">02 — Product discovery</span>
          <h2 className="lp-display" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>
            Found in the catalog, not assumed.
          </h2>
          <p className="lp-lede">
            The agent only ever proposes products that actually exist, in stock, in the
            merchant's own catalog.
          </p>
        </Reveal>

        <Reveal className="lp-product-wrap">
          <Card elevated className="lp-product-card">
            <span className="t-eyebrow" style={{ color: 'var(--color-text-secondary)' }}>Selected product</span>
            <div className="lp-product-name" style={{ marginTop: 'var(--space-2)' }}>Roadster Flex</div>
            <div className="lp-product-price">₹5,499</div>
            <div className="lp-product-meta">
              <span className="t-body" style={{ color: 'var(--color-text-secondary)' }}>Shoes</span>
              <span className="t-mono">18 in stock</span>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
};
