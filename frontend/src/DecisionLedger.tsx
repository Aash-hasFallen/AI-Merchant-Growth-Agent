import React, { useState, useEffect } from 'react';

export interface LedgerStepData {
  id: string;
  label: string;
  detail: string | React.ReactNode;
  isViolation?: boolean;
  violationData?: {
    attempted: string;
    limit: string;
    applied: string;
    message: string;
  };
}

export interface DecisionLedgerProps {
  steps: LedgerStepData[];
  finalAction: 'APPROVED' | 'REJECTED';
}

export const DecisionLedger: React.FC<DecisionLedgerProps> = ({ steps, finalAction }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCurrentStep(steps.length);
      return;
    }
    if (currentStep < steps.length) {
      const timer = setTimeout(() => { setCurrentStep(prev => prev + 1); }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length]);

  return (
    <div className="ledger-container" aria-live="polite">
      {steps.map((step, idx) => {
        const isVisible = idx <= currentStep;
        const isResolving = idx === currentStep;
        const isResolved = idx < currentStep;

        if (!isVisible) return null;

        return (
          <div key={step.id} className={`ledger-step ${isResolved ? 'resolved' : 'resolving'}`}>
            <div className="ledger-step-indicator">
              {isResolving ? <div className="spinner" /> : (step.isViolation ? <span style={{color: 'var(--color-danger)'}}>•</span> : <span>•</span>)}
            </div>
            <div className="ledger-step-content">
              <div className="ledger-step-header">
                <span className={`ledger-step-title ${isResolving ? 'active' : ''}`}>
                  {String(idx + 1).padStart(2, '0')}&nbsp;&nbsp;{step.label}
                </span>
                {isResolved && !step.isViolation && (
                  <span className="ledger-step-value">{step.detail}</span>
                )}
              </div>
              
              {isResolved && step.isViolation && step.violationData && (
                <div className="policy-violation-details">
                  <div className="violation-row attempted">
                    <span>Attempted</span>
                    <span className="val">{step.violationData.attempted}</span>
                  </div>
                  <div className="violation-row limit">
                    <span>Policy limit</span>
                    <span className="val">{step.violationData.limit}</span>
                  </div>
                  <div className="violation-row applied">
                    <span>Applied instead</span>
                    <span className="val">{step.violationData.applied}</span>
                  </div>
                  <span className="violation-msg">\"{step.violationData.message}\"</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {currentStep >= steps.length && (
        <div className={`ledger-stamp ${finalAction === 'APPROVED' ? 'success' : 'danger'}`}>
          ── ACTION: {finalAction} ──
        </div>
      )}
    </div>
  );
};
