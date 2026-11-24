export interface QuizQuestion {
  /** Unik, berbentuk `kuis-<slug>-<nomor>`. */
  id: string;
  /** Materi (slug di lib/materials.ts) yang diuji. */
  lessonSlug: string;
  /** Pertanyaan dalam Bahasa Indonesia. Semua informasi yang dibutuhkan ada di sini. */
  prompt: string;
  /** Empat pilihan jawaban yang berbeda; tepat satu benar. */
  options: readonly [string, string, string, string];
  /** Indeks pilihan yang benar pada `options`. */
  correctIndex: 0 | 1 | 2 | 3;
  /** Pembahasan: menyebut hasil yang dihitung lebih dulu, baru angkanya. */
  explanation: string;
  /** Rumus kunci dalam KaTeX, ditulis dengan garis miring terbalik ganda seperti lib/materials.ts. */
  tex?: string;
  /** Ruang sampel: semua hasil yang sama mungkin (atau catatan percobaan), tanpa duplikat. */
  space: readonly string[];
  /**
   * Hasil yang dihitung pembahasan, sesuai urutan `space` (atau urutan bilangan).
   * Pada soal bertahap atau gabungan, ini anggota kejadian yang relevan.
   */
  counted: readonly string[];
  /** Kejadian bersyarat yang diketahui telah terjadi; hanya ada pada soal peluang bersyarat. */
  given?: readonly string[];
}

const numbers = (from: number, to: number): string[] =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

const DICE = numbers(1, 6);

/** Semua pasangan terurut dua bola berbeda dari kantong (tanpa pengembalian). */
const orderedPairs = (bag: readonly string[]): string[] =>
  bag.flatMap((first, i) => bag.filter((_, j) => j !== i).map((second) => `${first}${second}`));

/** Semua hasil dadu diikuti sisi koin: 1A, 1G, 2A, ... */
const diceWithCoin = (): string[] => DICE.flatMap((d) => [`${d}A`, `${d}G`]);

const BAG_WITH_ONE_BLUE = ['M1', 'M2', 'M3', 'B1'];

