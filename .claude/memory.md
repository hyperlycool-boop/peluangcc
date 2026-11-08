# Project memory

Durable notes for agents working in this repository. Checked 2026-11-08.

## Evidence files
- `docs/pengujian-final.json` and `docs/screenshots/final-*.png` are report evidence from the production build on port 3200.
- `tests/final.mjs` writes those paths relative to the working directory. To test another build without replacing evidence, run it from a temporary directory: `BASE_URL=<url> node <repo>/tests/final.mjs`.
- `npm run test:e2e` and `npm run test:prototype` overwrite early-stage screenshots. Restore them with `git checkout -- docs/screenshots`.

## Static export
- `npm run build:html` writes to `out/` and works only at a domain root. There is no `basePath`.
- `npm run eval:export` checks the links, anchors, and required pages in `out/`. CI runs it after the export.

## Content
- `public/laporan-awal.md` is a copy of `docs/LAPORAN_PROYEK_WEBSITE_PEMBELAJARAN.md`. Keep them in sync.
- `[ISI]` markers in the report are for the students to fill in. Never invent names, classes, teachers, schools, or teacher feedback.
- `/latihan` was removed on purpose. Exercises live on lesson pages, and `tests/final.mjs` asserts that `/latihan` returns 404.
- User-facing text and project docs are in Indonesian.

## Guardrails
- `.claude/hooks/guard.mjs` blocks edits to `.env*` and generated folders, force pushes, `git reset --hard`, `git clean -f`, and recursive deletes of source or evidence folders.
