export type Outcome = string;

export interface SampleSpace {
  id: string;
  outcomes: readonly Outcome[];
  equallyLikely: true;
}

export interface ProbabilityEvent {
  id: string;
  label: string;
  members: readonly Outcome[];
}

export interface SimulationState {
  seed: number;
  trials: number;
  successes: number;
  history: { trial: number; frequency: number }[];
}

export function probability(space: SampleSpace, event: ProbabilityEvent): number {
  if (!space.outcomes.length || new Set(space.outcomes).size !== space.outcomes.length) {
    throw new Error('Ruang sampel harus unik dan tidak kosong');
  }
  if (
    new Set(event.members).size !== event.members.length ||
    event.members.some((x) => !space.outcomes.includes(x))
  ) {
    throw new Error('Kejadian harus merupakan himpunan bagian ruang sampel');
  }
  return event.members.length / space.outcomes.length;
}

export const union = (a: readonly string[], b: readonly string[]): string[] => [
  ...new Set([...a, ...b]),
];

export const intersection = (a: readonly string[], b: readonly string[]): string[] => {
  const setB = new Set(b);
  return [...new Set(a)].filter((x) => setB.has(x));
};

export const complement = (s: readonly string[], a: readonly string[]): string[] => {
  const setA = new Set(a);
  return [...new Set(s)].filter((x) => !setA.has(x));
};

export const dice: SampleSpace = {
  id: 'dadu-adil',
  outcomes: ['1', '2', '3', '4', '5', '6'],
  equallyLikely: true,
};

export const odd = ['1', '3', '5'] as const;
export const prime = ['2', '3', '5'] as const;
export const even = ['2', '4', '6'] as const;

export const easeLuxury = [0.16, 1, 0.3, 1] as const;

export const motionTokens = {
  instant: 0,
  step: 0.35,
  diagram: 0.65,
  orbit: 1.2,
  easeLuxury: [0.16, 1, 0.3, 1] as const,
} as const;
