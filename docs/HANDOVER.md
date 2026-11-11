# Handover: scroll film on `/prototype`

Last updated 10 November 2026. Branch `feat/latihan-referensi-laporan`, based on commit `3c22995`.

## Status

The film is built and working on `/prototype`. It is not committed, and learners cannot see it yet, because `PRODUCT.md` treats `/prototype` as a developer page. The homepage still uses the older die scene.

| Area | State |
|---|---|
| Six-stage film, stepper, quiet path | Done |
| Short-screen layouts | Done, CSS added after the last browser suite run |
| `typecheck`, unit tests, lint | Pass on 10 November |
| `test:prototype`, `test:e2e`, `eval:export` | Passed on 9 November, before the short-screen CSS. Re-run them |
| Safari, Firefox, real projector | Not tested |
| Handoff into the Venn lab | Works, but not seamless |
| Commit | Not done. See "Git state" first |

## What it does

The homepage scene stopped at the die, and the Venn lab then started as a separate section. The film joins them: the die's six faces become the six points of the sample space, those points form event A, and the count becomes a probability.

| Stage | Progress | Title | On screen |
|---|---|---|---|
| 1 | 0 to .13 | Dadu Seimbang | Die at rest |
| 2 | .13 to .31 | Rotasi Bebas & Keacakan | Die tumbles |
| 3 | .31 to .44 | Hasil yang Teramati | Die lands, face 3 lit |
| 4 | .44 to .62 | Ruang Sampel | Die fades, six dots spread, `S` and `n(S) = 6` |
| 5 | .62 to .80 | Kejadian A | Circle A forms round 1, 3, 5, `n(A) = 3`; dot 3 stays lit |
| 6 | .80 to 1 | Konsep Peluang | `P(A) = 3/6 = 0,5`; circle B fades in over the last 6% |

The runway is `600vh`. The die always lands on 3 (`OBSERVED_OUTCOME`), because scrolling back has to replay the same frames. It is an illustration, not a random result.

## Run it

Dev server, then open `http://127.0.0.1:3100/prototype`:

```bash
npx next dev --hostname 127.0.0.1 --port 3100
```

`.claude/launch.json` has this as `ruang-peluang-copy`, and the production server on port 3000 as `ruang-peluang-prod-3000`. No server is running at the time of writing.

This repo uses Next.js 16. Per `AGENTS.md`, read the guides in `node_modules/next/dist/docs/` before writing Next.js code. The film itself uses no new Next.js API.

## Code map

| File | Job |
|---|---|
| `lib/film.ts` | Pure timeline: stages, stops, text windows, dot paths, colours, counts, TeX. No React |
| `components/prototype/FilmScene.tsx` | Scene. `RunningFilm` is the pinned version, `QuietFilm` the static stack |
| `components/prototype/SampleSpaceLayer.tsx` | SVG dots and circles, in the lab's `0 0 560 330` viewBox |
| `components/prototype/FilmStepper.tsx` | `Mundur` / `Lanjut` buttons, left and right arrow keys, `n / 6` count |
| `lib/smooth-scroll.ts` | Getter so the stepper can scroll through Lenis |
| `tests/film.test.ts` | Stage boundaries, stops, dot paths, figures against `lib/math.ts` |
| `app/globals.css` | Film styles, at the end of the file under "Prototype scroll film" |

Small edits to shared files:

- `components/Experience.tsx`: renders `FilmScene` when `prototype` is true, and makes the `#dadu` card flat with class `is-film`.
- `components/ScrollScene3D.tsx`: exports `STAGES` and `StepItem`.
- `components/home/VennLab.tsx`: imports `POINTS` from `lib/film.ts`, values unchanged.
- `components/SmoothScroll.tsx`: publishes the Lenis instance.
- `tests/prototype.mjs`: expects 6 stages, scrolls explicitly into the pinned range, checks the formula on stage 6.

## Decisions

