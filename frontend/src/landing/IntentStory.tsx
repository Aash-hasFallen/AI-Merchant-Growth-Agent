import React from 'react';
import { Reveal } from './Reveal';

export const IntentStory: React.FC = () => {
  return (
    <section className="lp-section">
      <div className="lp-container">
        <Reveal>
          <span className="lp-eyebrow">01 — The request</span>
          <p className="lp-quote">I need running shoes under ₹6,000.</p>
          <p className="lp-transition-line">The agent understands the intent.</p>
        </Reveal>
      </div>
    </section>
  );
};
