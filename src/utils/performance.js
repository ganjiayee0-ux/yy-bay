export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isMobileViewport(width = typeof window !== 'undefined' ? window.innerWidth : 1024) {
  return width < 768;
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getCanvasDpr(width) {
  if (width < 768) return 1;
  return Math.min(window.devicePixelRatio || 1, 2);
}

/** Butterfly canvas: phones stay light; desktops cap cost (large pixels + glow). */
export function getButterflyPerfProfile(width, height) {
  const mobile = isMobileViewport(width);
  const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
  const pixelLoad = width * height * dpr * dpr;
  const heavyDesktop = !mobile && pixelLoad > 900_000;

  return {
    dpr,
    /** Optimized draw path: no per-butterfly shadowBlur, source-over blend */
    lite: mobile || heavyDesktop,
    maxParticles: mobile ? 380 : heavyDesktop ? 440 : 520,
    emitPerFrame: mobile ? 4 : heavyDesktop ? 6 : 8,
    floorSwarm: mobile ? 120 : heavyDesktop ? 110 : 140,
    heartDustCount: mobile ? 720 : heavyDesktop ? 880 : 1050,
    frameIntervalMs: mobile || heavyDesktop ? 33 : 0,
  };
}
