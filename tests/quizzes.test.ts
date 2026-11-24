import { describe, it, expect } from 'vitest';
import { quizzes, quizForLesson, type QuizQuestion } from '../lib/quizzes';
import { materials } from '../lib/materials';
import { complement, dice, intersection, probability, union } from '../lib/math';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const simplest = (num: number, den: number) => {
  const g = gcd(num, den);
  return den / g === 1 ? `${num / g}` : `${num / g}/${den / g}`;
};

const nums = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
const byValue = (a: string, b: string) => Number(a) - Number(b);
const braces = (items: readonly string[]) => `{${items.join(', ')}}`;

/** Hasil kali kartesius: tiap bagian adalah daftar hasil satu tahap; hasil digabung menjadi satu string. */
const cartesian = (stages: readonly (readonly string[])[]): string[] =>
  stages.reduce<string[]>(
    (acc, stage) => acc.flatMap((prefix) => stage.map((outcome) => `${prefix}${outcome}`)),
    ['']
  );

const isPrime = (n: number) => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);

/** Nilai numerik sebuah pilihan: "a/b", bilangan bulat, atau "n kali". */
const valueOf = (option: string): number => {
  const fraction = option.match(/^(\d+)\/(\d+)$/);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  const whole = option.match(/^(\d+)(?: kali)?$/);
  if (whole) return Number(whole[1]);
  throw new Error(`Format pilihan tidak dikenal: ${option}`);
};

const probabilityOf = (q: QuizQuestion, members: readonly string[]) =>
  probability({ id: q.id, outcomes: q.space, equallyLikely: true }, { id: 'A', label: 'A', members });

/**
 * Untuk setiap soal: bangun ulang ruang sampel dan kejadian dari aturan di soal (bukan dari
 * `space`/`counted` yang ditulis), cocokkan, lalu hitung jawaban yang benar sebagai teks pilihan.
 */
