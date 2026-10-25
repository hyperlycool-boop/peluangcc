export const SCROLLY_STAGE_THRESHOLDS = {
  STAGE_1_MAX: 0.24,
  STAGE_2_MAX: 0.56,
  STAGE_3_MAX: 0.80,
  STAGE_4_MAX: 1.00,
} as const;

export function getScrollyStage(progress: number): 1 | 2 | 3 | 4 {
  if (!Number.isFinite(progress) || progress < SCROLLY_STAGE_THRESHOLDS.STAGE_1_MAX) return 1;
  if (progress < SCROLLY_STAGE_THRESHOLDS.STAGE_2_MAX) return 2;
  if (progress < SCROLLY_STAGE_THRESHOLDS.STAGE_3_MAX) return 3;
  return 4;
}

export const DIE_KINEMATICS_BREAKPOINTS = {
  progress: [0, 0.22, 0.38, 0.54, 0.60, 0.78, 0.86, 1] as const,
  rotateX: [18, 18, 65, 30, 0, 0, 22, 22] as const,
  rotateY: [35, 35, 140, 230, 270, 270, 295, 295] as const,
  rotateZ: [0, 0, 12, 5, 0, 0, 0, 0] as const,
  translateY: [0, 0, -60, -45, 0, 0, -15, -15] as const,
  shadowScale: [1, 1, 0.65, 0.75, 1.08, 1.08, 0.95, 0.95] as const,
  shadowOpacity: [0.42, 0.42, 0.2, 0.24, 0.48, 0.48, 0.38, 0.38] as const,
};

export interface CenteredDieKinematics {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  translateY: number;
  shadowScale: number;
  shadowOpacity: number;
  highlightFace: number | null;
}

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

export function calculateCenteredDieKinematics(
  progress: number,
  isQuiet: boolean = false
): CenteredDieKinematics {
  if (isQuiet) {
    return {
      rotateX: 18,
      rotateY: 35,
      rotateZ: 0,
      translateY: 0,
      shadowScale: 1,
      shadowOpacity: 0.35,
      highlightFace: null,
    };
  }

  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const stage = getScrollyStage(p);
  const {
    progress: inP,
    rotateX,
    rotateY,
    rotateZ,
    translateY,
    shadowScale,
    shadowOpacity,
  } = DIE_KINEMATICS_BREAKPOINTS;

  return {
    rotateX: interpolatePiecewise(p, inP, rotateX),
    rotateY: interpolatePiecewise(p, inP, rotateY),
    rotateZ: interpolatePiecewise(p, inP, rotateZ),
    translateY: interpolatePiecewise(p, inP, translateY),
    shadowScale: interpolatePiecewise(p, inP, shadowScale),
    shadowOpacity: interpolatePiecewise(p, inP, shadowOpacity),
    highlightFace: stage === 3 ? 3 : null,
  };
}

export interface FloatingTextState {
  opacity: number;
  translateY: number;
  visible: boolean;
}

export const FLOATING_STAGE_BREAKPOINTS = {
  1: {
    progress: [0, 0.16, 0.24] as const,
    opacity: [1, 1, 0] as const,
    translateY: [0, 0, -20] as const,
  },
  2: {
    progress: [0.20, 0.28, 0.48, 0.56] as const,
    opacity: [0, 1, 1, 0] as const,
    translateY: [20, 0, 0, -20] as const,
  },
  3: {
    progress: [0.52, 0.60, 0.72, 0.80] as const,
    opacity: [0, 1, 1, 0] as const,
    translateY: [20, 0, 0, -20] as const,
  },
  4: {
    progress: [0.76, 0.84, 1.00] as const,
    opacity: [0, 1, 1] as const,
    translateY: [20, 0, 0] as const,
  },
} as const;

