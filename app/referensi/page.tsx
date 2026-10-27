import { ViewTransition } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { formatAccessDate, sortedCitations, STATUS_LABEL } from '@/lib/citations';
import { materials } from '@/lib/materials';
import { DIRECTIONAL_PAGE_TRANSITION } from '@/lib/route-transition';
import { SiteFooter, SubpageHeader } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'Daftar referensi — Ruang Peluang',
  description: 'Sumber materi, ilustrasi, dan perangkat lunak yang dipakai Ruang Peluang.',
};

const TOOLS = [
  { name: 'Next.js dan React', license: 'MIT' },
  { name: 'KaTeX (penulisan rumus)', license: 'MIT' },
  { name: 'Motion dan Lenis (animasi dan gulir)', license: 'MIT' },
  { name: 'Lucide (ikon)', license: 'ISC' },
  { name: 'Sofia Sans dan JetBrains Mono (huruf)', license: 'SIL Open Font License' },
] as const;

export default function Page() {
  const citations = sortedCitations();
  return (
    <>
      <SubpageHeader current="referensi" />
      <ViewTransition {...DIRECTIONAL_PAGE_TRANSITION}>
        <main className="lesson reference-page">
          <div className="eyebrow">REFERENSI / {String(citations.length).padStart(2, '0')} SUMBER</div>
          <h1>Daftar referensi.</h1>
          <p className="lesson-intro">
            Sumber teks, rumus, dan soal di situs ini, diurutkan menurut nama penulis. Setiap sumber
            diberi status pemeriksaan agar jelas bagian mana yang sudah dicocokkan dengan isinya.
          </p>

          <ol className="reference-list">
            {citations.map((c) => {
              const lessons = materials.filter((m) => m.sources.includes(c.id));
              return (
                <li key={c.id} id={c.id}>
                  <p className="reference-entry">
                    {c.author} ({c.year ?? 't.t.'}). <em>{c.title}</em>. {c.publisher}.
                    {c.url && (
                      <>
                        {' '}
                        <a href={c.url} target="_blank" rel="noreferrer noopener">
                          {c.url}
                        </a>
                        .
                      </>
                    )}
                    {c.accessed && ` Diakses ${formatAccessDate(c.accessed)}.`}
                  </p>
                  <p className="reference-meta">
                    <span className="source-status">{STATUS_LABEL[c.status]}</span>
                    Dipakai untuk: {c.scope.join(', ')}.
                  </p>
                  <p className="reference-note">{c.note}</p>
                  {(lessons.length > 0 || c.id === 'lembar-guru') && (
                    <p className="reference-used">
                      Dipakai di:{' '}
                      {lessons.map((m, i) => (
                        <span key={m.slug}>
                          {i > 0 && ', '}
                          <Link href={`/materi/${m.slug}`}>{m.title}</Link>
                        </span>
                      ))}
                      {c.id === 'lembar-guru' && (
                        <>
                          {lessons.length > 0 && ', '}
                          <Link href="/latihan">Latihan soal</Link>
                        </>
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>

          <section id="ilustrasi">
            <h2>Ilustrasi, diagram, dan simulasi</h2>
            <p>
              Diagram himpunan, dadu 3D, grafik frekuensi, dan semua animasi dibuat untuk proyek ini
              dengan HTML, CSS, SVG, dan JavaScript. Situs ini tidak memakai foto atau gambar dari
              pihak ketiga. Hasil lemparan koin, dadu, dan pengambilan bola pada simulasi dibangkitkan
              secara acak di peramban pengguna; itu bukan data dari sumber luar.
            </p>
          </section>

          <section id="perangkat">
            <h2>Perangkat lunak dan huruf</h2>
            <ul className="tool-list">
              {TOOLS.map((tool) => (
                <li key={tool.name}>
                  {tool.name} <span className="source-status">{tool.license}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="status">
            <h2>Arti status pemeriksaan</h2>
            <p>
              <strong>Isi diperiksa</strong>: halaman atau lembar dibuka dan dicocokkan dengan konsep
              yang dikutip. <strong>Metadata diperiksa</strong>: judul, penulis, tahun, dan ringkasan
              isi sudah dicek, tetapi isi lengkapnya belum dibaca. Bagian yang berbeda dari sumber
              dicatat pada keterangan setiap entri.
            </p>
          </section>
        </main>
      </ViewTransition>
      <SiteFooter />
    </>
  );
}
