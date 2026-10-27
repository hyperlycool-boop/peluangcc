import { describe, it, expect } from 'vitest';
import { exercises } from '../lib/exercises';
import {
  ANCHOR,
  COMPOUND_SCENARIOS,
  PEOPLE,
  SEATING,
  SEAT_COUNT,
  alternatingSeating,
  compoundScenario,
  evaluateCompound,
  factorial,
  fraction,
  isAlternating,
  recordSeating,
  seatingBlock,
  shuffleSeating,
  visualizedExerciseIds,
  type Person,
} from '../lib/exercise-visualization';

const exercise = (id: string) => {
  const found = exercises.find((e) => e.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest])
  );
}

/** Deterministic generator so statistical checks never flake. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('fraction', () => {
  it('reduces to the simplest form', () => {
    expect(fraction(8, 52)).toBe('2/13');
    expect(fraction(144, 5040)).toBe('1/35');
    expect(fraction(11, 15)).toBe('11/15');
  });

  it('writes zero and whole numbers without a denominator', () => {
    expect(fraction(0, 15)).toBe('0');
    expect(fraction(52, 52)).toBe('1');
  });
});

describe('Soal 1: kantong 15 bola', () => {
  const s = compoundScenario('soal-1');

  it('has the bag from the question: 6 merah, 4 biru, 5 hijau', () => {
    const count = (tone: string) => s.items.filter((i) => i.tone === tone).length;
    expect(s.items).toHaveLength(15);
    expect(count('merah')).toBe(6);
    expect(count('biru')).toBe(4);
    expect(count('hijau')).toBe(5);
    expect(exercise('soal-1').question).toMatch(/6 bola merah, 4 bola biru, dan 5 bola hijau/);
  });

  it('A is merah and B is hijau', () => {
    expect(s.a.ids).toHaveLength(6);
    expect(s.b.ids).toHaveLength(5);
    expect(s.a.ids.every((id) => s.items.find((i) => i.id === id)?.tone === 'merah')).toBe(true);
    expect(s.b.ids.every((id) => s.items.find((i) => i.id === id)?.tone === 'hijau')).toBe(true);
  });

  it('the union is mutually exclusive and gives 11/15', () => {
    const r = evaluateCompound(s, 'union');
    expect(r.nS).toBe(15);
    expect(r.nIntersection).toBe(0);
    expect(r.disjoint).toBe(true);
    expect(r.nUnion).toBe(11);
    expect(r.selected).toHaveLength(11);
    expect(r.probability).toBe('11/15');
    expect(r.equation).toBe('P(A ∪ B) = 6/15 + 5/15 = 11/15');
  });

  it('the intersection is empty', () => {
    const r = evaluateCompound(s, 'intersection');
    expect(r.selected).toEqual([]);
    expect(r.probability).toBe('0');
    expect(r.equation).toBe('P(A ∩ B) = 0/15 = 0');
  });
});

describe('Soal 2: kartu As atau King', () => {
  const s = compoundScenario('soal-2');

  it('lays out a 52-card deck of four suits and thirteen ranks', () => {
    expect(s.items).toHaveLength(52);
    expect(new Set(s.items.map((i) => i.id)).size).toBe(52);
    expect(new Set(s.items.map((i) => i.tone)).size).toBe(4);
  });

  it('A is the four As and B the four King', () => {
    expect(s.a.ids).toHaveLength(4);
    expect(s.b.ids).toHaveLength(4);
  });

  it('the union gives 8/52 = 2/13', () => {
    const r = evaluateCompound(s, 'union');
    expect(r.nS).toBe(52);
    expect(r.disjoint).toBe(true);
    expect(r.nUnion).toBe(8);
    expect(r.probability).toBe('2/13');
    expect(r.equation).toBe('P(A ∪ B) = 4/52 + 4/52 = 8/52 = 2/13');
  });
});

describe('Skenario tambahan: As atau Hati (tidak saling lepas)', () => {
  const s = compoundScenario('as-hati');

  it('shares the deck and has exactly one card in the intersection', () => {
    expect(s.items).toHaveLength(52);
    expect(s.exerciseId).toBeNull();
    const r = evaluateCompound(s, 'intersection');
    expect(r.nIntersection).toBe(1);
    expect(r.disjoint).toBe(false);
    expect(r.selected).toHaveLength(1);
  });

  it('subtracts the intersection once: 4 + 13 − 1 = 16', () => {
    const r = evaluateCompound(s, 'union');
    expect(r.nA).toBe(4);
    expect(r.nB).toBe(13);
    expect(r.nUnion).toBe(16);
    expect(r.selected).toHaveLength(16);
    expect(r.probability).toBe('4/13');
    expect(r.equation).toBe('P(A ∪ B) = 4/52 + 13/52 − 1/52 = 16/52 = 4/13');
  });
});

describe('kejadian anggota ruang sampel', () => {
  it('every scenario keeps A and B inside its own sample space', () => {
    for (const s of COMPOUND_SCENARIOS) {
      const ids = new Set(s.items.map((i) => i.id));
      expect(s.a.ids.every((id) => ids.has(id))).toBe(true);
      expect(s.b.ids.every((id) => ids.has(id))).toBe(true);
    }
  });

  it('throws for an unknown scenario', () => {
    // @ts-expect-error deliberately invalid id
    expect(() => compoundScenario('tidak-ada')).toThrow();
  });
});

describe('Soal 3: meja bundar', () => {
  it('has four men and four women, with the anchor a man', () => {
    expect(PEOPLE).toHaveLength(SEAT_COUNT);
    expect(PEOPLE.filter((p) => p.gender === 'L')).toHaveLength(4);
    expect(PEOPLE.filter((p) => p.gender === 'P')).toHaveLength(4);
    expect(ANCHOR.gender).toBe('L');
    expect(exercise('soal-3').question).toMatch(/Empat laki-laki dan empat perempuan/);
  });

  it('factorial matches the worked solution', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(3)).toBe(6);
    expect(factorial(4)).toBe(24);
    expect(factorial(7)).toBe(5040);
    expect(() => factorial(-1)).toThrow();
  });

  it('derives n(S) = 7!, n(A) = 3! × 4! and 35 equal blocks', () => {
    expect(SEATING.space).toBe(5040);
    expect(SEATING.event).toBe(144);
    expect(SEATING.blocks).toBe(35);
    expect(SEATING.space).toBe(SEATING.event * SEATING.blocks);
    expect(fraction(SEATING.event, SEATING.space)).toBe('1/35');
  });

  it('brute force: exactly 144 of the 5040 arrangements alternate', () => {
    const others = PEOPLE.slice(1);
    const all = permutations([...others]);
    expect(all).toHaveLength(5040);
    const hits = all.filter((rest) => isAlternating([ANCHOR, ...rest])).length;
    expect(hits).toBe(144);
  });

  it('isAlternating is circular: the last seat neighbours the first', () => {
    const [l1, l2, l3, l4, p1, p2, p3, p4] = PEOPLE;
    expect(isAlternating([l1, p1, l2, p2, l3, p3, l4, p4])).toBe(true);
    expect(isAlternating([l1, p1, l2, p2, l3, p3, p4, l4])).toBe(false);
    // Alternates along the line but two men meet across the wrap-around.
    expect(isAlternating([l1, p1, l2, p2, l3, p3, l4, l4])).toBe(false);
    expect(isAlternating([l1, l2, p1, p2, l3, l4, p3, p4])).toBe(false);
  });

  it('alternatingSeating is a valid example of the event', () => {
    const seats = alternatingSeating();
    expect(isAlternating(seats)).toBe(true);
    expect(seats[0]).toBe(ANCHOR);
    expect(new Set(seats.map((p) => p.id)).size).toBe(SEAT_COUNT);
  });

  it('shuffleSeating keeps the anchor and seats everyone exactly once', () => {
    const random = seeded(7);
    for (let i = 0; i < 200; i += 1) {
      const seats = shuffleSeating(random);
      expect(seats).toHaveLength(SEAT_COUNT);
      expect(seats[0]).toBe(ANCHOR);
      expect(new Set(seats.map((p: Person) => p.id)).size).toBe(SEAT_COUNT);
    }
  });

  it('shuffleSeating does not mutate PEOPLE', () => {
    const before = PEOPLE.map((p) => p.id).join();
    shuffleSeating(seeded(3));
    expect(PEOPLE.map((p) => p.id).join()).toBe(before);
  });

  it('random seatings alternate about once in 35 (seeded, 20000 trials)', () => {
    const random = seeded(2026);
    let stats = { trials: 0, hits: 0 };
    for (let i = 0; i < 20000; i += 1) stats = recordSeating(stats, shuffleSeating(random));
    expect(stats.trials).toBe(20000);
    const rate = stats.hits / stats.trials;
    expect(rate).toBeGreaterThan(1 / 35 - 0.008);
    expect(rate).toBeLessThan(1 / 35 + 0.008);
  });

  it('recordSeating is pure and counts only alternating seatings as hits', () => {
    const start = { trials: 0, hits: 0 };
    const hit = recordSeating(start, alternatingSeating());
    expect(start).toEqual({ trials: 0, hits: 0 });
    expect(hit).toEqual({ trials: 1, hits: 1 });
    const [l1, l2, l3, l4, p1, p2, p3, p4] = PEOPLE;
    expect(recordSeating(hit, [l1, l2, p1, p2, l3, l4, p3, p4])).toEqual({ trials: 2, hits: 1 });
  });

  it('seatingBlock puts event A in block 0 and every other seating in blocks 1–34', () => {
    expect(seatingBlock(true, () => 0.99)).toBe(0);
    expect(seatingBlock(false, () => 0)).toBe(1);
    expect(seatingBlock(false, () => 0.999999)).toBe(SEATING.blocks - 1);
    const random = seeded(5);
    for (let i = 0; i < 500; i += 1) {
      const block = seatingBlock(false, random);
      expect(block).toBeGreaterThanOrEqual(1);
      expect(block).toBeLessThanOrEqual(SEATING.blocks - 1);
    }
  });
});

describe('visualisasi terhubung ke soal', () => {
  it('every exercise is visualised, and every visualisation points at a real exercise', () => {
    const all = exercises.map((e) => e.id).sort();
    expect([...visualizedExerciseIds].sort()).toEqual(all);
  });

  it('shows the same answers as the worked solutions', () => {
    expect(exercise('soal-1').answerText).toContain(evaluateCompound(compoundScenario('soal-1'), 'union').probability);
    expect(exercise('soal-2').answerText).toContain(evaluateCompound(compoundScenario('soal-2'), 'union').probability);
    expect(exercise('soal-3').answerText).toContain(fraction(SEATING.event, SEATING.space));
  });

  it('compound scenarios belong to the lesson their exercise belongs to', () => {
    for (const s of COMPOUND_SCENARIOS.filter((x) => x.exerciseId)) {
      expect(exercise(s.exerciseId!).lessonSlug).toBe('kejadian-majemuk');
    }
    expect(exercise('soal-3').lessonSlug).toBe('ruang-sampel');
  });
});
