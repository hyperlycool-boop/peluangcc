export interface SolutionStep {
  text: string;
  tex?: string;
}

export interface Exercise {
  id: string;
  title: string;
  /** Lesson (slug in lib/materials.ts) whose idea the exercise practises. */
  lessonSlug: string;
  question: string;
  /** Background the solver needs before reading the solution. */
  prerequisite?: string;
  steps: readonly SolutionStep[];
  answerTex: string;
  answerText: string;
}

export const exercises: readonly Exercise[] = [
  {
    id: 'soal-1',
    title: 'Bola merah atau hijau',
    lessonSlug: 'kejadian-majemuk',
    question:
      'Dalam sebuah kantong terdapat 6 bola merah, 4 bola biru, dan 5 bola hijau. Jika diambil satu bola secara acak, berapakah peluang terambilnya bola merah atau bola hijau?',
    steps: [
      {
        text: 'Banyak seluruh bola menentukan ruang sampel. Setiap bola dianggap sama mungkin terambil.',
        tex: 'n(S)=6+4+5=15',
      },
      {
        text: 'Misalkan M kejadian terambil bola merah dan H kejadian terambil bola hijau. Satu bola tidak mungkin berwarna merah sekaligus hijau, sehingga M dan H saling lepas.',
        tex: 'n(M)=6,\\quad n(H)=5,\\quad M\\cap H=\\varnothing',
      },
      {
        text: 'Untuk kejadian saling lepas, peluang gabungan adalah jumlah peluang masing-masing.',
        tex: 'P(M\\cup H)=P(M)+P(H)=\\frac{6}{15}+\\frac{5}{15}=\\frac{11}{15}',
      },
      {
        text: 'Pemeriksaan dengan komplemen: kejadian “bukan merah dan bukan hijau” adalah terambil bola biru.',
        tex: '1-P(\\text{biru})=1-\\frac{4}{15}=\\frac{11}{15}',
      },
    ],
    answerTex: 'P(M\\cup H)=\\frac{11}{15}',
    answerText: 'Peluang terambil bola merah atau hijau adalah 11/15.',
  },
  {
    id: 'soal-2',
    title: 'Kartu As atau King',
    lessonSlug: 'kejadian-majemuk',
    question:
      'Sebuah kartu diambil dari satu set kartu bridge. Tentukan peluang terambilnya kartu As atau kartu King!',
    prerequisite:
      'Satu set kartu bridge berisi 52 kartu tanpa joker: empat jenis (sekop, hati, keriting, wajik), masing-masing 13 kartu, dan setiap jenis punya satu As dan satu King.',
    steps: [
      {
        text: 'Setiap kartu dianggap sama mungkin terambil, sehingga ruang sampelnya berisi 52 kartu.',
        tex: 'n(S)=52',
      },
      {
        text: 'Ada 4 kartu As dan 4 kartu King. Satu kartu tidak mungkin sekaligus As dan King, sehingga kedua kejadian saling lepas.',
        tex: 'n(\\text{As})=4,\\quad n(\\text{King})=4,\\quad \\text{As}\\cap\\text{King}=\\varnothing',
      },
      {
        text: 'Jumlahkan peluang kedua kejadian, lalu sederhanakan pecahannya dengan membagi 4.',
        tex: 'P(\\text{As}\\cup\\text{King})=\\frac{4}{52}+\\frac{4}{52}=\\frac{8}{52}=\\frac{2}{13}',
      },
    ],
    answerTex: 'P(\\text{As}\\cup\\text{King})=\\frac{2}{13}',
    answerText: 'Peluang terambil As atau King adalah 8/52 = 2/13.',
  },
  {
    id: 'soal-3',
    title: 'Duduk berselang-seling di meja bundar',
    lessonSlug: 'ruang-sampel',
    question:
      'Empat laki-laki dan empat perempuan duduk mengelilingi sebuah meja bundar secara acak. Berapakah peluang posisi duduk laki-laki dan perempuan selalu berselang-seling?',
    prerequisite:
      'Faktorial: n! = n × (n − 1) × … × 1, misalnya 3! = 6 dan 4! = 24. Kedelapan orang dianggap berbeda. Dua susunan dianggap sama jika yang satu dapat diputar menjadi yang lain; susunan cermin dianggap berbeda. Jika susunan cermin dianggap sama, banyak susunan pada ruang sampel dan pada kejadian sama-sama menjadi setengahnya, sehingga peluangnya tidak berubah.',
    steps: [
      {
        text: 'Ruang sampel: tetapkan satu orang pada satu kursi sebagai acuan agar putaran tidak terhitung berulang. Tujuh orang lainnya dapat diatur dalam 7! cara.',
        tex: 'n(S)=(8-1)!=7!=5040',
      },
      {
        text: 'Kejadian A (berselang-seling): tetapkan satu laki-laki sebagai acuan. Kursi laki-laki harus berselang satu kursi, sehingga tiga laki-laki lain mengisi tiga kursi laki-laki yang tersisa dengan 3! cara. Empat perempuan mengisi empat kursi di antaranya dengan 4! cara.',
        tex: 'n(A)=3!\\times 4!=6\\times 24=144',
      },
      {
        text: 'Peluang adalah banyak susunan yang memenuhi dibagi banyak seluruh susunan.',
        tex: 'P(A)=\\frac{144}{5040}=\\frac{1}{35}',
      },
    ],
    answerTex: 'P(A)=\\frac{1}{35}',
    answerText: 'Peluang laki-laki dan perempuan duduk berselang-seling adalah 144/5040 = 1/35.',
  },
] as const;

export function exercisesForLesson(slug: string): Exercise[] {
  return exercises.filter((e) => e.lessonSlug === slug);
}
