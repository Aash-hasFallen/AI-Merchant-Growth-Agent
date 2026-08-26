import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref to attach to a section and a boolean that flips to true
 * once the section scrolls into view. Backed by IntersectionObserver so
 * there's no scroll-listener overhead, and no animation dependency.
 *
 * If the person has requested reduced motion, `visible` starts (and stays)
 * true — content simply appears, no reveal animation plays.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}
