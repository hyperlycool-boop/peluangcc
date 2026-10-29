# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary (confirmed): a teacher demonstrating in class, probably on a projector or large screen, with students following along. Design for being read from the back of a room first, then for a student working alone.

Secondary (from the project report, not re-confirmed): SMA/SMK students in grades X–XII, SMP grade IX students on the introductory materi, and graders reviewing the project.

## Product Purpose

Ruang Peluang is an Indonesian-language mathematics learning site on **Peluang Suatu Kejadian dan Peluang Kejadian Majemuk** (probability of an event, and of compound events). It exists so a learner can see why a probability is what it is by working on the sample space itself, instead of memorising formulas. Success is a student who can state the sample space correctly, and a teacher who can run a lesson from the site.

## Positioning

Every counted outcome is a visible point in a set model that can be checked, so a formula such as P(A ∪ B) is shown against the actual members of A, B and their overlap. A generic formula sheet or quiz site cannot show that.

## Operating Context

- A five-meeting course (Pertemuan 1–5): five materi, three latihan, a references list and a project report.
- Each materi has an experiment the learner can run repeatedly, so random variation is seen and expected values are not mistaken for certain outcomes.
- Content is Bahasa Indonesia with KaTeX-rendered formulas.
- Development pages `/styleguide` and `/prototype` exist for the developer and are not part of the learner experience.

## Capabilities and Constraints

- Next.js App Router with TypeScript strict; routes `/`, `/materi/[slug]` (5), `/latihan`, `/referensi`.
- **Math stays verifiable (confirmed constraint):** every number, count and probability shown comes from the tested model in `lib/math.ts` and the content tests; no decorative or invented figures.
- Scope is finite sample spaces; classical probability is used when elementary outcomes are equally likely.
- Not yet published. Identity (names, class, teacher, school), teacher feedback and task division are still marked **[ISI]** in the report and must not be invented.

## Evidence on Hand

- Report with BAB I–VII, a Meeting 1 draft, architecture and verification docs in `docs/`.
- 114 unit tests, final browser tests at three sizes, screenshots in `docs/screenshots/`.
- Absent, and not to be fabricated: teacher feedback, user testing, rubric scores, a public URL.

## Product Principles

- The set model is the source of truth; visuals explain it and never contradict it.
- Show the reasoning, not only the answer: each result is traceable to the outcomes that produced it.
- Design for a shared screen first: legible at distance, one idea per view, no reliance on hover.
- State what is not yet done plainly; no claims the project cannot back up.

## Accessibility & Inclusion

The project report promises keyboard control, Indonesian labels and reduced-motion support. These come from the repository, not from a new requirement in this interview, so treat them as the project's existing standard.