const recompute: Record<string, (q: QuizQuestion) => string> = {
  'kuis-ruang-sampel-1': (q) => {
    const space = cartesian([['A', 'G'], ['A', 'G']]);
    expect(q.space).toEqual(space);
    expect(q.counted).toEqual(space);
    return String(space.length);
  },
  'kuis-ruang-sampel-2': (q) => {
    expect(q.space).toEqual(dice.outcomes);
    const a = dice.outcomes.filter((x) => Number(x) % 2 === 0 && Number(x) < 6);
    expect(q.counted).toEqual(a);
    return String(a.length);
  },
  'kuis-ruang-sampel-3': (q) => {
    const bag = [
      ...Array.from({ length: 3 }, (_, i) => `M${i + 1}`),
      ...Array.from({ length: 2 }, (_, i) => `B${i + 1}`),
      'H1',
    ];
    expect(q.space).toEqual(bag);
    expect(q.counted).toEqual(bag);
    return String(bag.length);
  },
  'kuis-peluang-komplemen-1': (q) => {
    const space = nums(1, 10);
    expect(q.space).toEqual(space);
    const a = space.filter((x) => isPrime(Number(x)));
    expect(q.counted).toEqual(a);
    expect(probabilityOf(q, a)).toBe(a.length / space.length);
    return simplest(a.length, space.length);
  },
  'kuis-peluang-komplemen-2': (q) => {
    const space = nums(1, 20);
    expect(q.space).toEqual(space);
    const a = space.filter((x) => Number(x) % 4 === 0);
    expect(q.counted).toEqual(a);
    const notA = complement(space, a);
    expect(notA).toHaveLength(space.length - a.length);
    expect(1 - probabilityOf(q, a)).toBeCloseTo(notA.length / space.length);
    return simplest(notA.length, space.length);
  },
  'kuis-peluang-komplemen-3': (q) => {
    const space = cartesian([['A', 'G'], ['A', 'G'], ['A', 'G']]);
    expect(q.space).toEqual(space);
    const noTail = space.filter((s) => !s.includes('G'));
    expect(q.counted).toEqual(noTail);
    const atLeastOneTail = complement(space, noTail);
    expect(atLeastOneTail).toEqual(space.filter((s) => s.includes('G')));
    expect(1 - probabilityOf(q, noTail)).toBeCloseTo(atLeastOneTail.length / space.length);
    return simplest(atLeastOneTail.length, space.length);
  },
  'kuis-frekuensi-kejadian-1': (q) => {
    const results = [3, 6, 2, 6, 5, 1, 6, 4, 6, 2, 3, 6];
    expect(q.prompt).toContain(results.join(', '));
    const space = results.map((_, i) => `ke-${i + 1}`);
    expect(q.space).toEqual(space);
    const sixes = space.filter((_, i) => results[i] === 6);
    expect(q.counted).toEqual(sixes);
    return simplest(sixes.length, results.length);
  },
  'kuis-frekuensi-kejadian-2': (q) => {
    const results = ['A', 'G', 'G', 'A', 'A', 'G', 'A', 'G', 'G', 'G'];
    expect(q.prompt).toContain(results.join(', '));
    const space = results.map((_, i) => `ke-${i + 1}`);
    expect(q.space).toEqual(space);
    const tails = space.filter((_, i) => results[i] === 'G');
    expect(q.counted).toEqual(tails);
    return simplest(tails.length, results.length);
  },
  'kuis-frekuensi-kejadian-3': (q) => {
    const results = ['merah', 'biru', 'merah', 'merah', 'hijau', 'merah', 'biru', 'merah'];
    expect(q.prompt).toContain(results.join(', '));
    const space = results.map((_, i) => `ke-${i + 1}`);
    expect(q.space).toEqual(space);
    const reds = space.filter((_, i) => results[i] === 'merah');
    expect(q.counted).toEqual(reds);
    return simplest(reds.length, results.length);
  },
  'kuis-frekuensi-harapan-1': (q) => {
    const n = 90;
    expect(q.prompt).toContain(`${n} kali`);
    expect(q.space).toEqual(dice.outcomes);
    const a = dice.outcomes.filter((x) => Number(x) < 3);
    expect(q.counted).toEqual(a);
    const expected = probabilityOf(q, a) * n;
    expect(Number.isInteger(Math.round(expected))).toBe(true);
    expect(expected).toBeCloseTo(Math.round(expected));
    return `${Math.round(expected)} kali`;
  },
  'kuis-frekuensi-harapan-2': (q) => {
    const n = 200;
    expect(q.prompt).toContain(`${n} kali`);
    const space = ['H1', 'H2', 'H3', ...Array.from({ length: 5 }, (_, i) => `Z${i + 1}`)];
    expect(q.space).toEqual(space);
    const a = space.filter((x) => x.startsWith('H'));
    expect(q.counted).toEqual(a);
    const expected = probabilityOf(q, a) * n;
    expect(expected).toBeCloseTo(Math.round(expected));
    return `${Math.round(expected)} kali`;
  },
  'kuis-frekuensi-harapan-3': (q) => {
    const n = 80;
    expect(q.prompt).toContain(`${n} kali`);
    const space = cartesian([['A', 'G'], ['A', 'G'], ['A', 'G']]);
    expect(q.space).toEqual(space);
    const a = space.filter((x) => x === 'AAA');
    expect(q.counted).toEqual(a);
    const expected = probabilityOf(q, a) * n;
    expect(expected).toBeCloseTo(Math.round(expected));
    return `${Math.round(expected)} kali`;
  },
  'kuis-kejadian-majemuk-1': (q) => {
    expect(q.space).toEqual(dice.outcomes);
    const a = dice.outcomes.filter((x) => Number(x) < 4);
    const b = dice.outcomes.filter((x) => Number(x) % 2 === 0);
    const both = intersection(a, b);
    const either = union(a, b).sort(byValue);
    expect(both).toEqual(['2']);
    expect(q.counted).toEqual(either);
    expect(q.explanation).toContain(`A = ${braces(a)}`);
    expect(q.explanation).toContain(`B = ${braces(b)}`);
    expect(q.explanation).toContain(`A ∩ B = ${braces(both)}`);
    const inclusionExclusion = probabilityOf(q, a) + probabilityOf(q, b) - probabilityOf(q, both);
    expect(inclusionExclusion).toBeCloseTo(either.length / q.space.length);
    return simplest(either.length, q.space.length);
  },
  'kuis-kejadian-majemuk-2': (q) => {
    const space = nums(1, 12);
    expect(q.space).toEqual(space);
    const a = space.filter((x) => Number(x) % 5 === 0);
    const b = space.filter((x) => Number(x) > 10);
    expect(intersection(a, b)).toEqual([]);
    const either = union(a, b).sort(byValue);
    expect(q.counted).toEqual(either);
    expect(q.explanation).toContain(`A = ${braces(a)}`);
    expect(q.explanation).toContain(`B = ${braces(b)}`);
    expect(probabilityOf(q, a) + probabilityOf(q, b)).toBeCloseTo(either.length / space.length);
    return simplest(either.length, space.length);
  },
  'kuis-kejadian-majemuk-3': (q) => {
    const space = nums(1, 20);
    expect(q.space).toEqual(space);
    const a = space.filter((x) => Number(x) % 2 === 0);
    const b = space.filter((x) => Number(x) % 3 === 0);
    const both = intersection(a, b);
    expect(both).toEqual(['6', '12', '18']);
    const either = union(a, b).sort(byValue);
    expect(q.counted).toEqual(either);
    expect(q.explanation).toContain(`A = ${braces(a)}`);
    expect(q.explanation).toContain(`B = ${braces(b)}`);
    expect(q.explanation).toContain(`A ∩ B = ${braces(both)}`);
    expect(a.length + b.length - both.length).toBe(either.length);
    return simplest(either.length, space.length);
  },
  'kuis-bebas-bersyarat-1': (q) => {
    const bag = ['M1', 'M2', 'M3', 'B1'];
    const space = bag.flatMap((first) =>
      bag.filter((second) => second !== first).map((second) => `${first}${second}`)
    );
    expect(space).toHaveLength(4 * 3);
    expect(q.space).toEqual(space);
    const bothRed = space.filter((pair) => pair.startsWith('M') && pair.slice(2).startsWith('M'));
    expect(q.counted).toEqual(bothRed);
    const chained = (3 / 4) * (2 / 3);
    expect(probabilityOf(q, bothRed)).toBeCloseTo(chained);
    return simplest(bothRed.length, space.length);
  },
  'kuis-bebas-bersyarat-2': (q) => {
    const space = nums(1, 10);
    expect(q.space).toEqual(space);
    const given = space.filter((x) => Number(x) % 2 === 0);
    expect(q.given).toEqual(given);
    const a = space.filter((x) => Number(x) > 7);
    const aAndGiven = intersection(a, given);
    expect(q.counted).toEqual(aAndGiven);
    expect(q.explanation).toContain(`G = ${braces(given)}`);
    // P(A | G) = P(A ∩ G) / P(G) harus sama dengan n(A ∩ G) / n(G).
    expect(probabilityOf(q, aAndGiven) / probabilityOf(q, given)).toBeCloseTo(
      aAndGiven.length / given.length
    );
    return simplest(aAndGiven.length, given.length);
  },
  'kuis-bebas-bersyarat-3': (q) => {
    const space = cartesian([dice.outcomes, ['A', 'G']]);
    expect(space).toHaveLength(12);
    expect(q.space).toEqual(space);
    const both = space.filter((s) => Number(s[0]) > 4 && s[1] === 'A');
    expect(q.counted).toEqual(both);
    const diceOnly = dice.outcomes.filter((x) => Number(x) > 4);
    const product = probability(dice, { id: 'D', label: 'D', members: diceOnly }) * 0.5;
    expect(probabilityOf(q, both)).toBeCloseTo(product);
    return simplest(both.length, space.length);
  },
};

