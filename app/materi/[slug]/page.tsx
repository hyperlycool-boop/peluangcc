import { ViewTransition } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { materials } from '@/lib/materials';
import {
  DIRECTIONAL_PAGE_TRANSITION,
  HOME_INDEX,
  lessonNavTypes,
  lessonTitleTransitionName,
} from '@/lib/route-transition';
import { exercisesForLesson } from '@/lib/exercises';
import { LessonExperiment } from '@/components/LessonExperiments';
import { Formula } from '@/components/Formula';
import { SourceCredits } from '@/components/SourceCredits';
import { ExerciseCard } from '@/components/ExerciseCard';
import { SiteFooter, SubpageHeader } from '@/components/SiteChrome';

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
  const backHome = lessonNavTypes(index, HOME_INDEX);
  const practice = exercisesForLesson(m.slug);

  return (
    <>
      <SubpageHeader current="materi" homeTransitionTypes={backHome} />
      {/* key: moving between lessons is an exit/enter pair, not an in-place update. */}
      <ViewTransition key={m.slug} {...DIRECTIONAL_PAGE_TRANSITION}>
        <main className="lesson">
          <div className="eyebrow">
            MATERI {currentStep} / {totalSteps}
          </div>
          <ViewTransition name={lessonTitleTransitionName(m.slug)} share="morph" default="none">
            <h1>{m.title}</h1>
          </ViewTransition>
          <p className="lesson-intro">{m.intro}</p>
          <LessonExperiment key={m.slug} index={index} />
          <section>
            <h2>Hubungkan dengan rumus.</h2>
            <div className="formula-list">
              {m.formulas.map((f) => (
                <div className="formula-item" key={f.tex}>
                  <span className="formula-label">{f.label}</span>
                  <Formula tex={f.tex} />
                </div>
              ))}
            </div>
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
          {practice.map((exercise, i) => (
            <ExerciseCard key={exercise.id} exercise={exercise} number={i + 1} />
          ))}
          <SourceCredits
            ids={m.sources}
            note="Penjelasan dan contoh disusun untuk proyek ini berdasarkan sumber di atas."
          />
          <nav className="lesson-nav" aria-label="Urutan materi">
            {index > 0 && (
              <Link
                href={`/materi/${materials[index - 1].slug}`}
                transitionTypes={lessonNavTypes(index, index - 1)}
              >
                ← {materials[index - 1].title}
              </Link>
            )}
            {index < materials.length - 1 && (
              <Link
                href={`/materi/${materials[index + 1].slug}`}
                transitionTypes={lessonNavTypes(index, index + 1)}
              >
                {materials[index + 1].title} →
              </Link>
            )}
          </nav>
          <Link href="/#lab" transitionTypes={backHome}>
            Coba visualisasi himpunan di beranda ↗
          </Link>
        </main>
      </ViewTransition>
      <SiteFooter />
    </>
  );
}
