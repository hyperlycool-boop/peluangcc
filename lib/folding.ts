import { interpolatePiecewise } from './interpolate';

interface FoldValues {
  rotateX: number;
  translateZ: number;
  scale: number;
  creaseOpacity: number;
}

export const FOLD_BREAKPOINTS = {
  progress: [0, 0.25, 0.35, 0.65, 0.75, 1] as const,
  // Exit tilts the bottom edge away (negative), like the entry. Tilting it toward the viewer magnified
  // tall cards by up to ~1.4x on narrow screens and clipped their edges.
  rotateX: [-16, -4, 0, 0, -4, -10] as const,
  translateZ: [-30, -8, 0, 0, -8, -25] as const,
  scale: [0.97, 0.99, 1, 1, 0.99, 0.98] as const,
  creaseOpacity: [0.22, 0.06, 0, 0, 0.06, 0.18] as const,
};

const FLAT_FOLD: FoldValues = {
  rotateX: 0,
  translateZ: 0,
  scale: 1,
  creaseOpacity: 0,
};

export function calculateFoldValues(progress: number, isQuiet: boolean = false): FoldValues {
  if (isQuiet) {
    return { ...FLAT_FOLD };
  }

  // Strictly clamp progress between 0 and 1, defaulting non-finite/NaN to 0
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;

  // Dedicated sweet-spot optimization
  if (p >= 0.35 && p <= 0.65) {
    return { ...FLAT_FOLD };
  }

  const { progress: inP, rotateX, translateZ, scale, creaseOpacity } = FOLD_BREAKPOINTS;

  return {
    rotateX: interpolatePiecewise(p, inP, rotateX),
    translateZ: interpolatePiecewise(p, inP, translateZ),
    scale: interpolatePiecewise(p, inP, scale),
    creaseOpacity: interpolatePiecewise(p, inP, creaseOpacity),
  };
}

export {
  SCROLLY_STAGE_THRESHOLDS,
  getScrollyStage,
  DIE_KINEMATICS_BREAKPOINTS,
  calculateCenteredDieKinematics,
  calculateFloatingTextState,
  TUMBLE_CONFIG,
  calculateDecelerationFactor,
  calculateContinuousTumble,
  type CenteredDieKinematics,
  type FloatingTextState,
  type ContinuousTumbleAngles,
} from './scrolly';