export const quizzes: readonly QuizQuestion[] = [
  // ruang-sampel
  {
    id: 'kuis-ruang-sampel-1',
    lessonSlug: 'ruang-sampel',
    prompt:
      'Dua koin dilempar bersamaan. Koin pertama dan koin kedua dibedakan, dan setiap koin menunjukkan angka (A) atau gambar (G). Berapa banyak titik sampel pada ruang sampelnya?',
    options: ['2', '3', '4', '8'],
    correctIndex: 2,
    explanation:
      'S = {AA, AG, GA, GG}. Koin pertama dan kedua dibedakan, sehingga AG dan GA adalah dua titik sampel yang berbeda. Jadi n(S) = 4.',
    tex: 'n(S)=2\\times 2=4',
    space: ['AA', 'AG', 'GA', 'GG'],
    counted: ['AA', 'AG', 'GA', 'GG'],
  },
  {
    id: 'kuis-ruang-sampel-2',
    lessonSlug: 'ruang-sampel',
    prompt:
      'Dadu adil dilempar satu kali. Kejadian A adalah muncul bilangan genap yang kurang dari 6. Berapa n(A)?',
    options: ['3', '2', '5', '6'],
    correctIndex: 1,
    explanation:
      'A = {2, 4}. Bilangan genap pada dadu adalah 2, 4, dan 6, tetapi 6 tidak kurang dari 6. Jadi n(A) = 2, sedangkan n(S) = 6.',
    tex: 'A\\subseteq S,\\quad n(A)=2,\\quad n(S)=6',
    space: DICE,
    counted: ['2', '4'],
  },
  {
    id: 'kuis-ruang-sampel-3',
    lessonSlug: 'ruang-sampel',
    prompt:
      'Kantong berisi 3 bola merah (M1, M2, M3), 2 bola biru (B1, B2), dan 1 bola hijau (H1). Satu bola diambil secara acak, dan setiap bola sama mungkin terambil. Berapa banyak titik sampel pada ruang sampelnya?',
    options: ['6', '3', '5', '7'],
    correctIndex: 0,
    explanation:
      'S = {M1, M2, M3, B1, B2, H1}. Setiap bola adalah satu titik sampel, bukan setiap warna. Jadi n(S) = 6.',
    tex: 'n(S)=3+2+1=6',
    space: ['M1', 'M2', 'M3', 'B1', 'B2', 'H1'],
    counted: ['M1', 'M2', 'M3', 'B1', 'B2', 'H1'],
  },

  // peluang-komplemen
  {
    id: 'kuis-peluang-komplemen-1',
    lessonSlug: 'peluang-komplemen',
    prompt:
      'Sebuah kartu diambil secara acak dari 10 kartu bernomor 1 sampai 10. Berapa peluang terambil kartu bernomor prima?',
    options: ['2/3', '2/5', '3/5', '4'],
    correctIndex: 1,
    explanation:
      'A = {2, 3, 5, 7}, jadi n(A) = 4 dan n(S) = 10. P(A) = 4/10 = 2/5.',
    tex: 'P(A)=\\frac{n(A)}{n(S)}=\\frac{4}{10}=\\frac{2}{5}',
    space: numbers(1, 10),
    counted: ['2', '3', '5', '7'],
  },
  {
    id: 'kuis-peluang-komplemen-2',
    lessonSlug: 'peluang-komplemen',
    prompt:
      'Sebuah kartu diambil secara acak dari 20 kartu bernomor 1 sampai 20. Berapa peluang terambil kartu yang bukan kelipatan 4?',
    options: ['4/5', '1/4', '15', '3/4'],
    correctIndex: 3,
    explanation:
      'Misalkan A kejadian terambil kelipatan 4: A = {4, 8, 12, 16, 20}, jadi n(A) = 5 dan n(S) = 20. P(A) = 5/20 = 1/4, sehingga P(Aᶜ) = 1 − 1/4 = 3/4.',
    tex: 'P(A^c)=1-P(A)=1-\\frac{1}{4}=\\frac{3}{4}',
    space: numbers(1, 20),
    counted: ['4', '8', '12', '16', '20'],
  },
  {
    id: 'kuis-peluang-komplemen-3',
    lessonSlug: 'peluang-komplemen',
    prompt:
      'Tiga koin dilempar bersamaan, dan setiap koin menunjukkan angka (A) atau gambar (G). Berapa peluang muncul paling sedikit satu gambar?',
    options: ['1/8', '3/8', '7/8', '3/4'],
    correctIndex: 2,
    explanation:
      'S memuat 8 titik sampel: AAA, AAG, AGA, AGG, GAA, GAG, GGA, GGG. Misalkan B kejadian paling sedikit satu gambar. Komplemennya, tidak ada gambar, adalah Bᶜ = {AAA}, jadi n(Bᶜ) = 1 dan n(S) = 8. P(Bᶜ) = 1/8, sehingga P(B) = 1 − 1/8 = 7/8.',
    tex: 'P(B)=1-P(B^c)=1-\\frac{1}{8}=\\frac{7}{8}',
    space: ['AAA', 'AAG', 'AGA', 'AGG', 'GAA', 'GAG', 'GGA', 'GGG'],
    counted: ['AAA'],
  },

  // frekuensi-kejadian
  {
    id: 'kuis-frekuensi-kejadian-1',
    lessonSlug: 'frekuensi-kejadian',
    prompt:
      'Dadu dilempar 12 kali dan hasilnya dicatat berurutan: 3, 6, 2, 6, 5, 1, 6, 4, 6, 2, 3, 6. Berapa frekuensi relatif munculnya angka 6?',
    options: ['1/6', '5/12', '5', '7/12'],
    correctIndex: 1,
    explanation:
      'Angka 6 muncul pada lemparan A = {ke-2, ke-4, ke-7, ke-9, ke-12}, jadi f = 5 dan n = 12. Fr = 5/12. Nilai ini boleh berbeda dari peluang teori 1/6.',
    tex: 'F_r=\\frac{f}{n}=\\frac{5}{12}',
    space: [
      'ke-1',
      'ke-2',
      'ke-3',
      'ke-4',
      'ke-5',
      'ke-6',
      'ke-7',
      'ke-8',
      'ke-9',
      'ke-10',
      'ke-11',
      'ke-12',
    ],
    counted: ['ke-2', 'ke-4', 'ke-7', 'ke-9', 'ke-12'],
  },
  {
    id: 'kuis-frekuensi-kejadian-2',
    lessonSlug: 'frekuensi-kejadian',
    prompt:
      'Dadu adil dilempar 90 kali. Berapa frekuensi harapan muncul angka yang kurang dari 3?',
    options: ['2 kali', '15 kali', '30 kali', '60 kali'],
    correctIndex: 2,
    explanation:
      'A = {1, 2}, jadi n(A) = 2 dan n(S) = 6. P(A) = 2/6 = 1/3. Fh(A) = 1/3 × 90 = 30 kali.',
    tex: 'F_h(A)=P(A)\\times n=\\frac{1}{3}\\times 90=30',
    space: DICE,
    counted: ['1', '2'],
  },
  {
    id: 'kuis-frekuensi-kejadian-3',
    lessonSlug: 'frekuensi-kejadian',
    prompt:
      'Roda undian terbagi menjadi 8 sektor sama besar: 3 sektor hadiah (H1, H2, H3) dan 5 sektor kosong (Z1 sampai Z5). Roda diputar 200 kali. Berapa frekuensi harapan roda berhenti di sektor hadiah?',
    options: ['3 kali', '75 kali', '125 kali', '600 kali'],
    correctIndex: 1,
    explanation:
      'Sektor hadiah A = {H1, H2, H3}, jadi n(A) = 3 dan n(S) = 8. P(A) = 3/8. Fh(A) = 3/8 × 200 = 75 kali.',
    tex: 'F_h(A)=P(A)\\times n=\\frac{3}{8}\\times 200=75',
    space: ['H1', 'H2', 'H3', 'Z1', 'Z2', 'Z3', 'Z4', 'Z5'],
    counted: ['H1', 'H2', 'H3'],
  },

  // kejadian-majemuk
  {
    id: 'kuis-kejadian-majemuk-1',
    lessonSlug: 'kejadian-majemuk',
    prompt:
      'Dadu adil dilempar satu kali. Kejadian A adalah muncul angka kurang dari 4, dan kejadian B adalah muncul angka genap. Berapa P(A ∪ B)?',
    options: ['5/6', '1', '1/6', '2/3'],
    correctIndex: 0,
    explanation:
      'A = {1, 2, 3} dan B = {2, 4, 6}, irisannya A ∩ B = {2}. Gabungannya A ∪ B = {1, 2, 3, 4, 6}, jadi n(A ∪ B) = 5 dan n(S) = 6. P(A ∪ B) = 1/2 + 1/2 − 1/6 = 5/6.',
    tex: 'P(A\\cup B)=P(A)+P(B)-P(A\\cap B)=\\frac{1}{2}+\\frac{1}{2}-\\frac{1}{6}=\\frac{5}{6}',
    space: DICE,
    counted: ['1', '2', '3', '4', '6'],
  },
  {
    id: 'kuis-kejadian-majemuk-2',
    lessonSlug: 'kejadian-majemuk',
    prompt:
      'Sebuah kartu diambil secara acak dari 12 kartu bernomor 1 sampai 12. Kejadian A adalah terambil kelipatan 5, dan kejadian B adalah terambil nomor lebih dari 10. Berapa P(A ∪ B)?',
    options: ['1/36', '1/3', '1/6', '1/2'],
    correctIndex: 1,
    explanation:
      'A = {5, 10} dan B = {11, 12}. Keduanya tidak punya hasil yang sama, A ∩ B = ∅, jadi A dan B saling lepas. A ∪ B = {5, 10, 11, 12}, sehingga n(A ∪ B) = 4 dan n(S) = 12. P(A ∪ B) = 4/12 = 1/3.',
    tex: 'P(A\\cup B)=P(A)+P(B)=\\frac{1}{6}+\\frac{1}{6}=\\frac{1}{3}',
    space: numbers(1, 12),
    counted: ['5', '10', '11', '12'],
  },
  {
    id: 'kuis-kejadian-majemuk-3',
    lessonSlug: 'kejadian-majemuk',
    prompt:
      'Sebuah kartu diambil secara acak dari 20 kartu bernomor 1 sampai 20. Kejadian A adalah terambil kelipatan 2, dan kejadian B adalah terambil kelipatan 3. Berapa P(A ∪ B)?',
    options: ['3/20', '4/5', '1/2', '13/20'],
    correctIndex: 3,
    explanation:
      'A = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20} dan B = {3, 6, 9, 12, 15, 18}. Irisannya A ∩ B = {6, 12, 18}, jadi A dan B tidak saling lepas. A ∪ B = {2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20}, sehingga n(A ∪ B) = 10 + 6 − 3 = 13 dan n(S) = 20. P(A ∪ B) = 13/20.',
    tex: 'P(A\\cup B)=\\frac{10}{20}+\\frac{6}{20}-\\frac{3}{20}=\\frac{13}{20}',
    space: numbers(1, 20),
    counted: ['2', '3', '4', '6', '8', '9', '10', '12', '14', '15', '16', '18', '20'],
  },

  // bebas-bersyarat
  {
    id: 'kuis-bebas-bersyarat-1',
    lessonSlug: 'bebas-bersyarat',
    prompt:
      'Kantong berisi 3 bola merah (M1, M2, M3) dan 1 bola biru (B1). Dua bola diambil berurutan tanpa pengembalian, dan setiap pasangan terurut sama mungkin. Berapa peluang kedua bola merah?',
    options: ['3/4', '9/16', '2/3', '1/2'],
    correctIndex: 3,
    explanation:
      'Pasangan terurut yang keduanya merah: A = {M1M2, M1M3, M2M1, M2M3, M3M1, M3M2}, jadi n(A) = 6 dan n(S) = 4 × 3 = 12. P(A) = 6/12 = 1/2. Hasil yang sama dari (3/4) × (2/3) = 1/2.',
    tex: 'P(M_1\\cap M_2)=P(M_1)\\times P(M_2\\mid M_1)=\\frac{3}{4}\\times\\frac{2}{3}=\\frac{1}{2}',
    space: orderedPairs(BAG_WITH_ONE_BLUE),
    counted: ['M1M2', 'M1M3', 'M2M1', 'M2M3', 'M3M1', 'M3M2'],
  },
  {
    id: 'kuis-bebas-bersyarat-2',
    lessonSlug: 'bebas-bersyarat',
    prompt:
      'Sebuah kartu diambil secara acak dari 10 kartu bernomor 1 sampai 10. Jika diketahui kartu itu genap, berapa peluang nomornya lebih dari 7?',
    options: ['3/10', '1/5', '2/5', '2/3'],
    correctIndex: 2,
    explanation:
      'Syaratnya G = {2, 4, 6, 8, 10}, jadi hanya 5 hasil yang dihitung. Misalkan A nomor lebih dari 7. Anggota A di dalam G adalah A ∩ G = {8, 10}, jadi n(A ∩ G) = 2 dan n(G) = 5. P(A | G) = 2/5.',
    tex: 'P(A\\mid G)=\\frac{n(A\\cap G)}{n(G)}=\\frac{2}{5}',
    space: numbers(1, 10),
    counted: ['8', '10'],
    given: ['2', '4', '6', '8', '10'],
  },
  {
    id: 'kuis-bebas-bersyarat-3',
    lessonSlug: 'bebas-bersyarat',
    prompt:
      'Sebuah dadu dan sebuah koin dilempar bersamaan. Hasilnya ditulis angka dadu diikuti sisi koin (A = angka, G = gambar), misalnya 5A atau 2G. Berapa peluang dadu menunjukkan angka lebih dari 4 dan koin menunjukkan sisi angka?',
    options: ['1/12', '1/6', '1/3', '5/6'],
    correctIndex: 1,
    explanation:
      'Dadu dan koin tidak saling memengaruhi, dan n(S) = 6 × 2 = 12. Hasil yang memenuhi: A = {5A, 6A}, jadi n(A) = 2. P(A) = 2/12 = 1/6. Sama dengan 1/3 × 1/2 = 1/6.',
    tex: 'P(A\\cap B)=P(A)\\times P(B)=\\frac{1}{3}\\times\\frac{1}{2}=\\frac{1}{6}',
    space: diceWithCoin(),
    counted: ['5A', '6A'],
  },
];

export function quizForLesson(slug: string): QuizQuestion[] {
  return quizzes.filter((q) => q.lessonSlug === slug);
}
