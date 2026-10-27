import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
} catch {
  browser = await chromium.launch({ headless: true });
}

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1440, height: 1000 });

  // 1. Verify Header navigation links order: Beranda -> Dadu 3D -> Lab Diagram -> Materi -> Latihan -> Referensi
  const navItems = await page.locator('nav[aria-label="Navigasi utama"] a').evaluateAll((els) =>
    els.map((e) => ({ text: e.textContent.trim(), href: e.getAttribute('href') }))
  );
  assert.equal(navItems.length, 6, 'Expected 6 main navigation links');
  assert.equal(navItems[4].text, 'Latihan');
  assert.equal(navItems[4].href, '/latihan');
  assert.equal(navItems[5].text, 'Referensi');
  assert.equal(navItems[5].href, '/referensi');
  assert.equal(navItems[0].text, 'Beranda');
  assert.equal(navItems[1].text, 'Dadu 3D');
  assert.equal(navItems[1].href, '#dadu');
  assert.equal(navItems[2].text, 'Lab Diagram');
  assert.equal(navItems[2].href, '#lab');
  assert.equal(navItems[3].text, 'Materi');
  assert.equal(navItems[3].href, '#materi');

  // 2. Verify Hero CTA button links to #dadu
  const heroCtaHref = await page.locator('.hero a.button.primary').getAttribute('href');
  assert.equal(heroCtaHref, '#dadu', 'Hero CTA button must link to #dadu');

  // 3. Verify Section order: #dadu placed directly after Hero, before #lab
  const sectionOrder = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('main section[id], main .folding-section-wrapper section[id]'));
    return sections.map((s) => s.id);
  });
  const daduIdx = sectionOrder.indexOf('dadu');
  const labIdx = sectionOrder.indexOf('lab');
  const materiIdx = sectionOrder.indexOf('materi');
  assert(daduIdx !== -1, 'Expected #dadu section to exist');
  assert(labIdx !== -1, 'Expected #lab section to exist');
  assert(materiIdx !== -1, 'Expected #materi section to exist');
  assert(daduIdx < labIdx, `Expected #dadu (index ${daduIdx}) to be placed directly after Hero, before #lab (index ${labIdx})`);
  assert(labIdx < materiIdx, `Expected #lab (index ${labIdx}) to precede #materi (index ${materiIdx})`);

  // 4. Verify "Remove the boxes": .scrolly-step-card does NOT exist (count = 0)
  assert.equal(
    await page.locator('.scrolly-step-card').count(),
    0,
    'Expected 0 .scrolly-step-card elements — boxed cards must be completely removed'
  );
  assert.equal(
    await page.locator('.floating-stage-item').count(),
    4,
    'Expected 4 .floating-stage-item elements to exist for scrolly stages'
  );

  // 5. Verify Material items & hover previews
  const links = page.locator('.material-item .module');
  assert.equal(await links.count(), 5);
  for (let i = 0; i < 5; i++) {
    await links.nth(i).hover();
    assert.equal(await page.locator('.material-item.is-active').count(), 1);
    await page.waitForTimeout(400);
    assert(
      (await page.locator('.material-item.is-active .material-preview').evaluate((e) => e.getBoundingClientRect().height)) > 100
    );
  }
  await page.screenshot({ path: 'docs/screenshots/homepage-hover-1440.png', fullPage: true });

  // 6. Verify Lesson routes navigation
  const urls = await links.evaluateAll((es) => es.map((e) => e.getAttribute('href')));
  for (const url of urls) {
    await page.goto('http://127.0.0.1:3000' + url, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').count(), 1);
    await page.locator('summary').click();
    assert(await page.locator('details').getAttribute('open') !== null);
  }

  // 7. Responsive check & screenshot across 360, 768, 1440 viewports
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `Horizontal overflow detected at width ${width}`
    );

    // Scroll into runway and verify centered 3D die stage
    const scrollyRunway = page.locator('.scrolly-canvas-runway');
    await scrollyRunway.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const die = page.locator('.die-stage').first();
    const dieBox = await die.boundingBox();
    assert(dieBox && dieBox.y >= 0 && dieBox.y <= 900, `Die stage must be visible at width ${width}`);

    const viewportHeight = 900;
    const dieCenterY = dieBox.y + dieBox.height / 2;
    if (width >= 1024) {
      const deltaY = Math.abs(dieCenterY - viewportHeight / 2);
      assert(
        deltaY <= 100,
        `Die stage must be vertically centered on desktop at width ${width} (expected ~${viewportHeight / 2}px, got ${dieCenterY}px, delta=${deltaY}px)`
      );
      const dieCenterX = dieBox.x + dieBox.width / 2;
      const deltaX = Math.abs(dieCenterX - width / 2);
      assert(
        deltaX <= 100,
        `Die stage must be horizontally centered on desktop at width ${width} (expected ~${width / 2}px, got ${dieCenterX}px, delta=${deltaX}px)`
      );
    }

    await page.screenshot({ path: `docs/screenshots/homepage-${width}.png`, fullPage: true });
  }

  // 8. Reduced-motion test
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.module').first().focus();
  assert.equal(await page.locator('.material-item.is-active').count(), 1);

  assert.deepEqual(errors, []);
  console.log('PASS: Homepage tested: section order, nav links, hero CTA, centered 3D die, unboxed typography, 360/768/1440, zero overflow');
} finally {
  await browser?.close();
}