- **No Three.js.** The subject is one cube, six dots and two circles, which CSS 3D and SVG already draw sharply. Formulas and labels must stay in the DOM anyway. Real lighting or a physically shattering die would change this. `lib/film.ts` is independent of the renderer, so a swap would keep the timeline.
- **Separate component from the homepage.** `ScrollScene3D` is shared, and the homepage had to stay unchanged.
- **Flat `#dadu` card.** `FoldingSectionCard` rotates about its top edge, which would tilt the pinned stage on a card this tall. The card stays in the DOM because `tests/prototype.mjs` expects 4.
- **Full-bleed film.** `main` stops at 1240px and clipped the text. On this page only, the horizontal clip moves from `.folding-sections-container` to `html` and the other folding cards.
- **Stepper.** `PRODUCT.md` names a teacher on a projector as the primary user, and scrubbing a wheel in front of a class is unreliable.
- **Text not hidden from assistive tech.** Inactive stages have no `aria-hidden`, so the whole sequence can be read in order.

## Common changes

- **Timing:** edit the constants in `lib/film.ts`. `tests/film.test.ts` fails if a stop leaves its stage or its fully visible text window, or if dots have not settled by the stage 4 stop. `DIE_SPAN` keeps the existing die tables aligned with stages 1 to 3.
- **Figures:** never type them. Derive them in `FILM_COUNTS` and `FILM_TEX` from `lib/math.ts`, as `PRODUCT.md` requires.
- **Copy:** stages 1 to 3, and the title and text of stage 6, come from `STAGES` in `components/ScrollScene3D.tsx`. Editing those changes the homepage too. Stages 4 and 5 are in `FilmScene.tsx`.
- **Adding a stage:** update `FILM_STAGE_COUNT`, `FilmStage`, `FILM_STAGE_ENDS`, `FILM_STOPS` and `FILM_TEXT_WINDOWS` in `lib/film.ts`, `FILM_STAGES` in `FilmScene.tsx`, and the expected count in `tests/prototype.mjs`.
- **Moving it to the homepage:** remove the `prototype` condition in `Experience.tsx`. Then rework the full-bleed CSS, which depends on `.is-film` and `.folding-sections-container`, while the homepage has neither and uses the clipped `.prototype-sections-wrap`. `tests/homepage.mjs` also expects 4 `.floating-stage-item` elements.

## Verification record

| Date | Check | Result |
|---|---|---|
| 10 Nov | `npm run typecheck` | Pass |
| 10 Nov | `npm test` | 158 tests pass in 9 files |
| 10 Nov | `npm run lint` | 0 errors, 94 warnings, the same count `docs/VERIFIKASI.md` attributes to `.claude/skills/impeccable/scripts` |
| 9 Nov | Collision check, headless Chromium, 23 sizes, all 6 stops | No problems. Ran after the short-screen CSS |
| 9 Nov | `npm run test:prototype` | Pass, before the short-screen CSS |
| 9 Nov | `npm run test:e2e` | Pass, before the short-screen CSS |
| 9 Nov | `npm run eval:export` | 12 HTML files, 5 lesson pages, 271 links and assets, before the short-screen CSS |
| 9 Nov | Headless frame rate at 1440×900 | 60fps idle and during wheel scroll, worst frame 17ms |
| 9 Nov | Stepper, arrow keys, resize mid-film, three quiet paths | Pass, headless |

The collision check was a throwaway script and is not in the repo. For each stop it compared the bounding boxes of `.is-active-stage`, `.film-stepper`, `.film-diagram-stage` and `.die-stage` against each other and `.scrolly-stage-pinned`, and checked horizontal overflow. Sizes: 320×568, 360×640, 375×667, 360×800, 390×844, 412×915, 568×320, 667×375, 844×390, 932×430, 470×365, 800×500, 800×600, 900×560, 1024×500, 1280×500, 1024×560, 1024×768, 1280×600, 1366×768, 768×1024, 1440×900, 1920×1080.

To re-run the browser suites, build and start the production server in a separate terminal:

```bash
npm run build
```

