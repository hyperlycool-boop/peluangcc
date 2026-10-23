export interface FoldValues {
  rotateX: number;
  translateZ: number;
  scale: number;
  creaseOpacity: number;
}

export const FOLD_BREAKPOINTS = {
  progress: [0, 0.25, 0.35, 0.65, 0.75, 1] as const,
  rotateX: [-16, -4, 0, 0, 6, 14] as const,
  translateZ: [-30, -8, 0, 0, -8, -25] as const,
  scale: [0.97, 0.99, 1, 1, 0.99, 0.98] as const,
  creaseOpacity: [0.22, 0.06, 0, 0, 0.06, 0.18] as const,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolatePiecewise(val: number, inRange: readonly number[], outRange: readonly number[]): number {
  if (val <= inRange[0]) return outRange[0];
  const lastIdx = inRange.length - 1;
  if (val >= inRange[lastIdx]) return outRange[lastIdx];

  for (let i = 0; i < lastIdx; i++) {
    const x0 = inRange[i];
    const x1 = inRange[i + 1];
    if (val >= x0 && val <= x1) {
      const span = x1 - x0;
      const t = span === 0 ? 0 : (val - x0) / span;
      return lerp(outRange[i], outRange[i + 1], t);
    }
  }

  return outRange[lastIdx];
}

export function calculateFoldValues(progress: number, isQuiet: boolean = false): FoldValues {
  if (isQuiet) {
    return {
      rotateX: 0,
      translateZ: 0,
      scale: 1,
      creaseOpacity: 0,
    };
  }

  // Strictly clamp progress between 0 and 1, defaulting non-finite/NaN to 0
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;

  // Dedicated sweet-spot optimization
  if (p >= 0.35 && p <= 0.65) {
    return {
      rotateX: 0,
      translateZ: 0,
      scale: 1,
      creaseOpacity: 0,
    };
  }

  const { progress: inP, rotateX, translateZ, scale, creaseOpacity } = FOLD_BREAKPOINTS;

  return {
    rotateX: interpolatePiecewise(p, inP, rotateX),
    translateZ: interpolatePiecewise(p, inP, translateZ),
    scale: interpolatePiecewise(p, inP, scale),
    creaseOpacity: interpolatePiecewise(p, inP, creaseOpacity),
  };
}
