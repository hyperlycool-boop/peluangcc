import { OUTCOME_DOT_THEME } from './interactive-formula';
import { dice, odd, probability, type Outcome } from './math';

export const FILM_STAGE_COUNT = 6;
export type FilmStage = 1 | 2 | 3 | 4 | 5 | 6;

/** Upper progress bound of stages 1 to 6. */
export const FILM_STAGE_ENDS = [0.13, 0.31, 0.44, 0.62, 0.8, 1] as const;

/** Rest point of each stage: the text is fully shown and the visual has settled. */
export const FILM_STOPS = [0.02, 0.22, 0.38, 0.57, 0.74, 0.9] as const;

/** The die kinematics in lib/scrolly.ts span film progress 0 to DIE_SPAN. */
const DIE_SPAN = 0.55;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function toDieProgress(progress: number): number {
  return clamp01(clamp01(progress) / DIE_SPAN);
}

/**
 * Tumble angle shown while the die slows down. The angle is wrapped to -180..180 and scaled by the
 * deceleration factor, so it equals the free tumble at factor 1 and unwinds the short way to 0.
 * The caller must not advance `angle` while factor is below 1, or the wrap point would show as a jump.
 */
export function settleTumbleAngle(angle: number, factor: number): number {
  const signed = ((((angle % 360) + 540) % 360) - 180);
  return signed * factor;
}

/** Where the scroll-driven tumble starts and stops gathering spin, in die progress. */
export const SCROLL_TUMBLE = {
  /** The die rests through stage 1 and takes off as stage 2 begins. */
  START: FILM_STAGE_ENDS[0] / DIE_SPAN,
  /** Free tumble ends where the deceleration in lib/scrolly.ts begins. */
  SPIN_END: 0.5,
  /** Turns gathered over the free tumble. Not whole numbers, so the slow-down is visible. */
  TURNS_X: 2.6,
  TURNS_Y: 3.3,
  /** Side-to-side rock while airborne, in degrees and in swings over the free tumble. */
  ROCK_Z: 20,
  ROCK_CYCLES: 3,
} as const;

export interface TumbleAngles {
  x: number;
  y: number;
  z: number;
}

/**
 * Tumble from scroll position alone: the same position always gives the same angles, so the die
 * moves only while the page scrolls. `factor` is the deceleration factor for this die progress
 * (1 in free tumble, easing to 0 on landing); the spin stops growing before it drops below 1.
 */
export function scrollTumble(dieProgress: number, factor: number): TumbleAngles {
  const p = clamp01(dieProgress);
  const span = SCROLL_TUMBLE.SPIN_END - SCROLL_TUMBLE.START;
  const t = clamp01((p - SCROLL_TUMBLE.START) / span);
  // Smoothstep: the spin gathers and fades gently instead of starting at full speed.
  const eased = t * t * (3 - 2 * t);
  const turn = (turns: number) => settleTumbleAngle(eased * turns * 360, factor);
  const rock = Math.sin(t * Math.PI * 2 * SCROLL_TUMBLE.ROCK_CYCLES) * SCROLL_TUMBLE.ROCK_Z * factor;
  return { x: turn(SCROLL_TUMBLE.TURNS_X), y: turn(SCROLL_TUMBLE.TURNS_Y), z: rock };
}

export function getFilmStage(progress: number): FilmStage {
  const p = clamp01(progress);
  const index = FILM_STAGE_ENDS.findIndex((end) => p < end);
  return (index === -1 ? FILM_STAGE_COUNT : index + 1) as FilmStage;
}

/** Scroll position of a progress value inside a runway pinned 'start start' to 'end end'. */
export function filmScrollTop(
  progress: number,
  runwayTop: number,
  runwayHeight: number,
  viewportHeight: number
): number {
  return runwayTop + clamp01(progress) * Math.max(0, runwayHeight - viewportHeight);
}

interface TextWindow {
  progress: number[];
  opacity: number[];
  translateY: number[];
}

function middleWindow(fadeInStart: number, fullStart: number, fullEnd: number, fadeOutEnd: number): TextWindow {
  return {
    progress: [fadeInStart, fullStart, fullEnd, fadeOutEnd],
    opacity: [0, 1, 1, 0],
    translateY: [20, 0, 0, -20],
  };
}

export const FILM_TEXT_WINDOWS: Record<FilmStage, TextWindow> = {
  1: { progress: [0, 0.09, 0.13], opacity: [1, 1, 0], translateY: [0, 0, -20] },
  2: middleWindow(0.11, 0.15, 0.27, 0.31),
  3: middleWindow(0.29, 0.33, 0.4, 0.44),
  4: middleWindow(0.42, 0.46, 0.58, 0.62),
  5: middleWindow(0.6, 0.64, 0.76, 0.8),
  6: { progress: [0.78, 0.82, 1], opacity: [0, 1, 1], translateY: [20, 0, 0] },
};

