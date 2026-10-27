import Link from 'next/link';
import { notFound } from 'next/navigation';
import { materials } from '@/lib/materials';
import { LessonExperiment } from '@/components/LessonExperiments';
import { Formula } from '@/components/Formula';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return materials.map((m) => ({ slug: m.slug }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const index = materials.findIndex((m) => m.slug === slug);
  if (index < 0) {
    notFound();
  }

  const m = materials[index];
  const currentStep = String(index + 1).padStart(2, '0');
  const totalSteps = String(materials.length).padStart(2, '0');

  return (
    <>
      <header>
        <Link className="brand" href="/">
          ruang peluang.
        </Link>
        <Link href="/#materi">← Semua materi</Link>
      </header>
      <main className="lesson">
        <div className="eyebrow">
          MATERI {currentStep} / {totalSteps}
        </div>
        <h1>{m.title}</h1>
        <p className="lesson-intro">{m.intro}</p>
        <LessonExperiment key={m.slug} index={index} />
        <section>
          <h2>Hubungkan dengan rumus.</h2>
          <Formula tex={m.tex} />
          <p>{m.example}</p>
        </section>
        <section>
          <h2>Coba pikirkan.</h2>
          <p>{m.question}</p>
          <details>
            <summary>Lihat pembahasan</summary>
            <p>{m.answer}</p>
          </details>
        </section>
        <nav className="lesson-nav" aria-label="Urutan materi">
          {index > 0 && (
            <Link href={`/materi/${materials[index - 1].slug}`}>
              ← {materials[index - 1].title}
            </Link>
          )}
          {index < materials.length - 1 && (
            <Link href={`/materi/${materials[index + 1].slug}`}>
              {materials[index + 1].title} →
            </Link>
          )}
        </nav>
        <Link href="/#lab">Coba visualisasi himpunan di beranda ↗</Link>
      </main>
    </>
  );
}
