// Eval for the HTML export (`npm run eval:export`, after `npm run build:html`).
// Checks the files a static host would serve: required pages exist, every root-relative
// link and asset resolves inside out/, page links use the exported trailing-slash form,
// and every #anchor exists on its target page.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'out');
const MIN_LESSON_PAGES = 5;
const failures = [];

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '_next' ? [] : htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

function resolveTarget(pathname) {
  const target = join(root, decodeURIComponent(pathname));
  if (existsSync(target) && statSync(target).isFile()) return target;
  const index = join(target, 'index.html');
  return existsSync(index) ? index : null;
}

if (!existsSync(root)) {
  console.error(`${root} not found. Run npm run build:html first.`);
  process.exit(1);
}

for (const page of ['index.html', '404.html', 'referensi/index.html']) {
  if (!existsSync(join(root, page))) failures.push(`missing required page: ${page}`);
}
const materi = join(root, 'materi');
const lessons = existsSync(materi) ? readdirSync(materi).filter((name) => existsSync(join(materi, name, 'index.html'))) : [];
if (lessons.length < MIN_LESSON_PAGES) {
  failures.push(`expected at least ${MIN_LESSON_PAGES} lesson pages, found ${lessons.length}`);
}

const pages = htmlFiles(root);
let checked = 0;
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const source = relative(root, file);
  for (const [, raw] of html.matchAll(/\b(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    checked += 1;
    const url = new URL(raw.replaceAll('&amp;', '&'), 'http://export.local');
    const target = resolveTarget(url.pathname);
    if (!target) {
      failures.push(`${source}: ${raw} does not resolve`);
      continue;
    }
    if (target.endsWith('index.html') && !url.pathname.endsWith('/')) {
      failures.push(`${source}: ${raw} lacks the trailing slash`);
    }
    const anchor = url.hash.slice(1);
    if (anchor && !readFileSync(target, 'utf8').includes(`id="${decodeURIComponent(anchor)}"`)) {
      failures.push(`${source}: ${raw} has no matching anchor`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  console.error(`Static export eval failed: ${failures.length} problem(s).`);
  process.exit(1);
}
console.log(`Static export eval passed: ${pages.length} HTML files, ${lessons.length} lesson pages, ${checked} links and assets.`);
