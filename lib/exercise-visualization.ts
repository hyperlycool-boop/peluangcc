/**
 * Data and counting behind the lesson visualisations of the practice problems in lib/exercises.ts:
 * Soal 1 (bag of balls) and Soal 2 (bridge cards) for "Kejadian majemuk", Soal 3 (round table)
 * for "Ruang sampel". Everything is derived by counting so the picture cannot drift from the answer.
 */

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Simplest form of num/den; zero and whole numbers lose the denominator. */
export function fraction(num: number, den: number): string {
  if (den <= 0) throw new Error('Penyebut harus positif');
  if (num === 0) return '0';
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error('Faktorial hanya untuk bilangan bulat nonnegatif');
  return n <= 1 ? 1 : n * factorial(n - 1);
}

/* ---------- Kejadian majemuk: Soal 1, Soal 2 and a non-disjoint extra ---------- */

export type CompoundOperation = 'union' | 'intersection';
export type CompoundScenarioId = 'soal-1' | 'soal-2' | 'as-hati';

export interface ScenarioItem {
  id: string;
  /** Short text printed on the ball or card. */
  label: string;
  /** Colour of the ball, or the suit of the card. */
  tone: string;
}

export interface ScenarioEvent {
  /** Plain-language name, e.g. "bola merah". */
  label: string;
  ids: readonly string[];
}

export interface CompoundScenario {
  id: CompoundScenarioId;
  /** The practice problem this scenario shows; null for the extra non-disjoint case. */
  exerciseId: string | null;
  title: string;
  layout: 'bag' | 'deck';
  items: readonly ScenarioItem[];
  a: ScenarioEvent;
  b: ScenarioEvent;
}

const BALL_GROUPS = [
  { tone: 'merah', label: 'M', count: 6 },
  { tone: 'biru', label: 'B', count: 4 },
  { tone: 'hijau', label: 'H', count: 5 },
] as const;

const BAG: readonly ScenarioItem[] = BALL_GROUPS.flatMap(({ tone, label, count }) =>
  Array.from({ length: count }, (_, i) => ({ id: `${tone}-${i + 1}`, label, tone }))
);

const SUITS = ['sekop', 'hati', 'keriting', 'wajik'] as const;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

/** Row-major: one row per suit, one column per rank, so the grid reads like a laid-out deck. */
const DECK: readonly ScenarioItem[] = SUITS.flatMap((tone) =>
  RANKS.map((label) => ({ id: `${label}-${tone}`, label, tone }))
);

const idsWhere = (items: readonly ScenarioItem[], test: (item: ScenarioItem) => boolean) =>
  items.filter(test).map((item) => item.id);

export const COMPOUND_SCENARIOS: readonly CompoundScenario[] = [
  {
    id: 'soal-1',
    exerciseId: 'soal-1',
    title: 'Bola merah atau hijau',
    layout: 'bag',
    items: BAG,
    a: { label: 'bola merah', ids: idsWhere(BAG, (i) => i.tone === 'merah') },
    b: { label: 'bola hijau', ids: idsWhere(BAG, (i) => i.tone === 'hijau') },
  },
  {
    id: 'soal-2',
    exerciseId: 'soal-2',
    title: 'Kartu As atau King',
    layout: 'deck',
    items: DECK,
    a: { label: 'kartu As', ids: idsWhere(DECK, (i) => i.label === 'A') },
    b: { label: 'kartu King', ids: idsWhere(DECK, (i) => i.label === 'K') },
  },
  {
    id: 'as-hati',
    exerciseId: null,
    title: 'As atau Hati',
    layout: 'deck',
    items: DECK,
    a: { label: 'kartu As', ids: idsWhere(DECK, (i) => i.label === 'A') },
    b: { label: 'kartu Hati', ids: idsWhere(DECK, (i) => i.tone === 'hati') },
  },
];

export function compoundScenario(id: CompoundScenarioId): CompoundScenario {
  const found = COMPOUND_SCENARIOS.find((s) => s.id === id);
  if (!found) throw new Error(`Skenario tidak dikenal: ${id}`);
  return found;
}

export interface CompoundResult {
  nS: number;
  nA: number;
  nB: number;
  nIntersection: number;
  nUnion: number;
  /** A ∩ B = ∅, so the plain sum is enough. */
  disjoint: boolean;
  /** Ids the chosen operation highlights, in the order of `scenario.items`. */
  selected: string[];
  /** Simplest-form probability of the chosen operation, e.g. "2/13". */
  probability: string;
  equation: string;
}

