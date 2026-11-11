"use client";

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { materials } from '@/lib/materials';
import {
  clearVisited,
  nextLesson,
  readVisitedSnapshot,
  subscribeVisited,
  visitedFromSnapshot,
} from '@/lib/learning-progress';
import { HOME_INDEX, lessonNavTypes } from '@/lib/route-transition';

/** The five lessons as one route. Ticks come from lessons opened in this browser. */
export default function LearningPath() {
  const snapshot = useSyncExternalStore(subscribeVisited, readVisitedSnapshot, () => '');
  const visited = visitedFromSnapshot(snapshot);
  const upNext = nextLesson(visited);
  const done = visited.length === materials.length;

  return (
    <section id="peta" className="lab-section learning-path">
      <div className="section-title">
        <div>
          <h2>Peta belajar.</h2>
        </div>
        <p>
          Lima materi, satu jalur. Centang muncul di peramban ini setiap kali Anda membuka sebuah
          materi.
        </p>
      </div>

      <ol className="path-track">
        {materials.map((m, index) => {
          const isDone = visited.includes(m.slug);
          const isNext = m.slug === upNext;
          return (
            <li key={m.slug} className={`path-stop${isDone ? ' is-done' : ''}${isNext ? ' is-next' : ''}`}>
              <Link
                href={`/materi/${m.slug}`}
                transitionTypes={lessonNavTypes(HOME_INDEX, index)}
                aria-label={`Materi ${index + 1}: ${m.title}${isDone ? ', sudah dibuka' : isNext ? ', berikutnya' : ''}`}
              >
                <span className="path-node mono" aria-hidden="true">
                  {isDone ? <Check size={18} strokeWidth={3} /> : index + 1}
                </span>
                <span className="path-title">{m.title}</span>
                <span className="path-status" aria-hidden="true">
                  {isDone ? 'Sudah dibuka' : isNext ? 'Mulai dari sini' : 'Belum dibuka'}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="path-summary" aria-live="polite">
        {done
          ? 'Semua materi sudah dibuka. Ulangi kapan saja, atau coba latihan di tiap materi.'
          : `${visited.length} dari ${materials.length} materi sudah dibuka.`}
        {visited.length > 0 && (
          <button type="button" className="path-reset" onClick={() => clearVisited()}>
            Hapus progres
          </button>
        )}
      </p>
    </section>
  );
}
