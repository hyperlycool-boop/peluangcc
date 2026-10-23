import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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

  fs.mkdirSync('docs/screenshots', { recursive: true });

  for (const width of [1440, 768, 360]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('http://127.0.0.1:3000/prototype', { waitUntil: 'networkidle' });

    // Verify direct clone structure: Hero, Venn Lab, 3D Scrolly, and MaterialList
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('#lab').count(), 1, 'Expected #lab Venn diagram section to exist on cloned prototype');
    assert.equal(await page.locator('#dadu').count(), 1, 'Expected #dadu 3D scrolly section to exist on cloned prototype');
    assert.equal(await page.locator('#materi').count(), 1, 'Expected #materi MaterialList to exist on cloned prototype');
    assert.equal(await page.locator('.material-item .module').count(), 5, 'Expected 5 curriculum modules');

    // Verify 4 3D folding section cards exist on prototype
    const sectionCards = page.locator('.folding-section-card');
    assert.equal(await sectionCards.count(), 4, 'Expected 4 .folding-section-card elements (Hero, Lab, Dadu, Materi)');

    // Verify page-level folding sections container exists
    const foldingSectionsContainer = page.locator('.folding-sections-container');
    assert.equal(await foldingSectionsContainer.count() >= 1, true, 'Expected .folding-sections-container to exist');

    // Verify toggle switches to Flat mode and back to 3D Folding mode cleanly
    const flatBtn = page.getByRole('button', { name: 'Mode Datar Standar' });
    const foldingBtn = page.getByRole('button', { name: 'Lipatan 3D Aktif' });
    assert.equal(await flatBtn.count(), 1, 'Expected Flat mode button');
    assert.equal(await foldingBtn.count(), 1, 'Expected Folding mode button');

    // Test switching to flat
    await flatBtn.click();
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.folding-section-card.is-folding').count(), 0, 'Expected 0 folding cards in flat mode');
    const c0Box = await page.locator('.folding-section-wrapper').nth(0).boundingBox();
    const c1Box = await page.locator('.folding-section-wrapper').nth(1).boundingBox();
    const gap = c1Box.y - (c0Box.y + c0Box.height);
    assert(gap >= 20, `Expected clean gap between cards in flat mode, got ${gap}px`);

    // Switch back to 3D folding
    await foldingBtn.click();
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.folding-section-card.is-folding').count(), 4, 'Expected 4 folding cards after re-enabling');

    // Test interactivity inside Card 01 (Venn Diagram Lab)
    const labCard = page.locator('#lab');
    await labCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'A ∩ B', exact: true }).click();
    await page.waitForTimeout(300);
    assert(await page.getByText('2 hasil termasuk A dan B sekaligus').isVisible(), 'Expected Venn calculation to update on click');

    // Check no horizontal overflow at start
    const isNoOverflowTop = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    assert(isNoOverflowTop, `Horizontal overflow detected at width ${width} (top)`);

    // Scroll into the 3D scrollytelling stage (#dadu)
    const scrollySection = page.locator('#dadu');
    await scrollySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Take screenshot at mid-scrolly fold
    await page.screenshot({ path: `docs/screenshots/prototype-3d-folding-${width}.png` });

    // Check no horizontal overflow mid-scroll
    const isNoOverflowMid = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    assert(isNoOverflowMid, `Horizontal overflow detected at width ${width} (mid)`);

    // Verify 3D die is strictly visible in viewport and clickable
    const die = page.locator('.die-stage').first();
    const dieBox = await die.boundingBox();
    assert(dieBox && dieBox.y >= 0 && dieBox.y <= 950, `Die stage must be visible in viewport at width ${width}, got y=${dieBox?.y}`);
    await die.click();
    await page.waitForTimeout(300);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(300);

    const isNoOverflowBottom = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    assert(isNoOverflowBottom, `Horizontal overflow detected at width ${width} (bottom)`);

    // Verify prefers-reduced-motion: reduce forces all cards flat via CSS transform: none
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const cardTransform = await page.locator('.folding-section-card').first().evaluate(
      (el) => window.getComputedStyle(el).transform
    );
    assert.equal(cardTransform, 'none', 'Expected transform: none on reduced-motion');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  }

  assert.deepEqual(errors, []);
  console.log('PASS: /prototype tested across 1440/768/360, synchronized scrollytelling, zero overflow & zero errors');
} finally {
  await browser?.close();
}
