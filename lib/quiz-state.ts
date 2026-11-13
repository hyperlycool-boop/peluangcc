import type { QuizQuestion } from '@/lib/quizzes';

/** Jawaban satu soal: pilihan saat ini dan apakah sudah diperiksa. */
export interface QuizEntry {
  selected: number | null;
  checked: boolean;
}

export type QuizState = readonly QuizEntry[];

export type QuizAction =
  | { type: 'select'; question: number; option: number }
  | { type: 'check'; question: number }
  | { type: 'retry'; question: number }
  | { type: 'reset' };

export interface QuizScore {
  correct: number;
  checked: number;
  total: number;
}

const OPTION_COUNT = 4;

const EMPTY_ENTRY: QuizEntry = { selected: null, checked: false };

export function initialQuizState(count: number): QuizState {
  return Array.from({ length: Math.max(0, count) }, () => EMPTY_ENTRY);
}

function isValidQuestion(state: QuizState, question: number): boolean {
  return Number.isInteger(question) && question >= 0 && question < state.length;
}

function isValidOption(option: number): boolean {
  return Number.isInteger(option) && option >= 0 && option < OPTION_COUNT;
}

function replaceEntry(state: QuizState, question: number, entry: QuizEntry): QuizState {
  return state.map((current, i) => (i === question ? entry : current));
}

/** Pure reducer; tindakan yang tidak valid mengembalikan state yang sama. */
export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  if (action.type === 'reset') {
    return initialQuizState(state.length);
  }
  if (!isValidQuestion(state, action.question)) {
    return state;
  }
  const entry = state[action.question];

  switch (action.type) {
    case 'select':
      if (entry.checked || !isValidOption(action.option)) return state;
      return replaceEntry(state, action.question, { selected: action.option, checked: false });
    case 'check':
      if (entry.selected === null || entry.checked) return state;
      return replaceEntry(state, action.question, { selected: entry.selected, checked: true });
    case 'retry':
      return replaceEntry(state, action.question, EMPTY_ENTRY);
    default:
      return state;
  }
}

export function isCorrect(question: QuizQuestion, entry: QuizEntry): boolean {
  return entry.checked && entry.selected === question.correctIndex;
}

export function score(questions: readonly QuizQuestion[], state: QuizState): QuizScore {
  let correct = 0;
  let checked = 0;
  questions.forEach((question, i) => {
    const entry = state[i];
    if (!entry?.checked) return;
    checked += 1;
    if (isCorrect(question, entry)) correct += 1;
  });
  return { correct, checked, total: questions.length };
}