describe('Kuis: struktur dan data', () => {
  it('setiap materi punya tepat 3 soal dan total 18', () => {
    expect(quizzes).toHaveLength(18);
    for (const m of materials) expect(quizForLesson(m.slug)).toHaveLength(3);
  });

  it('id unik, berawalan kuis-, sesuai pola kuis-<slug>-1..3', () => {
    expect(new Set(quizzes.map((q) => q.id)).size).toBe(quizzes.length);
    for (const m of materials) {
      expect(quizForLesson(m.slug).map((q) => q.id)).toEqual([1, 2, 3].map((n) => `kuis-${m.slug}-${n}`));
    }
    for (const q of quizzes) expect(q.id.startsWith('kuis-')).toBe(true);
  });

  it('setiap soal merujuk materi yang ada', () => {
    const slugs = new Set(materials.map((m) => m.slug));
    for (const q of quizzes) expect(slugs.has(q.lessonSlug)).toBe(true);
  });

  it('pilihan: empat teks tak kosong yang berbeda, correctIndex dalam rentang', () => {
    for (const q of quizzes) {
      expect(q.options).toHaveLength(4);
      for (const option of q.options) {
        expect(typeof option).toBe('string');
        expect(option.trim().length).toBeGreaterThan(0);
      }
      expect(new Set(q.options).size).toBe(4);
      expect([0, 1, 2, 3]).toContain(q.correctIndex);
      expect(Number.isInteger(q.correctIndex)).toBe(true);
    }
  });

  it('ruang sampel unik; counted dan given adalah himpunan bagian tanpa duplikat', () => {
    for (const q of quizzes) {
      expect(q.space.length).toBeGreaterThan(0);
      expect(new Set(q.space).size).toBe(q.space.length);
      expect(q.counted.length).toBeGreaterThan(0);
      expect(new Set(q.counted).size).toBe(q.counted.length);
      expect(q.counted.every((x) => q.space.includes(x))).toBe(true);
      if (q.given) {
        expect(new Set(q.given).size).toBe(q.given.length);
        expect(q.given.every((x) => q.space.includes(x))).toBe(true);
        expect(q.counted.every((x) => q.given!.includes(x))).toBe(true);
      }
    }
  });

  it('semua teks berisi dan tex (jika ada) memiliki kurung kurawal seimbang', () => {
    for (const q of quizzes) {
      expect(q.prompt.length).toBeGreaterThan(0);
      expect(q.explanation.length).toBeGreaterThan(0);
      if (q.tex !== undefined) {
        expect(q.tex.length).toBeGreaterThan(0);
        const opens = (q.tex.match(/\{/g) ?? []).length;
        const closes = (q.tex.match(/\}/g) ?? []).length;
        expect(opens).toBe(closes);
        expect(q.tex).not.toContain('\\\\');
      }
    }
  });

  it('quizForLesson mengembalikan [] untuk slug tak dikenal, null, atau kosong', () => {
    expect(quizForLesson('tidak-ada')).toEqual([]);
    expect(quizForLesson('')).toEqual([]);
    expect(quizForLesson(undefined as unknown as string)).toEqual([]);
  });

  it('quizForLesson mengembalikan salinan sehingga mengubahnya tidak mengubah data', () => {
    const first = quizForLesson('ruang-sampel');
    first.pop();
    expect(quizForLesson('ruang-sampel')).toHaveLength(3);
  });
});

