import { dice, probability, type Outcome } from './math';
import type { Rng } from './frequency';

export interface PlaygroundTool {
  id: 'dadu' | 'koin' | 'spinner';
  label: string;
  /** Equally likely outcomes, in display order. */
  outcomes: readonly Outcome[];
  /** Short name for one trial, used in sentences such as "Lempar dadu". */
  verb: string;
}

export const PLAYGROUND_TOOLS: readonly PlaygroundTool[] = [
  { id: 'dadu', label: 'Dadu', outcomes: dice.outcomes, verb: 'Lempar dadu' },
  { id: 'koin', label: 'Koin', outcomes: ['Angka', 'Gambar'], verb: 'Lempar koin' },
  { id: 'spinner', label: 'Spinner', outcomes: ['Merah', 'Biru', 'Hijau'], verb: 'Putar spinner' },
];

/** Most rolls kept per tool, so tallies and the page stay light. */
export const PLAYGROUND_MAX_ROLLS = 5000;

export function spaceFor(tool: PlaygroundTool) {
  return { id: tool.id, outcomes: tool.outcomes, equallyLikely: true } as const;
}

export function rollTool(tool: PlaygroundTool, rng: Rng): Outcome {
  const index = Math.min(tool.outcomes.length - 1, Math.floor(rng() * tool.outcomes.length));
  return tool.outcomes[index];
}

export function tallyRolls(tool: PlaygroundTool, rolls: readonly Outcome[]): Record<Outcome, number> {
  const tally: Record<Outcome, number> = Object.fromEntries(tool.outcomes.map((outcome) => [outcome, 0]));
  for (const outcome of rolls) {
    if (outcome in tally) tally[outcome] += 1;
  }
  return tally;
}

/** Adds the outcome to the event, or removes it when already in. Keeps the tool's own order. */
export function toggleMember(tool: PlaygroundTool, members: readonly Outcome[], outcome: Outcome): Outcome[] {
  if (!tool.outcomes.includes(outcome)) return [...members];
  const next = new Set(members);
  if (next.has(outcome)) next.delete(outcome);
  else next.add(outcome);
  return tool.outcomes.filter((candidate) => next.has(candidate));
}

export interface EventStats {
  /** n(A) and n(S). */
  favourable: number;
  sampleSize: number;
  /** n(A) / n(S) from the model. */
  theoretical: number;
  /** Rolls so far, rolls that landed in A, and their share (null before the first roll). */
  trials: number;
  hits: number;
  observed: number | null;
}

export function eventStats(tool: PlaygroundTool, members: readonly Outcome[], rolls: readonly Outcome[]): EventStats {
  const theoretical = probability(spaceFor(tool), { id: 'A', label: 'Kejadian A', members });
  const inEvent = new Set(members);
  const hits = rolls.reduce((sum, outcome) => sum + (inEvent.has(outcome) ? 1 : 0), 0);
  return {
    favourable: members.length,
    sampleSize: tool.outcomes.length,
    theoretical,
    trials: rolls.length,
    hits,
    observed: rolls.length === 0 ? null : hits / rolls.length,
  };
}