export function calculateFloatingTextState(
  stageNum: number,
  progress: number,
  isQuiet: boolean = false
): FloatingTextState {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const activeStage = getScrollyStage(p);

  if (isQuiet) {
    const isCurrent = stageNum === activeStage;
    return {
      opacity: isCurrent ? 1 : 0,
      translateY: 0,
      visible: isCurrent,
    };
  }

  let opacity = 0;
  let translateY = 0;

  if (stageNum === 1) {
    if (p <= 0.16) {
      opacity = 1;
      translateY = 0;
    } else if (p < 0.24) {
      const t = (p - 0.16) / (0.24 - 0.16);
      opacity = 1 - t;
      translateY = -20 * t;
    } else {
      opacity = 0;
      translateY = -20;
    }
  } else if (stageNum === 2) {
    if (p < 0.20) {
      opacity = 0;
      translateY = 20;
    } else if (p < 0.28) {
      const t = (p - 0.20) / (0.28 - 0.20);
      opacity = t;
      translateY = 20 * (1 - t);
    } else if (p <= 0.48) {
      opacity = 1;
      translateY = 0;
    } else if (p < 0.56) {
      const t = (p - 0.48) / (0.56 - 0.48);
      opacity = 1 - t;
      translateY = -20 * t;
    } else {
      opacity = 0;
      translateY = -20;
    }
  } else if (stageNum === 3) {
    if (p < 0.52) {
      opacity = 0;
      translateY = 20;
    } else if (p < 0.60) {
      const t = (p - 0.52) / (0.60 - 0.52);
      opacity = t;
      translateY = 20 * (1 - t);
    } else if (p <= 0.72) {
      opacity = 1;
      translateY = 0;
    } else if (p < 0.80) {
      const t = (p - 0.72) / (0.80 - 0.72);
      opacity = 1 - t;
      translateY = -20 * t;
    } else {
      opacity = 0;
      translateY = -20;
    }
  } else if (stageNum === 4) {
    if (p < 0.76) {
      opacity = 0;
      translateY = 20;
    } else if (p < 0.84) {
      const t = (p - 0.76) / (0.84 - 0.76);
      opacity = t;
      translateY = 20 * (1 - t);
    } else {
      opacity = 1;
      translateY = 0;
    }
  }

  // Clamp and round cleanly
  opacity = Math.max(0, Math.min(1, Math.round(opacity * 1000) / 1000));
  translateY = Math.round(translateY * 100) / 100;

  return {
    opacity,
    translateY,
    visible: opacity > 0,
  };
}

export const TUMBLE_CONFIG = {
  DECEL_START: 0.50,
  DECEL_END: 0.60,
  SPEED_X: 110, // degrees per second
  SPEED_Y: 160,
  SPEED_Z: 75,
} as const;

export function calculateDecelerationFactor(progress: number): number {
  if (!Number.isFinite(progress)) return 1.0;
  if (progress <= TUMBLE_CONFIG.DECEL_START) return 1.0;
  if (progress >= TUMBLE_CONFIG.DECEL_END) return 0.0;

  // Normalized progress in deceleration zone [0, 1]
  const tau = (progress - TUMBLE_CONFIG.DECEL_START) / (TUMBLE_CONFIG.DECEL_END - TUMBLE_CONFIG.DECEL_START);
  // Smooth half-cosine curve: 1 at tau=0, 0 at tau=1, continuous first derivative
  return (1 + Math.cos(Math.PI * tau)) / 2;
}

export interface ContinuousTumbleAngles {
  tumbleX: number;
  tumbleY: number;
  tumbleZ: number;
}

export function calculateContinuousTumble(
  timeSec: number,
  progress: number,
  isQuiet: boolean = false
): ContinuousTumbleAngles {
  if (isQuiet) {
    return { tumbleX: 0, tumbleY: 0, tumbleZ: 0 };
  }

  const factor = calculateDecelerationFactor(progress);
  if (factor <= 0.0001) {
    return { tumbleX: 0, tumbleY: 0, tumbleZ: 0 };
  }

  const t = Number.isFinite(timeSec) ? timeSec : 0;
  // Multi-axis continuous tumbling scaled by deceleration factor
  const rawX = (t * TUMBLE_CONFIG.SPEED_X) % 360;
  const rawY = (t * TUMBLE_CONFIG.SPEED_Y) % 360;
  const rawZ = Math.sin(t * 2) * 20;

  return {
    tumbleX: Math.round(((rawX + 360) % 360) * factor * 100) / 100,
    tumbleY: Math.round(((rawY + 360) % 360) * factor * 100) / 100,
    tumbleZ: Math.round(rawZ * factor * 100) / 100,
  };
}