export function evaluateCompound(scenario: CompoundScenario, operation: CompoundOperation): CompoundResult {
  const inA = new Set(scenario.a.ids);
  const inB = new Set(scenario.b.ids);
  const nS = scenario.items.length;
  const both = scenario.items.filter((i) => inA.has(i.id) && inB.has(i.id)).map((i) => i.id);
  const either = scenario.items.filter((i) => inA.has(i.id) || inB.has(i.id)).map((i) => i.id);
  const nA = inA.size;
  const nB = inB.size;
  const nIntersection = both.length;
  const nUnion = either.length;
  const disjoint = nIntersection === 0;

  const selected = operation === 'union' ? either : both;
  const count = selected.length;
  const probability = fraction(count, nS);
  const raw = `${count}/${nS}`;
  const reduced = probability === raw ? '' : ` = ${probability}`;

  const equation =
    operation === 'union'
      ? `P(A ∪ B) = ${nA}/${nS} + ${nB}/${nS}${disjoint ? '' : ` − ${nIntersection}/${nS}`} = ${raw}${reduced}`
      : `P(A ∩ B) = ${raw}${reduced}`;

  return { nS, nA, nB, nIntersection, nUnion, disjoint, selected, probability, equation };
}

/* ---------- Ruang sampel: Soal 3, meja bundar ---------- */

export type Gender = 'L' | 'P';

export interface Person {
  id: string;
  gender: Gender;
}

/** Four men then four women. The first man is the fixed reference seat. */
export const PEOPLE: readonly Person[] = [
  ...[1, 2, 3, 4].map((n): Person => ({ id: `L${n}`, gender: 'L' })),
  ...[1, 2, 3, 4].map((n): Person => ({ id: `P${n}`, gender: 'P' })),
];

export const SEAT_COUNT = PEOPLE.length;
export const ANCHOR: Person = PEOPLE[0];

const MEN = PEOPLE.filter((p) => p.gender === 'L').length;
const WOMEN = PEOPLE.length - MEN;

const space = factorial(SEAT_COUNT - 1);
const event = factorial(MEN - 1) * factorial(WOMEN);

export const SEATING = {
  /** n(S) = (8 − 1)!: the anchor is fixed, so rotations are not counted twice. */
  space,
  /** n(A) = 3! × 4!: remaining men take the men's seats, the women take the seats between. */
  event,
  /** The sample space cut into equal blocks the size of the event; the event fills one. */
  blocks: space / event,
} as const;

/** True when no two neighbours share a gender, including seat 7 next to seat 0. */
export function isAlternating(seats: readonly Person[]): boolean {
  return seats.every((person, i) => person.gender !== seats[(i + 1) % seats.length].gender);
}

/** One concrete member of the event: men and women take turns around the table. */
export function alternatingSeating(): Person[] {
  const men = PEOPLE.filter((p) => p.gender === 'L');
  const women = PEOPLE.filter((p) => p.gender === 'P');
  return men.flatMap((man, i) => [man, women[i]]);
}

/** A uniformly random seating with the anchor kept in seat 0 (Fisher–Yates on the other seven). */
export function shuffleSeating(random: () => number = Math.random): Person[] {
  const rest = PEOPLE.slice(1);
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [ANCHOR, ...rest];
}

export interface SeatingStats {
  trials: number;
  hits: number;
}

export function recordSeating(stats: SeatingStats, seats: readonly Person[]): SeatingStats {
  return { trials: stats.trials + 1, hits: stats.hits + (isAlternating(seats) ? 1 : 0) };
}

/** Which of the equal blocks a drawn seating lands in: block 0 is the event, 1…34 are the rest. */
export function seatingBlock(alternating: boolean, random: () => number = Math.random): number {
  return alternating ? 0 : 1 + Math.floor(random() * (SEATING.blocks - 1));
}

/** Practice problems that have a visualisation; tests keep this equal to lib/exercises.ts. */
export const visualizedExerciseIds: readonly string[] = [
  'soal-3',
  ...COMPOUND_SCENARIOS.flatMap((s) => (s.exerciseId ? [s.exerciseId] : [])),
];
