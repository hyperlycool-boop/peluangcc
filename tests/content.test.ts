import { describe, it, expect } from 'vitest';
import { exercises, exercisesForLesson } from '../lib/exercises';
import { materials } from '../lib/materials';
import { citations, formatAccessDate, getCitation, sortedCitations } from '../lib/citations';
import { SITE_PAGES } from '../lib/site-pages';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const simplest = (num: number, den: number) => `${num / gcd(num, den)}/${den / gcd(num, den)}`;

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest])
  );
}

const exercise = (id: string) => {
  const found = exercises.find((e) => e.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

const formulaText = (slug: string) =>
  materials
    .find((m) => m.slug === slug)!
    .formulas.map((f) => f.tex)
    .join(' | ');

describe('Latihan soal: jawaban dihitung ulang tanpa rumus', () => {
  it('soal 1: bola merah atau hijau dari 6 merah, 4 biru, 5 hijau', () => {
    const bag = [...Array(6).fill('merah'), ...Array(4).fill('biru'), ...Array(5).fill('hijau')];
    const hits = bag.filter((b) => b === 'merah' || b === 'hijau').length;
    expect(bag).toHaveLength(15);
    expect(simplest(hits, bag.length)).toBe('11/15');
    expect(exercise('soal-1').answerText).toContain('11/15');
  });

  it('soal 2: As atau King dari 52 kartu bridge', () => {
    const ranks = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
    const deck = ['sekop', 'hati', 'keriting', 'wajik'].flatMap((suit) => ranks.map((rank) => ({ suit, rank })));
    const hits = deck.filter((c) => c.rank === 'As' || c.rank === 'King').length;
    expect(deck).toHaveLength(52);
    expect(hits).toBe(8);
    expect(simplest(hits, deck.length)).toBe('2/13');
    expect(exercise('soal-2').answerText).toContain('2/13');
  });

  it('soal 3: 4 laki-laki dan 4 perempuan berselang-seling di meja bundar', () => {
    // Orang 0..3 laki-laki, 4..7 perempuan. Orang 0 dikunci di kursi 0 agar putaran tidak terhitung ganda.
    const rest = permutations([1, 2, 3, 4, 5, 6, 7]);
    const isMan = (person: number) => person < 4;
    const alternating = rest.filter((others) => {
      const seats = [0, ...others];
      return seats.every((person, i) => isMan(person) === (i % 2 === 0));
    });
    expect(rest).toHaveLength(5040);
    expect(alternating).toHaveLength(144);
    expect(simplest(alternating.length, rest.length)).toBe('1/35');
    expect(exercise('soal-3').answerText).toContain('1/35');
  });

  it('setiap soal punya langkah, jawaban, dan materi terkait yang ada', () => {
    expect(exercises).toHaveLength(3);
    for (const e of exercises) {
      expect(e.steps.length).toBeGreaterThan(1);
      expect(e.answerTex.length).toBeGreaterThan(0);
      expect(materials.some((m) => m.slug === e.lessonSlug)).toBe(true);
    }
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
    expect(exercisesForLesson('kejadian-majemuk').map((e) => e.id)).toEqual(['soal-1', 'soal-2']);
  });
});

describe('Rumus pada materi', () => {
  it('peluang kejadian menyebut batas 0 sampai 1, mustahil, dan pasti', () => {
    const m = materials.find((x) => x.slug === 'peluang-komplemen')!;
    expect(formulaText(m.slug)).toContain('0\\le P(A)\\le 1');
    expect(m.intro).toMatch(/mustahil/);
    expect(m.intro).toMatch(/pasti/);
  });

  it('frekuensi memuat bentuk persen', () => {
    expect(formulaText('frekuensi-kejadian')).toContain('100\\%');
  });

  it('kejadian majemuk memuat rumus saling lepas dan tidak saling lepas', () => {
    const tex = formulaText('kejadian-majemuk');
    expect(tex).toContain('P(A\\cup B)=P(A)+P(B)-P(A\\cap B)');
    expect(tex).toContain('P(A\\cup B)=P(A)+P(B)');
    expect(tex.split(' | ')).toContain('P(A\\cup B)=P(A)+P(B)');
  });

  it('saling lepas ditulis n(A ∩ B) = 0, bukan ≠ 0 seperti salah ketik pada lembar guru', () => {
    const m = materials.find((x) => x.slug === 'kejadian-majemuk')!;
    expect(m.intro).toContain('n(A ∩ B) = 0');
    for (const material of materials) {
      expect(JSON.stringify(material)).not.toMatch(/n\(A ∩ B\) ≠ 0/);
    }
  });

  it('bebas dan bersyarat memuat perkalian saling bebas, bersyarat, dan pembagian', () => {
    const tex = formulaText('bebas-bersyarat');
    expect(tex).toContain('P(A\\cap B)=P(A)\\times P(B)');
    expect(tex).toContain('P(A\\cap B)=P(A)\\times P(B\\mid A)');
    expect(tex).toContain('P(B\\mid A)=\\frac{P(A\\cap B)}{P(A)}');
  });

  it('contoh bersyarat konsisten: (3/10) ÷ (3/5) = 2/4', () => {
    expect((3 / 10) / (3 / 5)).toBeCloseTo(2 / 4);
  });

  it('setiap materi punya minimal satu rumus berlabel', () => {
    for (const m of materials) {
      expect(m.formulas.length).toBeGreaterThan(0);
      for (const f of m.formulas) {
        expect(f.label.length).toBeGreaterThan(0);
        expect(f.tex.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('Sumber dan referensi', () => {
  it('setiap materi mencantumkan sumber yang terdaftar', () => {
    for (const m of materials) {
      expect(m.sources.length).toBeGreaterThan(0);
      for (const id of m.sources) expect(() => getCitation(id)).not.toThrow();
    }
  });

  it('setiap sumber dipakai oleh materi atau latihan', () => {
    const used = new Set([...materials.flatMap((m) => m.sources), 'lembar-guru']);
    for (const c of citations) expect(used.has(c.id)).toBe(true);
  });

  it('sumber daring punya URL https dan tanggal akses; sumber lain tidak', () => {
    for (const c of citations) {
      if (c.url) {
        expect(new URL(c.url).protocol).toBe('https:');
        expect(c.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      } else {
        expect(c.accessed).toBeUndefined();
      }
      expect(c.note.length).toBeGreaterThan(0);
    }
  });

  it('daftar pustaka berurutan menurut penulis', () => {
    const authors = sortedCitations().map((c) => c.author);
    expect(authors).toEqual([...authors].sort((a, b) => a.localeCompare(b, 'id')));
  });

  it('memformat tanggal akses dalam bahasa Indonesia', () => {
    expect(formatAccessDate('2026-10-27')).toBe('27 Oktober 2026');
    expect(formatAccessDate('2026-01-05')).toBe('5 Januari 2026');
    expect(formatAccessDate('bukan tanggal')).toBe('bukan tanggal');
  });
});

describe('Halaman situs', () => {
  it('Referensi punya tautan unik dan tidak ada halaman Latihan terpisah', () => {
    expect(SITE_PAGES.map((p) => p.href)).toEqual(['/referensi']);
    expect(new Set(SITE_PAGES.map((p) => p.id)).size).toBe(SITE_PAGES.length);
  });
});
