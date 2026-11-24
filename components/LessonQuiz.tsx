'use client';

import './LessonQuiz.css';
import { useReducer, useRef } from 'react';
import { Formula } from '@/components/Formula';
import type { QuizQuestion } from '@/lib/quizzes';
import { initialQuizState, isCorrect, quizReducer, score } from '@/lib/quiz-state';

interface LessonQuizProps {
  questions: QuizQuestion[];
}

type OptionState = 'idle' | 'correct' | 'wrong';

function optionState(question: QuizQuestion, index: number, selected: number | null, checked: boolean): OptionState {
  if (!checked) return 'idle';
  if (index === question.correctIndex) return 'correct';
  return index === selected ? 'wrong' : 'idle';
}

/** Quick self-check: pick an answer, press "Periksa", read the explanation. State lives only in memory. */
export function LessonQuiz({ questions }: LessonQuizProps) {
  const [state, dispatch] = useReducer(quizReducer, questions.length, initialQuizState);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const result = score(questions, state);
  const allChecked = result.total > 0 && result.checked === result.total;

  return (
    <section className="lesson-quiz" aria-labelledby="uji-pemahaman">
      <h2 id="uji-pemahaman" ref={headingRef} tabIndex={-1}>
        Uji pemahaman.
      </h2>
      <p className="lesson-quiz-intro">Pilih satu jawaban, lalu periksa.</p>
      {questions.map((question, q) => {
        const entry = state[q];
        const correct = isCorrect(question, entry);
        return (
          <fieldset className="quiz-question" data-question={question.id} key={question.id}>
            <legend>{`${q + 1}. ${question.prompt}`}</legend>
            {question.options.map((option, i) => {
              const status = optionState(question, i, entry.selected, entry.checked);
              return (
                <label className="quiz-option" data-state={status} key={option + i}>
                  <input
                    type="radio"
                    name={question.id}
                    value={i}
                    checked={entry.selected === i}
                    disabled={entry.checked}
                    onChange={() => dispatch({ type: 'select', question: q, option: i })}
                  />
                  <span className="quiz-option-text">{option}</span>
                  {status === 'correct' && (
                    <span className="quiz-marker" data-marker="correct">
                      <span aria-hidden="true">✓</span>
                      <span className="visually-hidden">benar</span>
                    </span>
                  )}
                  {status === 'wrong' && (
                    <span className="quiz-marker" data-marker="wrong">
                      <span aria-hidden="true">✗</span>
                      <span className="visually-hidden">salah</span>
                    </span>
                  )}
                </label>
              );
            })}
            <div className="quiz-actions">
              {entry.checked ? (
                <button
                  type="button"
                  className="quiz-retry quiz-secondary"
                  onClick={() => dispatch({ type: 'retry', question: q })}
                >
                  Coba lagi
                </button>
              ) : (
                <button
                  type="button"
                  className="quiz-check"
                  disabled={entry.selected === null}
                  onClick={() => dispatch({ type: 'check', question: q })}
                >
                  Periksa
                </button>
              )}
            </div>
            <div className="quiz-feedback" aria-live="polite">
              {entry.checked && (
                <>
                  {correct ? (
                    <p>
                      <strong>Benar.</strong>
                    </p>
                  ) : (
                    <p>
                      <strong>Belum tepat.</strong> Jawaban yang benar: {question.options[question.correctIndex]}.
                    </p>
                  )}
                  <p>{question.explanation}</p>
                  {question.tex && <Formula tex={question.tex} />}
                </>
              )}
            </div>
          </fieldset>
        );
      })}
      {allChecked && (
        <div className="quiz-summary">
          <p className="quiz-score">
            {result.correct} dari {result.total} benar.
          </p>
          <button
            type="button"
            className="quiz-reset quiz-secondary"
            onClick={() => {
              dispatch({ type: 'reset' });
              // This button unmounts with the summary; send focus back to the quiz heading, not <body>.
              headingRef.current?.focus();
            }}
          >
            Ulangi kuis
          </button>
        </div>
      )}
    </section>
  );
}
