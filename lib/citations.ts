export interface Citation {
  id: string;
  author: string;
  year: number;
  title: string;
  publisher: string;
  url: string;
  accessed: string;
  scope: string[];
  status: 'metadata-checked' | 'content-checked';
}

export const citations: readonly Citation[] = [
  {
    id: 'kemdikbud-2019',
    author: 'Ratih Dwi Supriyati',
    year: 2019,
    title: 'E-modul matematika kelas XII: peluang kejadian majemuk',
    publisher: 'Kementerian Pendidikan dan Kebudayaan',
    url: 'https://repositori.kemendikdasmen.go.id/20980/',
    accessed: '2026-10-23',
    scope: ['Kejadian majemuk', 'Saling lepas', 'Saling bebas', 'Bersyarat'],
    status: 'metadata-checked',
  },
  {
    id: 'openstax-3-2',
    author: 'OpenStax',
    year: 2023,
    title: 'Introductory Statistics 2e, 3.2 Independent and Mutually Exclusive Events',
    publisher: 'Rice University',
    url: 'https://openstax.org/books/introductory-statistics-2e/pages/3-2-independent-and-mutually-exclusive-events',
    accessed: '2026-10-23',
    scope: ['Saling lepas', 'Independensi'],
    status: 'metadata-checked',
  },
] as const;
