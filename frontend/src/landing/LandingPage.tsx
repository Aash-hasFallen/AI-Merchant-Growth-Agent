import React, { useRef, useState } from 'react';
import './landing.css';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { IntentStory } from './IntentStory';
import { ProductDiscovery } from './ProductDiscovery';
import { OfferStory } from './OfferStory';
import { PolicyStory } from './PolicyStory';
import { LedgerStory } from './LedgerStory';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import { WelcomeEmailModal } from './WelcomeEmailModal';

export const LandingPage: React.FC<{ onOpenWorkspace: () => void }> = ({ onOpenWorkspace }) => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <div className="lp-root">
      <Nav onOpenWorkspace={onOpenWorkspace} onScrollToStory={scrollToStory} />
      <Hero onOpenWorkspace={onOpenWorkspace} onScrollToStory={scrollToStory} />

      <div ref={storyRef}>
        <IntentStory />
        <ProductDiscovery />
        <OfferStory />
        <PolicyStory />
        <LedgerStory />
      </div>

      <FinalCTA onOpenWorkspace={onOpenWorkspace} />
      <Footer onOpenWelcomeModal={() => setShowWelcomeModal(true)} onOpenWorkspace={onOpenWorkspace} />

      {showWelcomeModal && <WelcomeEmailModal onClose={() => setShowWelcomeModal(false)} />}
    </div>
  );
};
