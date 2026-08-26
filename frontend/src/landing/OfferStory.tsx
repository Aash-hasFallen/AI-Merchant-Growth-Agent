import React from 'react';
import { Reveal } from './Reveal';

export const OfferStory: React.FC = () => {
  return (
    <section className="lp-section">
      <div className="lp-container">
        <Reveal>
          <span className="lp-eyebrow">03 — Offer formulation</span>
          <div className="lp-offer-wrap">
            <span className="lp-offer-badge">10% OFF</span>
            <div className="lp-price-transform">
              <span className="lp-price-original">₹5,499</span>
              <span className="lp-price-arrow">→</span>
              <span className="lp-price-final">₹4,949</span>
            </div>
          </div>
          <p className="lp-quote" style={{ textAlign: 'center' }}>
            A good offer isn't just a discount. It's a decision.
          </p>
        </Reveal>
      </div>
    </section>
  );
};
