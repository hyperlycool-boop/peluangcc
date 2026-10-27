export type RollingDirection = 'up' | 'down' | 'none';

export interface SpringPhysicsConfig {
  stiffness: number;
  damping: number;
  mass: number;
  duration?: number;
}

export const ROLLING_SPRING_DEFAULTS: SpringPhysicsConfig = {
  stiffness: 300,
  damping: 24,
  mass: 0.8,
};

export const OUTCOME_DOT_THEME = {
  selected: {
    fill: '#141413',
    textColor: '#ffffff',
  },
  unselected: {
    fill: '#ffffff',
    textColor: '#141413',
  },
  stroke: '#141413',
} as const;

export interface OutcomeDotAnimationParams {
  isSelected: boolean;
  wasSelected?: boolean;
  quiet: boolean;
}

export type MotionEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface OutcomeDotAnimationResult {
  scale: number | number[];
  fill: string;
  textColor: string;
  stroke: string;
  transition: {
    duration: number;
    ease?: MotionEasing;
  };
}

/**
 * Calculates direction of vertical rolling counter:
 * - 'up': value has increased (e.g. 2 -> 4)
 * - 'down': value has decreased (e.g. 5 -> 2)
 * - 'none': value is unchanged or uninitialized
 */
export function calculateRollingDirection(
  current: number,
  previous?: number
): RollingDirection {
  if (previous === undefined || current === previous) {
    return 'none';
  }
  return current > previous ? 'up' : 'down';
}

/**
 * Calculates vertical slot reel translateY percentage:
 * For digit reel [0, 1, 2, ..., max], each digit is 1 / (max + 1) of the reel height.
 * Clamps value safely within [0, max].
 */
export function calculateReelOffset(value: number, max: number = 6): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '0%';
  }
  const clamped = Math.min(max, value);
  const totalDigits = Math.max(1, Math.floor(max) + 1);
  const pct = (clamped / totalDigits) * 100;
  const formatted = Math.round(pct * 10000) / 10000;
  return `-${formatted}%`;
}

/**
 * Generates contiguous array of numbers for slot reel from 0 to denominator.
 */
export function generateSlotReelNumbers(denominator: number = 6): number[] {
  const safeMax = Math.max(0, Math.floor(denominator));
  return Array.from({ length: safeMax + 1 }, (_, i) => i);
}

/**
 * Returns spring configuration for rolling slot counter.
 * In quiet or reduced-motion mode, animation is bypassed with duration 0.
 */
export function getRollingSpringConfig(isQuiet: boolean): SpringPhysicsConfig {
  if (isQuiet) {
    return {
      stiffness: 0,
      damping: 0,
      mass: 0,
      duration: 0,
    };
  }

  return {
    ...ROLLING_SPRING_DEFAULTS,
  };
}

/**
 * Calculates animation and color morph parameters for outcome dots in Venn diagram.
 * - Pops scale [1, 1.22, 1] on selection state toggle when not quiet.
 * - Morphs fill & text color between ink (#141413) and paper (#ffffff).
 * - When quiet is true, scale is locked to 1 and transition duration is 0.
 */
export function getOutcomeDotAnimation({
  isSelected,
  wasSelected,
  quiet,
}: OutcomeDotAnimationParams): OutcomeDotAnimationResult {
  const isChanged = wasSelected !== undefined && isSelected !== wasSelected;
  const theme = isSelected ? OUTCOME_DOT_THEME.selected : OUTCOME_DOT_THEME.unselected;

  if (quiet) {
    return {
      scale: 1,
      fill: theme.fill,
      textColor: theme.textColor,
      stroke: OUTCOME_DOT_THEME.stroke,
      transition: { duration: 0 },
    };
  }

  return {
    scale: isChanged ? [1, 1.22, 1] : 1,
    fill: theme.fill,
    textColor: theme.textColor,
    stroke: OUTCOME_DOT_THEME.stroke,
    transition: {
      duration: isChanged ? 0.35 : 0.2,
      ease: 'easeOut',
    },
  };
}

/**
 * Formats Indonesian screen reader accessibility string for probability fractions.
 * e.g., 'A\cup B', 4, 6 => 'P(A gabungan B) = 4 per 6'
 */
export function formatProbabilityAriaLabel(
  eventNotation: string,
  numerator: number,
  denominator: number
): string {
  let eventSpoken = eventNotation;

  const complementMatch = eventNotation.match(/^([A-Za-z]+)(?:\^c|ᶜ)$/);
  const binaryMatch = eventNotation.match(/^([A-Za-z]+)\s*(?:\\cup|∪|\\cap|∩)\s*([A-Za-z]+)$/);

  if (complementMatch) {
    eventSpoken = `komplemen ${complementMatch[1]}`;
  } else if (binaryMatch) {
    const isUnion = eventNotation.includes('cup') || eventNotation.includes('∪');
    eventSpoken = `${binaryMatch[1]} ${isUnion ? 'gabungan' : 'irisan'} ${binaryMatch[2]}`;
  } else if (eventNotation.includes('cup') || eventNotation.includes('∪')) {
    eventSpoken = 'A gabungan B';
  } else if (eventNotation.includes('cap') || eventNotation.includes('∩')) {
    eventSpoken = 'A irisan B';
  } else if (eventNotation.includes('^c') || eventNotation.includes('ᶜ')) {
    eventSpoken = 'komplemen A';
  }

  const safeNum = Number.isFinite(numerator) ? Math.max(0, numerator) : 0;
  const safeDen = Number.isFinite(denominator) && denominator > 0 ? denominator : 6;

  return `P(${eventSpoken}) = ${safeNum} per ${safeDen}`;
}

export const PIP_PULSE_CONFIG = {
  DURATION_MS: 1400,
  STAGGER_MS: 80,
} as const;

export function calculatePipRippleDelay(pipIndex: number): string {
  const safeIdx = Math.max(0, Math.floor(Number.isFinite(pipIndex) ? pipIndex : 0));
  return `${safeIdx * PIP_PULSE_CONFIG.STAGGER_MS}ms`;
}

export const NAV_SECTIONS = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'dadu', label: 'Dadu 3D' },
  { id: 'lab', label: 'Lab Diagram' },
  { id: 'materi', label: 'Materi' },
] as const;

export type NavSectionId = (typeof NAV_SECTIONS)[number]['id'];

export function resolveActiveNavSection(currentId: string | null | undefined): NavSectionId {
  if (currentId === 'dadu' || currentId === 'lab' || currentId === 'materi') {
    return currentId;
  }
  return 'beranda';
}
