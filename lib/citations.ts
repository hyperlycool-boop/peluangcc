export interface Citation {
  id: string;
  author: string;
  /** Absent when the source gives no year (for example a teacher's handout). */
  year?: number;
  title: string;
  publisher: string;
  /** Online sources only. */
  url?: string;
  /** ISO date; required whenever `url` is present. */
  accessed?: string;
  scope: string[];
  status: 'metadata-checked' | 'content-checked';
  /** What was checked, or what was corrected in this site compared to the source. */
  note: string;
}

export const citations: readonly Citation[] = [
  {
    id: 'lembar-guru',
    author: 'Guru mata pelajaran Matematika',
    title: 'Peluang Suatu Kejadian (lembar materi dan latihan soal)',
    publisher: 'Lembar tugas dari guru pengampu (berkas PDF)',
    scope: [
      'Ruang sampel dan kejadian',
      'Peluang dan komplemen',
      'Frekuensi relatif dan harapan',
      'Kejadian majemuk',
      'Tiga soal latihan',
    ],
    status: 'content-checked',
    note:
      'Dibandingkan dengan isi situs pada 27 Oktober 2026. Satu salah ketik ditemukan: lembar menulis kejadian saling lepas sebagai n(A ∩ B) ≠ 0, sedangkan yang benar n(A ∩ B) = 0 (A ∩ B = ∅). Situs ini memakai bentuk yang benar.',
  },
  {
    id: 'openstax-3-1',
    author: 'Illowsky, B., & Dean, S.',
    year: 2023,
    title: 'Introductory Statistics 2e, 3.1 Terminology',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/introductory-statistics-2e/pages/3-1-terminology',
    accessed: '2026-10-27',
    scope: [
      'Ruang sampel',
      'Kejadian',
      'Peluang klasik',
      'Batas nilai peluang',
      'Komplemen',
      'Frekuensi relatif jangka panjang',
    ],
    status: 'content-checked',
    note:
      'Halaman dibuka pada 27 Oktober 2026 dan memuat konsep-konsep di atas. Frekuensi harapan tidak diambil dari sumber ini.',
  },
  {
    id: 'openstax-3-2',
    author: 'Illowsky, B., & Dean, S.',
    year: 2023,
    title: 'Introductory Statistics 2e, 3.2 Independent and Mutually Exclusive Events',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events',
    accessed: '2026-10-27',
    scope: ['Saling lepas', 'Saling bebas', 'Perbedaan saling lepas dan saling bebas', 'Peluang bersyarat'],
    status: 'content-checked',
    note:
      'Halaman dibuka pada 27 Oktober 2026. Rumus P(A ∩ B) = P(A)P(B) dan P(A ∩ B) = 0 untuk saling lepas tertera. Rumus penjumlahan saling lepas dan P(B | A) sebagai definisi berdiri sendiri tidak tertera, sehingga bagian itu bersumber dari lembar guru dan e-modul Kemendikbud.',
  },
  {
    id: 'kemdikbud-2019',
    author: 'Supriyati, R. D.',
    year: 2019,
    title: 'E-modul matematika kelas XII: peluang kejadian majemuk',
    publisher: 'Kementerian Pendidikan dan Kebudayaan (repositori institusi)',
    url: 'https://repositori.kemendikdasmen.go.id/20980/',
    accessed: '2026-10-27',
    scope: ['Kejadian majemuk', 'Saling lepas', 'Saling bebas', 'Peluang bersyarat'],
    status: 'metadata-checked',
    note:
      'Judul, penulis, tahun, dan ringkasan isi pada halaman repositori diperiksa pada 27 Oktober 2026. Isi berkas PDF belum dibaca penuh, sehingga sumber ini baru menjadi rujukan pembanding.',
  },
] as const;

export const STATUS_LABEL: Record<Citation['status'], string> = {
  'content-checked': 'isi diperiksa',
  'metadata-checked': 'metadata diperiksa',
};

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/** '2026-10-27' -> '27 Oktober 2026'. Returns the input unchanged if it is not an ISO date. */
export function formatAccessDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return iso;
  return `${Number(match[3])} ${month} ${match[1]}`;
}

export function getCitation(id: string): Citation {
  const found = citations.find((c) => c.id === id);
  if (!found) throw new Error(`Sitasi tidak dikenal: ${id}`);
  return found;
}

/** Alphabetical by author, the order a daftar pustaka uses. */
export function sortedCitations(): Citation[] {
  return [...citations].sort((a, b) => a.author.localeCompare(b.author, 'id'));
}
