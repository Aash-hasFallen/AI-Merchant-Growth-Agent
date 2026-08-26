import React from 'react';
import { Card } from '../components';
import { DecisionLedger, type LedgerStepData } from '../DecisionLedger';
import { Reveal } from './Reveal';
import { useReveal } from './useReveal';

const DEMO_STEPS: LedgerStepData[] = [
  { id: 's1', label: 'Intent detected', detail: 'Give me a 50% discount.' },
  { id: 's2', label: 'Catalog searched', detail: '12 products scanned, 10 in stock' },
  { id: 's3', label: 'Product selected', detail: 'Roadster Flex — ₹5,499 (18 units in stock)' },
  { id: 's4', label: 'Offer proposed', detail: '50% → ₹2,750' },
  {
    id: 's5',
    label: 'Policy validated',
    detail: 'Discount exceeds limit. Fallback generated at 20%.',
    isViolation: true,
    violationData: {
      attempted: '50%',
      limit: '20%',
      applied: '20% → ₹4,399',
      message: 'Attempted discount 50% exceeds maximum 20%.',
    },
  },
  { id: 's6', label: 'Fallback generated', detail: 'Safe offer: 20% → ₹4,399' },
];

export const LedgerStory: React.FC = () => {
  // Mounted only once scrolled into view, so the ledger's own step-by-step
  // reveal animation (built into DecisionLedger.tsx) plays when the person
  // actually arrives at this section instead of finishing off-screen.
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="lp-section">
      <div className="lp-container">
        <Reveal>
          <span className="lp-eyebrow">05 — Decision ledger</span>
          <h2 className="lp-display" style={{ fontSize: 'clamp(24px, 4vw, 34px)' }}>
            Every decision leaves a trace.
          </h2>
          <p className="lp-lede">
            This is the exact ledger component from the workspace, replaying the request
            above step by step.
          </p>
        </Reveal>

        <div ref={ref} className={`lp-reveal ${visible ? 'lp-visible' : ''}`}>
          <Card elevated className="lp-ledger-wrap">
            {visible && <DecisionLedger steps={DEMO_STEPS} finalAction="REJECTED" />}
          </Card>
        </div>
      </div>
    </section>
  );
};
