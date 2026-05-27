import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { isTouchDevice, prefersReducedMotion } from '../utils/performance';

export function scrollToTop(lenis) {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  lenis?.scrollTo(0, { immediate: true });
}

export function useLenis(enabled = true, scrollResetKey) {
  const lenisRef = useRef(null);
  const useSmoothScroll = enabled && !isTouchDevice() && !prefersReducedMotion();

  useEffect(() => {
    if (!useSmoothScroll) {
      scrollToTop(null);
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1,
    });

    lenisRef.current = lenis;

    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [useSmoothScroll]);

  useEffect(() => {
    scrollToTop(lenisRef.current);
  }, [scrollResetKey, useSmoothScroll]);

  return lenisRef;
}
