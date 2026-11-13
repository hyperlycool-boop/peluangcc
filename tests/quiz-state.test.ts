import { describe, expect, it } from 'vitest';
import { quizForLesson } from '../lib/quizzes';
import {
  initialQuizState,
  isCorrect,
  quizReducer,
  score,
  type QuizAction,
  type QuizState,
} from '../lib/quiz-state';

const questions = quizForLesson('ruang-sampel');

const run = (actions: QuizAction[], start: QuizState = initialQuizState(questions.length)) =>
  actions.reduce(quizReducer, start);

describe('initialQuizState', () => {
  it('membuat satu entri kosong untuk setiap soal', () => {
    expect(initialQuizState(3)).toEqual([
      { selected: null, checked: false },
      { selected: null, checked: false },
      { selected: null, checked: false },
    ]);
  });

  it('menghasilkan daftar kosong untuk jumlah nol atau negatif', () => {
    expect(initialQuizState(0)).toEqual([]);
    expect(initialQuizState(-2)).toEqual([]);
  });
});

describe('quizReducer: select', () => {
  it('menyimpan pilihan pada soal yang dituju saja', () => {
    const next = run([{ type: 'select', question: 1, option: 2 }]);
    expect(next[1]).toEqual({ selected: 2, checked: false });
    expect(next[0]).toEqual({ selected: null, checked: false });
    expect(next[2]).toEqual({ selected: null, checked: false });
  });

  it('mengganti pilihan selama belum diperiksa', () => {
    const next = run([
      { type: 'select', question: 0, option: 1 },
      { type: 'select', question: 0, option: 3 },
    ]);
    expect(next[0].selected).toBe(3);
  });

  it('diabaikan setelah soal diperiksa', () => {
    const checked = run([
      { type: 'select', question: 0, option: 1 },
      { type: 'check', question: 0 },
    ]);
    const next = quizReducer(checked, { type: 'select', question: 0, option: 2 });
    expect(next).toBe(checked);
    expect(next[0]).toEqual({ selected: 1, checked: true });
  });

  it.each([-1, 4, 1.5, Number.NaN])('mengabaikan indeks pilihan di luar jangkauan (%s)', (option) => {
    const state = initialQuizState(questions.length);
    expect(quizReducer(state, { type: 'select', question: 0, option })).toBe(state);
  });
});

describe('quizReducer: check', () => {
  it('menandai soal sebagai diperiksa dengan pilihan tetap', () => {
    const next = run([
      { type: 'select', question: 0, option: 2 },
      { type: 'check', question: 0 },
    ]);
    expect(next[0]).toEqual({ selected: 2, checked: true });
  });

  it('diabaikan bila belum ada pilihan', () => {
    const state = initialQuizState(questions.length);
    expect(quizReducer(state, { type: 'check', question: 0 })).toBe(state);
  });

  it('tidak mengubah apa pun bila soal sudah diperiksa', () => {
    const checked = run([
      { type: 'select', question: 0, option: 2 },
      { type: 'check', question: 0 },
    ]);
    expect(quizReducer(checked, { type: 'check', question: 0 })).toBe(checked);
  });
});

describe('quizReducer: retry', () => {
  it('mengosongkan satu soal tanpa menyentuh soal lain', () => {
    const state = run([
      { type: 'select', question: 0, option: 1 },
      { type: 'check', question: 0 },
      { type: 'select', question: 1, option: 0 },
      { type: 'check', question: 1 },
      { type: 'retry', question: 0 },
    ]);
    expect(state[0]).toEqual({ selected: null, checked: false });
    expect(state[1]).toEqual({ selected: 0, checked: true });
  });

  it('membuat soal bisa dijawab lagi', () => {
    const state = run([
      { type: 'select', question: 0, option: 1 },
      { type: 'check', question: 0 },
      { type: 'retry', question: 0 },
      { type: 'select', question: 0, option: 3 },
    ]);
    expect(state[0]).toEqual({ selected: 3, checked: false });
  });
});

describe('quizReducer: reset', () => {
  it('mengosongkan semua soal dengan jumlah yang sama', () => {
    const state = run([
      { type: 'select', question: 0, option: 1 },
      { type: 'check', question: 0 },
      { type: 'select', question: 2, option: 0 },
      { type: 'reset' },
    ]);
    expect(state).toEqual(initialQuizState(questions.length));
  });
});