describe('Kuis: jawaban dihitung ulang dari ruang sampel', () => {
  it('setiap soal punya aturan hitung ulang, dan sebaliknya', () => {
    expect(Object.keys(recompute).sort()).toEqual(quizzes.map((q) => q.id).sort());
  });

  for (const q of quizzes) {
    describe(q.id, () => {
      const answerOf = () => recompute[q.id](q);

      it('opsi pada correctIndex sama dengan hasil hitung ulang', () => {
        expect(q.options[q.correctIndex]).toBe(answerOf());
      });

      it('tidak ada opsi lain yang bernilai sama dengan jawaban', () => {
        const answer = answerOf();
        const wrong = q.options.filter((_, i) => i !== q.correctIndex);
        for (const option of wrong) expect(valueOf(option)).not.toBeCloseTo(valueOf(answer));
        expect(new Set(q.options.map(valueOf)).size).toBe(4);
      });

      it('pembahasan menyebut hasil yang dihitung sebelum angka jawaban', () => {
        const answer = answerOf();
        const listed = braces(q.counted);
        expect(q.explanation).toContain(listed);
        expect(q.explanation.indexOf(listed)).toBeLessThan(q.explanation.lastIndexOf(answer));
        if (q.given) expect(q.explanation).toContain(braces(q.given));
      });

      it('pembahasan menampilkan pecahan dalam bentuk paling sederhana di akhir', () => {
        for (const m of q.explanation.matchAll(/(\d+)\/(\d+)/g)) {
          const [num, den] = [Number(m[1]), Number(m[2])];
          const rest = q.explanation.slice(m.index + m[0].length);
          if (gcd(num, den) > 1) expect(rest.startsWith(' = ')).toBe(true);
        }
      });
    });
  }
});
