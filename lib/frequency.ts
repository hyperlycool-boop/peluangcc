import { dice, odd, probability, type Outcome } from './math';

/** Random source returning a number in [0, 1), like Math.random. */
export type Rng = () => number;

export type Tally = Readonly<Record<Outcome, number>>;

/** Largest number of rolls the experiment keeps, so the history chart stays small. */
export const MAX_ROLLS = 5000;

/** The event the experiment watches. It matches event A in the scroll film. */
export const WATCHED_EVENT = { id: 'A', label: 'Mata dadu ganjil', members: odd } as const;

export function emptyTally(): Tally {
  return Object.fromEntries(dice.outcomes.map((outcome) => [outcome, 0]));
}

export function rollDie(rng: Rng): Outcome {
  const index = Math.min(dice.outcomes.length - 1, Math.floor(rng() * dice.outcomes.length));
  return dice.outcomes[index];
}

export function addRolls(tally: Tally, outcomes: readonly Outcome[]): Tally {
  const next: Record<Outcome, number> = { ...tally };
  for (const outcome of outcomes) next[outcome] += 1;
  return next;
}

export function totalRolls(tally: Tally): number {
  return dice.outcomes.reduce((sum, outcome) => sum + tally[outcome], 0);
}

export function eventCount(tally: Tally, members: readonly Outcome[] = WATCHED_EVENT.members): number {
  return members.reduce((sum, outcome) => sum + tally[outcome], 0);
}

/** Observed share of the watched event, or null before the first roll. */
export function observedFrequency(tally: Tally): number | null {
  const total = totalRolls(tally);
  return total === 0 ? null : eventCount(tally) / total;
}

/** The value the observed frequency drifts towards. */
export function theoreticalProbability(): number {
  return probability(dice, WATCHED_EVENT);
}

/**
 * Running frequency of the watched event after each roll, thinned to at most `maxPoints` values
 * (always keeping the last one) so a long run draws as a short polyline.
 */
export function frequencyHistory(
  rolls: readonly Outcome[],
  maxPoints = 120
): { rolls: number; frequency: number }[] {
  if (rolls.length === 0) return [];
  const members = new Set<Outcome>(WATCHED_EVENT.members);
  const step = Math.max(1, Math.ceil(rolls.length / maxPoints));
  const points: { rolls: number; frequency: number }[] = [];
  let hits = 0;
  rolls.forEach((outcome, index) => {
    if (members.has(outcome)) hits += 1;
    const count = index + 1;
    if (count % step === 0 || count === rolls.length) points.push({ rolls: count, frequency: hits / count });
  });
  return points;
}