describe('quizReducer: indeks soal di luar jangkauan', () => {
  it.each([-1, 3, 99, 0.5])('tidak mengubah state untuk soal %s', (question) => {
    const state = initialQuizState(questions.length);
    expect(quizReducer(state, { type: 'select', question, option: 0 })).toBe(state);
    expect(quizReducer(state, { type: 'check', question })).toBe(state);
    expect(quizReducer(state, { type: 'retry', question })).toBe(state);
  });
});

describe('quizReducer: kekekalan (immutability)', () => {
  it('tidak memutasi state lama dan mengembalikan array baru', () => {
    const before = initialQuizState(questions.length);
    const snapshot = JSON.stringify(before);
    const after = quizReducer(before, { type: 'select', question: 0, option: 1 });
    expect(JSON.stringify(before)).toBe(snapshot);
    expect(after).not.toBe(before);
    expect(after[1]).toBe(before[1]);
  });

  it('state yang dibekukan tidak menyebabkan galat', () => {
    const frozen = Object.freeze(
      initialQuizState(questions.length).map((entry) => Object.freeze({ ...entry })),
    );
    expect(() =>
      ([
        { type: 'select', question: 0, option: 1 },
        { type: 'check', question: 0 },
        { type: 'retry', question: 0 },
        { type: 'reset' },
      ] as QuizAction[]).reduce(quizReducer, frozen as QuizState),
    ).not.toThrow();
  });
});

describe('isCorrect', () => {
  const question = questions[0];
  const wrong = (question.correctIndex + 1) % 4;

  it('benar bila pilihan yang diperiksa sama dengan kunci jawaban', () => {
    expect(isCorrect(question, { selected: question.correctIndex, checked: true })).toBe(true);
  });

  it('salah bila pilihan yang diperiksa bukan kunci jawaban', () => {
    expect(isCorrect(question, { selected: wrong, checked: true })).toBe(false);
  });

  it('belum dianggap benar sebelum diperiksa atau tanpa pilihan', () => {
    expect(isCorrect(question, { selected: question.correctIndex, checked: false })).toBe(false);
    expect(isCorrect(question, { selected: null, checked: true })).toBe(false);
  });
});

describe('score', () => {
  const answer = (index: number, option: number): QuizAction[] => [
    { type: 'select', question: index, option },
    { type: 'check', question: index },
  ];
  const wrongOf = (index: number) => (questions[index].correctIndex + 1) % 4;

  it('semua nol sebelum ada yang diperiksa', () => {
    expect(score(questions, initialQuizState(questions.length))).toEqual({
      correct: 0,
      checked: 0,
      total: 3,
    });
  });

  it('hanya menghitung soal yang sudah diperiksa', () => {
    const state = run([
      ...answer(0, questions[0].correctIndex),
      { type: 'select', question: 1, option: questions[1].correctIndex },
    ]);
    expect(score(questions, state)).toEqual({ correct: 1, checked: 1, total: 3 });
  });

  it('memisahkan jawaban benar dan salah', () => {
    const state = run([
      ...answer(0, questions[0].correctIndex),
      ...answer(1, wrongOf(1)),
      ...answer(2, questions[2].correctIndex),
    ]);
    expect(score(questions, state)).toEqual({ correct: 2, checked: 3, total: 3 });
  });

  it('kembali ke nol setelah reset dan mengurangi checked setelah retry', () => {
    const all = run(questions.flatMap((q, i) => answer(i, q.correctIndex)));
    expect(score(questions, all)).toEqual({ correct: 3, checked: 3, total: 3 });
    expect(score(questions, quizReducer(all, { type: 'retry', question: 1 }))).toEqual({
      correct: 2,
      checked: 2,
      total: 3,
    });
    expect(score(questions, quizReducer(all, { type: 'reset' })).checked).toBe(0);
  });

  it('menangani daftar soal kosong', () => {
    expect(score([], initialQuizState(0))).toEqual({ correct: 0, checked: 0, total: 0 });
  });
});
