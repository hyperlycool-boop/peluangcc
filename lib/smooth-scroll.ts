import type Lenis from 'lenis';

let instance: Lenis | null = null;

/** Called by SmoothScroll so other client code can scroll through Lenis instead of fighting it. */
export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

/** Null when Lenis is off, for example under prefers-reduced-motion. */
export function getLenis(): Lenis | null {
  return instance;
}
