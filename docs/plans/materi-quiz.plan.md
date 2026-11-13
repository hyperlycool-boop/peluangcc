# Plan: Quiz on every materi page ("Uji pemahaman")

## Summary

Add a short self-check quiz to each of the five lesson pages (`/materi/[slug]`). The quiz is client-side only, works in the static HTML export, and every correct answer is recomputed from the set model in a vitest test, the same way `tests/content.test.ts` checks the latihan.

## Defaults (changeable before Step 1 runs)

These are decisions made for the plan. Change them here before running the commands.

| Decision | Default | Alternatives |
|---|---|---|
| Question format | Multiple choice, 4 options, exactly one correct | Fraction input (`a/b`), true/false |
| Count | 3 questions per lesson (15 total) | 4–5 per lesson |
| Feedback | Per question: learner picks, presses "Periksa", sees correct/incorrect plus an explanation; can retry | Grade all at the end |
| Score | "x dari 3 benar" summary after every question is checked; "Ulangi" resets | No score |
| Order | Fixed order for questions and options (no shuffle), so server and client render the same HTML | Shuffle after hydration via `lib/use-hydrated.ts` |
| Persistence | None. State lives in React state and resets on reload | localStorage (see Constraints) |

## How it fits the product

`PRODUCT.md` sets the site against "a generic formula sheet or quiz site". The quiz must therefore show the sample space, not only grade a letter:

- Each question carries the outcome lists it is about (for example `S = 1..6`, `A = {5, 6}`), and the explanation names the counted outcomes before giving the fraction, such as "A = {5, 6}, n(A) = 2, n(S) = 6, so P(A) = 2/6 = 1/3".
- Tests recompute the correct option from those outcome lists with `lib/math.ts` (`probability`, `union`, `intersection`, `complement`, `dice`). No figure is invented.

How it differs from what is already on the page:

- **Coba pikirkan**: one open reflective prompt with a hidden answer. Unchanged.
- **ExerciseCard (latihan)**: long worked problems with step-by-step solutions. Unchanged.
- **Uji pemahaman (new)**: quick checks with immediate feedback, placed after "Coba pikirkan" and before the latihan cards.

## Constraints

- **Uncommitted work:** `app/materi/[slug]/page.tsx` and `app/globals.css` have uncommitted edits on `feat/latihan-referensi-laporan`. Commit or stash them before running any step. Every `/orch-*` command ends in a gated commit, and worktree-based runs do not see uncommitted edits.
- **No stored progress:** this branch deletes `lib/learning-progress.ts` and `components/LessonVisit.tsx`. Do not reintroduce localStorage-based progress for the quiz.
- **Static export:** no server actions, route handlers or cookies. The quiz component is a `'use client'` island inside the server page; `npm run build:html` and `npm run eval:export` must still pass.
- **Next.js 16:** read the relevant guide in `node_modules/next/dist/docs/` before writing route or component code (see `AGENTS.md`).
- **Content:** all copy in Bahasa Indonesia; formulas through `components/Formula.tsx` (KaTeX).
- **Shared screen first:** legible on a projector, no reliance on hover, full keyboard control, visible focus, works with reduced motion and the existing display modes (`lib/display-mode.ts`).
- **Existing tests:** `tests/final.mjs` opens every `<details>` on `/materi/kejadian-majemuk` for screenshots and counts `#soal-N details`. Do not render quiz explanations inside `<details>`, and do not reuse `soal-` ids.

---

## Step 1 — Add quiz content and answer-validation tests

**Files:** new `lib/quizzes.ts`, new `tests/quizzes.test.ts`.

Define a `QuizQuestion` type (`id`, `lessonSlug`, `prompt`, `options[4]`, `correctIndex`, `explanation`, optional `tex`, and the outcome lists the question counts over). Write 3 questions per lesson for all five slugs in `lib/materials.ts`: `ruang-sampel`, `peluang-komplemen`, `frekuensi-kejadian`, `kejadian-majemuk`, `bebas-bersyarat`. Export `quizForLesson(slug)`.

**Acceptance:**
- Every lesson slug has exactly 3 questions, each with 4 distinct options and one `correctIndex` in range; ids are unique and use a `kuis-` prefix.
- For every question, a vitest test recomputes the correct option from its outcome lists via `lib/math.ts`. No test hard-codes only the expected answer.
- `npm test`, `npm run typecheck` and `npm run lint` pass.

**Out of scope:** UI, styling, page changes, persistence.

---

## Step 2 — Add the LessonQuiz component and show it on every materi page

**Files:** new `lib/quiz-state.ts` (pure reducer: select, check, retry, score), new `tests/quiz-state.test.ts`, new `components/LessonQuiz.tsx`, edits to `app/materi/[slug]/page.tsx`, `app/globals.css`, `tests/final.mjs`.

Build the quiz state as pure functions with unit tests. Render `LessonQuiz` as a client component: one `<fieldset>` with `<legend>` and native radio inputs per question, a "Periksa" button, feedback announced through `aria-live="polite"`, the explanation with its formula, and a score line with "Ulangi". Insert it as a `<section>` headed "Uji pemahaman." after "Coba pikirkan" on `app/materi/[slug]/page.tsx`. Style it in `app/globals.css` with the existing lesson tokens.

**Acceptance:**
- All five `/materi/*` pages render 3 quiz questions; choosing an option and pressing "Periksa" shows correct/incorrect and the explanation, by keyboard alone.
- `tests/final.mjs` gets an assertion that each lesson page has its quiz and that answering one question shows feedback; it passes at the three tested sizes.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run build:html` and `npm run eval:export` pass.

**Out of scope:** persistence of answers or scores, timers, shuffling, changes to "Coba pikirkan" or `ExerciseCard`.