/** Die leaves the frame as the dots take over. */
export const DIE_EXIT = {
  progress: [0.44, 0.5],
  opacity: [1, 0],
  scale: [1, 0.45],
};

/** Dot coordinates share the lab's viewBox (0 0 560 330). */
export const POINTS: Record<'prime' | 'even', readonly { v: string; x: number; y: number }[]> = {
  prime: [
    { v: '1', x: 175, y: 165 },
    { v: '3', x: 280, y: 145 },
    { v: '5', x: 280, y: 193 },
    { v: '2', x: 380, y: 165 },
    { v: '4', x: 430, y: 282 },
    { v: '6', x: 475, y: 282 },
  ],
  even: [
    { v: '1', x: 145, y: 140 },
    { v: '3', x: 125, y: 185 },
    { v: '5', x: 175, y: 185 },
    { v: '2', x: 395, y: 140 },
    { v: '4', x: 375, y: 185 },
    { v: '6', x: 425, y: 185 },
  ],
};

/** The face the die lands on, carried across the film as the lit dot. */
export const OBSERVED_OUTCOME: Outcome = '3';

const SPREAD = { start: 0.46, stagger: 0.006, duration: 0.06, fade: 0.02 };
const VIEWBOX_CENTER = { x: 280, y: 165 };
const SIGNAL = { fill: '#cf4500', textColor: '#ffffff' };

/** Observed outcome leaves the die first; the rest follow in sample-space order. */
const SPREAD_ORDER: readonly Outcome[] = [
  OBSERVED_OUTCOME,
  ...dice.outcomes.filter((outcome) => outcome !== OBSERVED_OUTCOME),
];

export function getDotTrack(value: Outcome) {
  const point = POINTS.prime.find((candidate) => candidate.v === value);
  const order = SPREAD_ORDER.indexOf(value);
  if (!point || order < 0) {
    throw new Error(`Hasil ${value} tidak ada di ruang sampel`);
  }
  const start = SPREAD.start + order * SPREAD.stagger;
  return {
    progress: [start, start + SPREAD.duration],
    x: [VIEWBOX_CENTER.x, point.x],
    y: [VIEWBOX_CENTER.y, point.y],
    fadeProgress: [start, start + SPREAD.fade],
    opacity: [0, 1],
  };
}

const EVENT_A_FORMS = [0.64, 0.7];
const LAB_HANDOFF = [0.94, 1];

/** Fill and label colour of a dot, ending on the lab's selected and unselected theme. */
export function getDotColorTrack(value: Outcome) {
  const { selected, unselected } = OUTCOME_DOT_THEME;
  if (value === OBSERVED_OUTCOME) {
    return {
      progress: LAB_HANDOFF,
      fill: [SIGNAL.fill, selected.fill],
      textColor: [SIGNAL.textColor, selected.textColor],
    };
  }
  const end = isInEventA(value) ? selected : unselected;
  return {
    progress: EVENT_A_FORMS,
    fill: [unselected.fill, end.fill],
    textColor: [unselected.textColor, end.textColor],
  };
}

function isInEventA(value: Outcome): boolean {
  return (odd as readonly Outcome[]).includes(value);
}

export const CIRCLE_A_ENTRY = { progress: [0.62, 0.7], opacity: [0, 1], scale: [0.9, 1] };
export const CIRCLE_B_ENTRY = { progress: LAB_HANDOFF, opacity: [0, 1] };

const EVENT_A = { id: 'ganjil', label: 'Ganjil', members: odd };

export const FILM_COUNTS = {
  sampleSpace: dice.outcomes.length,
  eventA: odd.length,
  probabilityA: probability(dice, EVENT_A),
} as const;

/** Indonesian decimal comma, inside TeX braces so KaTeX does not add spacing after it. */
function texDecimal(value: number): string {
  return String(value).replace('.', '{,}');
}

export const FILM_TEX = {
  sampleSpace: `\\begin{gathered}S = \\{${dice.outcomes.join(', ')}\\}\\\\ n(S) = ${FILM_COUNTS.sampleSpace}\\end{gathered}`,
  eventA: `\\begin{gathered}A = \\{${odd.join(', ')}\\}\\\\ n(A) = ${FILM_COUNTS.eventA}\\end{gathered}`,
  probabilityA: `\\begin{gathered}P(A) = \\frac{n(A)}{n(S)}\\\\ = \\frac{${FILM_COUNTS.eventA}}{${FILM_COUNTS.sampleSpace}} = ${texDecimal(FILM_COUNTS.probabilityA)}\\end{gathered}`,
};

export const FILM_DIAGRAM_LABEL = `Ruang sampel berisi ${FILM_COUNTS.sampleSpace} titik: ${dice.outcomes.join(', ')}. Kejadian A, mata dadu ganjil, berisi ${odd.join(', ')}.`;
