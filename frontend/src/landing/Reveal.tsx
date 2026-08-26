import React, { type ReactNode } from 'react';
import { useReveal } from './useReveal';

export const Reveal: React.FC<{ children: ReactNode; className?: string; as?: 'div' | 'section' }> = ({
  children,
  className = '',
  as = 'div',
}) => {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const Tag = as as any;
  return (
    <Tag ref={ref} className={`lp-reveal ${visible ? 'lp-visible' : ''} ${className}`}>
      {children}
    </Tag>
  );
};
