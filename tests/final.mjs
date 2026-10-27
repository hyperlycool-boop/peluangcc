// Final-stage evidence (Pertemuan 5): screenshots plus navigation, link, anchor, overflow and error checks.
// Usage: npm run build && npx next start -p 3200 --hostname 127.0.0.1, then BASE_URL=http://127.0.0.1:3200 npm run test:final
// Writes only docs/screenshots/final-*.png and docs/pengujian-final.json; stage screenshots from earlier meetings are untouched.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3200';
const WIDTHS = [1440, 768, 375];
const LESSONS = ['ruang-sampel', 'peluang-komplemen', 'frekuensi-kejadian', 'kejadian-majemuk', 'bebas-bersyarat'];
const SHOTS = [
  { name: 'beranda', path: '/' },
  { name: 'materi', path: '/materi/kejadian-majemuk' },
  { name: 'latihan', path: '/latihan', openDetails: true },
  { name: 'referensi', path: '/referensi' },
];
const CHECKED = ['/', '/latihan', '/referensi', ...LESSONS.map((s) => `/materi/${s}`)];

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
} catch {
  browser = await chromium.launch({ headless: true });
}

const report = { base: BASE, date: new Date().toISOString().slice(0, 10), pages: [], links: [], anchors: [], notFound: null };

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  fs.mkdirSync('docs/screenshots', { recursive: true });

  // 1. Every page at every width: no horizontal overflow, no formula errors, no JavaScript errors.
  for (const path of CHECKED) {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      const result = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        formulaErrors: document.querySelectorAll('.formula-error, .katex-error').length,
        formulas: document.querySelectorAll('.katex').length,
        h1: document.querySelector('h1')?.textContent ?? null,
      }));
      assert.ok(result.scrollWidth <= width, `${path} overflows horizontally at ${width}px (${result.scrollWidth})`);
      assert.equal(result.formulaErrors, 0, `${path} has formula render errors`);
      report.pages.push({ path, width, ...result, overflow: result.scrollWidth > width });
    }
  }

  // 2. Screenshots for the final report.
  for (const shot of SHOTS) {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(BASE + shot.path, { waitUntil: 'networkidle' });
      if (shot.openDetails) await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
      await page.waitForTimeout(400);
      await page.screenshot({ path: `docs/screenshots/final-${shot.name}-${width}.png`, fullPage: true });
    }
  }

  // 3. Every internal link on every checked page resolves; every #anchor exists on its target page.
  await page.setViewportSize({ width: 1440, height: 900 });
  const found = new Set();
  for (const path of CHECKED) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const hrefs = await page.$$eval('a[href]', (els) => els.map((a) => a.getAttribute('href')));
    hrefs.filter((h) => h.startsWith('/') && !h.startsWith('/_next')).forEach((h) => found.add(h));
  }
  const htmlCache = new Map();
  for (const href of [...found].sort()) {
    const [pathname, hash] = href.split('#');
    const target = pathname || '/';
    const response = await page.request.get(BASE + target);
    report.links.push({ href, status: response.status() });
    assert.equal(response.status(), 200, `${href} returned ${response.status()}`);
    if (hash) {
      if (!htmlCache.has(target)) htmlCache.set(target, await response.text());
      const present = htmlCache.get(target).includes(`id="${hash}"`);
      report.anchors.push({ href, present });
      assert.ok(present, `${href}: anchor #${hash} not found`);
    }
  }

  // 4. Unknown lesson returns 404.
  report.notFound = (await page.request.get(`${BASE}/materi/tidak-ada`)).status();
  assert.equal(report.notFound, 404);

  assert.deepEqual(errors, [], `JavaScript errors: ${errors.join('; ')}`);
  report.jsErrors = 0;
} finally {
  await browser.close();
}

fs.writeFileSync('docs/pengujian-final.json', JSON.stringify(report, null, 2) + '\n');
console.log(
  `Final checks passed: ${report.pages.length} page/width combinations, ${report.links.length} internal links, ${report.anchors.length} anchors.`
);
