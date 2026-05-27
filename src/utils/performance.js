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
