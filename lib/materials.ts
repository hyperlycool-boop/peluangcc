export interface Material {
  slug: string;
  title: string;
  description: string;
  caption: string;
  intro: string;
  tex: string;
  example: string;
  question: string;
  answer: string;
}

export const materials: readonly Material[] = [
  {
    slug: 'ruang-sampel',
    title: 'Ruang sampel',
    description: 'Dari semua kemungkinan, ke satu kejadian.',
    caption: 'Enam hasil yang mungkin. Tiga di antaranya ganjil.',
    intro:
      'Percobaan acak dapat diulang, tetapi hasil satu percobaan belum dapat dipastikan. Ruang sampel S adalah himpunan semua hasil yang mungkin. Setiap anggotanya disebut titik sampel. Kejadian A adalah himpunan bagian dari S.',
    tex: 'S=\\{1,2,3,4,5,6\\},\\quad A=\\{1,3,5\\}',
    example:
      'Pada pelemparan satu dadu, hasil 3 adalah satu titik sampel. Kejadian “muncul bilangan ganjil” terdiri dari tiga titik sampel: 1, 3, dan 5.',
    question: 'Apakah kejadian muncul angka lebih dari 4?',
    answer:
      'A = {5, 6}, sehingga n(A) = 2. Ruang sampelnya tetap S = {1, 2, 3, 4, 5, 6}.',
  },
  {
    slug: 'peluang-komplemen',
    title: 'Peluang & komplemen',
    description: 'Memahami yang terjadi dan yang tidak.',
    caption: 'Kejadian dan komplemennya mengisi seluruh ruang sampel.',
    intro:
      'Untuk hasil elementer yang sama mungkin, peluang adalah perbandingan banyak hasil yang memenuhi kejadian terhadap banyak seluruh hasil. Komplemen A memuat seluruh hasil di S yang bukan anggota A.',
    tex: 'P(A)=\\frac{n(A)}{n(S)},\\qquad P(A^c)=1-P(A)',
    example:
      'Pada dadu adil, A = {1, 3, 5}. Maka P(A) = 3/6 = 1/2. Komplemennya adalah {2, 4, 6}, dengan peluang 1/2. Peluang selalu berada di antara 0 dan 1.',
    question: 'Berapa peluang tidak muncul angka 6?',
    answer:
      'P(bukan 6) = 1 − 1/6 = 5/6. Lima hasil memenuhi kejadian: 1, 2, 3, 4, dan 5.',
  },
  {
    slug: 'frekuensi-kejadian',
    title: 'Frekuensi kejadian',
    description: 'Saat percobaan bertemu perkiraan.',
    caption: 'Frekuensi relatif berfluktuasi di sekitar peluang teori.',
    intro:
      'Frekuensi relatif adalah proporsi keberhasilan yang diamati: f dibagi n. Frekuensi harapan adalah perkiraan rata-rata jumlah keberhasilan berdasarkan peluang teori. Hasil nyata dapat berbeda dari nilai harapan.',
    tex: 'F_r=\\frac{f}{n},\\qquad F_h(A)=P(A)\\times n',
    example:
      'Koin adil dilempar 100 kali dan sisi angka muncul 47 kali. Frekuensi relatifnya 47/100 = 0,47, sedangkan frekuensi harapannya 0,5 × 100 = 50. Perbedaan ini wajar pada percobaan acak.',
    question: 'Jika dadu adil dilempar 60 kali, berapa frekuensi harapan angka 6?',
    answer:
      'Fh = (1/6) × 60 = 10 kali. Angka 6 tidak wajib muncul tepat 10 kali.',
  },
  {
    slug: 'kejadian-majemuk',
    title: 'Kejadian majemuk',
    description: 'Dua kejadian. Satu ruang kemungkinan.',
    caption: 'Irisan dihitung dua kali saat A dan B dijumlahkan.',
    intro:
      'Gabungan A ∪ B berarti A atau B, termasuk keduanya. Irisan A ∩ B berarti keduanya sekaligus. Saat menjumlahkan peluang A dan B, hasil di irisan terhitung dua kali; kurangi satu salinannya.',
    tex: 'P(A\\cup B)=P(A)+P(B)-P(A\\cap B)',
    example:
      'Pada dadu adil, A = {1, 3, 5} dan B = {2, 3, 5}. Irisannya {3, 5}. Maka peluang ganjil atau prima adalah 3/6 + 3/6 − 2/6 = 4/6. Jika saling lepas, irisannya kosong dan suku pengurang bernilai 0.',
    question: 'Apakah ganjil dan genap saling lepas?',
    answer:
      'Ya. Tidak ada satu hasil dadu yang sekaligus ganjil dan genap. A ∩ B = ∅ dan n(A ∩ B) = 0. Peluang gabungannya 3/6 + 3/6 = 1.',
  },
  {
    slug: 'bebas-bersyarat',
    title: 'Bebas & bersyarat',
    description: 'Apa yang berubah setelah kejadian pertama?',
    caption: 'Tanpa pengembalian, hasil pertama mengubah peluang berikutnya.',
    intro:
      'Kejadian saling bebas apabila informasi tentang A tidak mengubah peluang B. Peluang bersyarat P(B | A) menghitung peluang B setelah diketahui A terjadi. Saling bebas berbeda dari saling lepas.',
    tex: 'P(A\\cap B)=P(A)P(B\\mid A),\\quad P(A)>0',
    example:
      'Kantong berisi 3 bola merah dan 2 biru. Peluang dua merah tanpa pengembalian adalah (3/5) × (2/4) = 3/10. Dengan pengembalian, komposisi pulih sehingga peluangnya (3/5) × (3/5) = 9/25. Pada kejadian bebas, P(B | A) = P(B).',
    question: 'Mengapa penyebut pengambilan kedua menjadi 4 tanpa pengembalian?',
    answer:
      'Bola pertama tetap di luar kantong. Tersisa 4 bola; jika bola pertama merah, tinggal 2 merah dan 2 biru. Maka P(merah kedua | merah pertama) = 2/4.',
  },
] as const;
