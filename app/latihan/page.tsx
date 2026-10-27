import { ViewTransition } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { exercises } from '@/lib/exercises';
import { materials } from '@/lib/materials';
import { DIRECTIONAL_PAGE_TRANSITION } from '@/lib/route-transition';
import { Formula } from '@/components/Formula';
import { SourceCredits } from '@/components/SourceCredits';
import { SiteFooter, SubpageHeader } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'Latihan soal — Ruang Peluang',
  description: 'Tiga soal peluang dengan pembahasan langkah demi langkah.',
};

export default function Page() {
  return (
    <>
      <SubpageHeader current="latihan" />
      <ViewTransition {...DIRECTIONAL_PAGE_TRANSITION}>
        <main className="lesson">
          <div className="eyebrow">LATIHAN / {String(exercises.length).padStart(2, '0')} SOAL</div>
          <h1>Latihan soal.</h1>
          <p className="lesson-intro">
            Selesaikan dulu di kertas. Setelah itu buka pembahasan untuk memeriksa ruang sampel,
            kejadian, dan rumus yang dipakai.
          </p>

          {exercises.map((exercise, i) => {
            const lesson = materials.find((m) => m.slug === exercise.lessonSlug);
            return (
              <section key={exercise.id} id={exercise.id} className="exercise">
                <div className="eyebrow">SOAL {String(i + 1).padStart(2, '0')}</div>
                <h2>{exercise.title}</h2>
                <p>{exercise.question}</p>
                {exercise.prerequisite && (
                  <p className="exercise-note">
                    <strong>Perlu diketahui.</strong> {exercise.prerequisite}
                  </p>
                )}
                <details>
                  <summary>Lihat pembahasan</summary>
                  <ol className="solution-steps">
                    {exercise.steps.map((step) => (
                      <li key={step.text}>
                        <p>{step.text}</p>
                        {step.tex && <Formula tex={step.tex} />}
                      </li>
                    ))}
                  </ol>
                  <p className="solution-answer">
                    <strong>Jawaban.</strong> {exercise.answerText}
                  </p>
                  <Formula tex={exercise.answerTex} />
                </details>
                {lesson && (
                  <Link className="exercise-concept" href={`/materi/${lesson.slug}`}>
                    Konsep terkait: {lesson.title} →
                  </Link>
                )}
              </section>
            );
          })}

          <SourceCredits
            ids={['lembar-guru']}
            note="Ketiga soal berasal dari lembar guru; langkah pembahasan disusun untuk proyek ini."
          />
        </main>
      </ViewTransition>
      <SiteFooter />
    </>
  );
}
