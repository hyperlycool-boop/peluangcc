import type { Exercise } from '@/lib/exercises';
import { Formula } from './Formula';

interface ExerciseCardProps {
  exercise: Exercise;
}

/** One practice problem with its worked solution hidden until the learner opens it. */
export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <section id={exercise.id} className="exercise">
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
    </section>
  );
}
