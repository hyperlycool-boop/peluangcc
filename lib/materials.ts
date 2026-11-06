export interface LabeledFormula {
  label: string;
  tex: string;
}

export interface Material {
  slug: string;
  title: string;
  description: string;
  caption: string;
  intro: string;
  /** Every formula the lesson relies on, in reading order. */
  formulas: readonly LabeledFormula[];
  example: string;
  question: string;
  answer: string;
  /** Ids from lib/citations.ts. */
  sources: readonly string[];
}

export const materials: readonly Material[] = [
  {
    slug: 'ruang-sampel',
    title: 'Ruang sampel',
    description: 'Dari semua kemungkinan, ke satu kejadian.',
    caption: 'Enam hasil yang mungkin. Tiga di antaranya ganjil.',
    intro:
      'Percobaan adalah kegiatan yang diulang untuk memperoleh hasil tertentu, dan hasil satu percobaan acak belum dapat dipastikan. Ruang sampel S adalah himpunan semua hasil yang mungkin. Setiap anggotanya disebut titik sampel. Kejadian A adalah himpunan bagian dari S.',
    formulas: [
      { label: 'Ruang sampel dan kejadian', tex: 'S=\\{1,2,3,4,5,6\\},\\quad A=\\{1,3,5\\}' },
      { label: 'Kejadian adalah himpunan bagian S', tex: 'A\\subseteq S,\\qquad 0\\le n(A)\\le n(S)' },
    ],
    example:
      'Pada pelemparan satu dadu, hasil 3 adalah satu titik sampel. Kejadian “muncul bilangan ganjil” terdiri dari tiga titik sampel: 1, 3, dan 5.',
    question: 'Apakah kejadian muncul angka lebih dari 4?',
    answer:
      'A = {5, 6}, sehingga n(A) = 2. Ruang sampelnya tetap S = {1, 2, 3, 4, 5, 6}.',
    sources: ['lembar-guru', 'openstax-3-1'],
  },
  {
    slug: 'peluang-komplemen',
    title: 'Peluang & komplemen',
    description: 'Memahami yang terjadi dan yang tidak.',
    caption: 'Kejadian dan komplemennya mengisi seluruh ruang sampel.',
    intro:
      'Untuk hasil elementer yang sama mungkin, peluang adalah perbandingan banyak hasil yang memenuhi kejadian terhadap banyak seluruh hasil. Nilai peluang selalu berada di antara 0 dan 1: nilai 0 menyatakan kejadian yang mustahil terjadi, dan nilai 1 menyatakan kejadian yang pasti terjadi. Komplemen A, ditulis Aᶜ atau “bukan A”, memuat seluruh hasil di S yang bukan anggota A.',
    formulas: [
      { label: 'Peluang kejadian A', tex: 'P(A)=\\frac{n(A)}{n(S)}' },
      { label: 'Batas nilai peluang', tex: '0\\le P(A)\\le 1' },
      { label: 'Peluang komplemen', tex: 'P(A^c)=1-P(A)' },
    ],
    example:
      'Pada dadu adil, A = {1, 3, 5}. Maka P(A) = 3/6 = 1/2. Komplemennya adalah {2, 4, 6}, dengan peluang 1/2. Muncul angka 7 adalah kejadian mustahil (himpunan kosong, peluang 0), sedangkan muncul angka kurang dari 7 adalah kejadian pasti (seluruh S, peluang 1).',
    question: 'Berapa peluang tidak muncul angka 6?',
    answer:
      'P(bukan 6) = 1 − 1/6 = 5/6. Lima hasil memenuhi kejadian: 1, 2, 3, 4, dan 5.',
    sources: ['lembar-guru', 'openstax-3-1'],
  },
  {
    slug: 'frekuensi-kejadian',
    title: 'Frekuensi kejadian',
    description: 'Saat percobaan bertemu perkiraan.',
    caption: 'Frekuensi relatif berfluktuasi di sekitar peluang teori.',
    intro:
      'Frekuensi relatif adalah perbandingan banyak kejadian yang teramati (f) dengan banyak seluruh percobaan (n), dan dapat dinyatakan dalam persen. Frekuensi harapan adalah perkiraan banyak kemunculan kejadian A dari n percobaan berdasarkan peluang teori. Hasil nyata dapat berbeda dari nilai harapan.',
    formulas: [
      { label: 'Frekuensi relatif', tex: 'F_r=\\frac{f}{n}' },
      { label: 'Frekuensi relatif dalam persen', tex: 'F_r=\\frac{f}{n}\\times 100\\%' },
      { label: 'Frekuensi harapan', tex: 'F_h(A)=P(A)\\times n' },
    ],
    example:
      'Koin adil dilempar 100 kali dan sisi angka muncul 47 kali. Frekuensi relatifnya 47/100 = 0,47 atau 47%, sedangkan frekuensi harapannya 0,5 × 100 = 50. Perbedaan ini wajar pada percobaan acak.',
    question: 'Jika dadu adil dilempar 60 kali, berapa frekuensi harapan angka 6?',
    answer:
      'Fh = (1/6) × 60 = 10 kali. Angka 6 tidak wajib muncul tepat 10 kali.',
    sources: ['lembar-guru', 'openstax-3-1'],
  },
  {
    slug: 'kejadian-majemuk',
    title: 'Kejadian majemuk',
    description: 'Dua kejadian. Satu ruang kemungkinan.',
    caption: 'Irisan dihitung dua kali saat A dan B dijumlahkan.',
    intro:
      'Gabungan A ∪ B berarti A atau B, termasuk keduanya. Irisan A ∩ B berarti keduanya sekaligus. Dua kejadian saling lepas jika tidak memiliki titik sampel yang sama, sehingga A ∩ B = ∅ dan n(A ∩ B) = 0. Jika sebaliknya (A ∩ B ≠ ∅), kejadian itu tidak saling lepas: hasil di irisan terhitung dua kali saat peluang A dan B dijumlahkan, jadi kurangi satu salinannya.',
    formulas: [
      { label: 'Tidak saling lepas (A ∩ B ≠ ∅)', tex: 'P(A\\cup B)=P(A)+P(B)-P(A\\cap B)' },
      { label: 'Saling lepas (A ∩ B = ∅)', tex: 'P(A\\cup B)=P(A)+P(B)' },
    ],
    example:
      'Pada dadu adil, A = {1, 3, 5} dan B = {2, 3, 5}. Irisannya {3, 5}. Maka peluang ganjil atau prima adalah 3/6 + 3/6 − 2/6 = 4/6. Jika saling lepas, irisannya kosong dan suku pengurang bernilai 0, sehingga rumusnya menjadi penjumlahan biasa.',
    question: 'Apakah ganjil dan genap saling lepas?',
    answer:
      'Ya. Tidak ada satu hasil dadu yang sekaligus ganjil dan genap. A ∩ B = ∅ dan n(A ∩ B) = 0. Peluang gabungannya 3/6 + 3/6 = 1.',
    sources: ['lembar-guru', 'kemdikbud-2019', 'openstax-3-2'],
  },
  {
    slug: 'bebas-bersyarat',
    title: 'Bebas & bersyarat',
    description: 'Apa yang berubah setelah kejadian pertama?',
    caption: 'Tanpa pengembalian, hasil pertama mengubah peluang berikutnya.',
    intro:
      'Dua kejadian saling bebas apabila terjadi atau tidaknya salah satu tidak memengaruhi peluang yang lain. Pada kejadian bersyarat, kejadian berurutan saling memengaruhi: peluang B bergantung pada telah terjadinya A, ditulis P(B | A). Saling bebas berbeda dari saling lepas.',
    formulas: [
      { label: 'Peluang bersyarat', tex: 'P(B\\mid A)=\\frac{P(A\\cap B)}{P(A)},\\quad P(A)>0' },
      { label: 'Aturan perkalian untuk kejadian bersyarat', tex: 'P(A\\cap B)=P(A)\\times P(B\\mid A)' },
      { label: 'Saling bebas (setara dengan P(B | A) = P(B))', tex: 'P(A\\cap B)=P(A)\\times P(B)' },
    ],
    example:
      'Kantong berisi 3 bola merah dan 2 biru. Peluang dua merah tanpa pengembalian adalah (3/5) × (2/4) = 3/10. Pemeriksaan dengan rumus bersyarat: P(B | A) = (3/10) ÷ (3/5) = 1/2 = 2/4. Dengan pengembalian, komposisi pulih sehingga peluangnya (3/5) × (3/5) = 9/25, dan P(B | A) = P(B) = 3/5 karena kedua pengambilan saling bebas.',
    question: 'Mengapa penyebut pengambilan kedua menjadi 4 tanpa pengembalian?',
    answer:
      'Bola pertama tetap di luar kantong. Tersisa 4 bola; jika bola pertama merah, tinggal 2 merah dan 2 biru. Maka P(merah kedua | merah pertama) = 2/4.',
    sources: ['lembar-guru', 'kemdikbud-2019', 'openstax-3-2'],
  },
] as const;
