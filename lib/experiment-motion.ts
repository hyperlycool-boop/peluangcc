export type BallColor = 'merah' | 'biru';

export interface Ball {
  id: string;
  color: BallColor;
  /** Set on draws made with replacement: the bag ball this draw was copied from. */
  sourceId?: string;
}

export interface DrawState {
  bag: Ball[];
  draws: Ball[];
}

export const MAX_DRAWS = 2;

export const INITIAL_BAG: readonly Ball[] = [
  { id: 'm1', color: 'merah' },
  { id: 'm2', color: 'merah' },
  { id: 'm3', color: 'merah' },
  { id: 'b1', color: 'biru' },
  { id: 'b2', color: 'biru' },
];

export function createDrawState(): DrawState {
  return { bag: INITIAL_BAG.map((b) => ({ ...b })), draws: [] };
}

/**
 * Draws one ball uniformly from the bag.
 * - Without replacement the ball keeps its id, so the view can morph it from bag to slot.
 * - With replacement the bag is unchanged and the draw is a copy with its own id.
 */
export function drawBall(
  state: DrawState,
  replacement: boolean,
  random: () => number = Math.random
): DrawState {
  if (state.draws.length >= MAX_DRAWS || state.bag.length === 0) {
    return state;
  }
  const idx = Math.min(state.bag.length - 1, Math.max(0, Math.floor(random() * state.bag.length)));
  const picked = state.bag[idx];

  if (replacement) {
    const copy: Ball = {
      id: `${picked.id}-draw${state.draws.length + 1}`,
      color: picked.color,
      sourceId: picked.id,
    };
    return { bag: state.bag, draws: [...state.draws, copy] };
  }

  return {
    bag: state.bag.filter((_, i) => i !== idx),
    draws: [...state.draws, picked],
  };
}

export const FREQUENCY_DOMAINS = [10, 50, 100, 500, 1000] as const;

const CHART = { left: 40, width: 520, baseline: 190, height: 160 } as const;

/** Smallest stepped x-domain that fits n tosses, so the line only rescales at a few thresholds. */
export function frequencyDomain(n: number): number {
  return FREQUENCY_DOMAINS.find((d) => n <= d) ?? FREQUENCY_DOMAINS[FREQUENCY_DOMAINS.length - 1];
}

/** Running relative frequency of successes, as SVG coordinates. */
export function frequencyPoints(tosses: boolean[], domain: number): [number, number][] {
  const span = Math.max(domain - 1, 1);
  let count = 0;
  return tosses.map((success, i) => {
    if (success) count++;
    return [CHART.left + (i / span) * CHART.width, CHART.baseline - (count / (i + 1)) * CHART.height];
  });
}

const toPolyline = (pts: [number, number][]) =>
  pts.length < 2 ? '' : pts.map(([x, y]) => `${x},${y}`).join(' ');

/**
 * Splits the plot into what was already drawn and the newly added segment.
 * The fresh segment starts at the last settled point so the two join seamlessly.
 */
export function splitFrequencyPath(
  tosses: boolean[],
  prevCount: number,
  domain: number
): { settled: string; fresh: string } {
  const pts = frequencyPoints(tosses, domain);
  const prev = Math.min(pts.length, Math.max(0, Math.floor(prevCount)));
  return {
    settled: toPolyline(pts.slice(0, prev)),
    fresh: toPolyline(pts.slice(Math.max(prev - 1, 0))),
  };
}

/** Seconds to draw a fresh segment: bigger batches get a little more time, never more than 650 ms. */
export function frequencyDrawDuration(added: number, quiet: boolean): number {
  if (quiet || added <= 0) return 0;
  if (added >= 100) return 0.65;
  if (added >= 10) return 0.4;
  return 0.25;
}

export const COIN_FLIP_STAGGER_MS = 30;

/**
 * Delay before a coin in the visible history flips in.
 * New coins stagger from the first one that is both new (index >= prevCount) and visible (index >= coinBase).
 */
export function coinFlipDelayMs(absIndex: number, prevCount: number, coinBase: number): number {
  const firstNewVisible = Math.max(prevCount, coinBase);
  return Math.max(0, absIndex - firstNewVisible) * COIN_FLIP_STAGGER_MS;
}