```bash
npx next start -p 3000 --hostname 127.0.0.1
```

Then run:

```bash
npm run test:prototype && npm run test:e2e
```

These scripts overwrite images in `docs/screenshots/`. Those images are evidence for the project report, so restore them afterwards unless you meant to update them. This discards every uncommitted change in that folder:

```bash
git restore --worktree -- docs/screenshots
```

Stop the server, then check the static export:

```bash
npm run build:html && npm run eval:export
```

## Known limits

- **Handoff is not seamless.** The film and the lab are separate SVGs, so the same diagram scrolls away and reappears. Dot 2 is white at the end of the film but black in the lab's default `A ∪ B` view.
- **The stepper stops at 6 / 6.** It does not continue into the lab.
- **Small dot numbers in narrow landscape.** About 8px at 568×320 and 6.5px at 470×365. Readable from 844×390 up.
- **Lenis stays on in Tenang and Fokus ujian.** It is off only for `prefers-reduced-motion`, which matches the rest of the site.
- **Quiet modes apply after hydration.** The server renders the running version, so a saved mode swaps in on load. This comes from reading the code and was not measured.
- **Unexplained result in the in-app browser pane.** Two Right presses stayed on 2 / 6, and one wheel scroll showed the hero. The pane was running at about 3fps and being resized. Neither reproduced headless.
- **Repeated colours.** `#efb3a3` and `#f6cf7b` appear in both `SampleSpaceLayer.tsx` and `VennLab.tsx`, and `SIGNAL` in `lib/film.ts` repeats `--signal`.

## Git state

Nothing from this work is committed, and the working tree also holds earlier uncommitted edits that were not part of this work and were not reviewed:

- `components/InteractiveProbabilityFormula.tsx`, `components/RollingNumber.tsx`
- `lib/citations.ts`, `lib/exercise-visualization.ts`, `lib/exercises.ts`, `lib/experiment-motion.ts`, `lib/folding.ts`, `lib/interactive-formula.ts`, `lib/materials.ts`, `lib/math.ts`, `lib/scrolly.ts`
- `lib/interpolate.ts` (untracked)

`app/globals.css` contains both. The film block is appended at the end, and the rest of its diff is the earlier work. All test results above are for the combined tree. The film has not been built or tested without those earlier edits. The branch name is also unrelated to this feature, so decide where it should land before committing.

## Suggested next steps

1. Re-run the browser suites and the export check.
2. Try the film on a real projector, and in Safari and Firefox.
3. Decide what to do with the earlier uncommitted edits, then commit.
4. Add the short-screen collision check to `tests/prototype.mjs`.
5. Decide whether the film replaces the homepage scene.
6. Decide whether the handoff needs to be one continuous diagram. The likely route is moving the lab's `.section-title` and layout into the final frame.

## Reference sites

The film came from analysing four sites. Their shared idea is that scroll acts as a playhead through one continuous film, and a single subject transforms instead of the page changing sections.

| | organimo.com | Convex virtual experience | igloo.inc | pear.no |
|---|---|---|---|---|
| Text | DOM over WebGL | DOM over WebGL | WebGL only | DOM over WebGL and video |
| Scroll | 60,288px, Lenis | 47,700px, Lenis | Virtual | 48,150px, native |
| Stack | WordPress, three, GSAP | WordPress, three, GSAP | three r165, GSAP 3.12.5 | Tailwind v4, hand-written WebGL |
| Headings | 0 `h1`, 0 `h2` | 1 `h1`, 13 `h2` | None | 1 `h1`, 5 `h2`, 5 `h3` |
| Reduced-motion CSS rules | 0 | 1 | 0 | 1 |

Taken from them: scroll as a timeline, one subject that transforms, and real DOM text over the visuals, which is pear.no's model.

Left out: igloo.inc's canvas-only text, which has no accessible content, and pear.no's 9 to 10px labels and 30px controls, which fail projector reading.

Measured at 1440×900 on desktop only. Mobile and audio were not tested, and pear.no was sampled at six scroll positions.
