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

    // Verify direct clone structure: Hero, 3D Scrolly, Venn Lab, and MaterialList
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('#dadu').count(), 1, 'Expected #dadu 3D scrolly section to exist on prototype');
    assert.equal(await page.locator('#lab').count(), 1, 'Expected #lab Venn diagram section to exist on prototype');
    assert.equal(await page.locator('#materi').count(), 1, 'Expected #materi MaterialList to exist on prototype');
    assert.equal(await page.locator('.material-item .module').count(), 5, 'Expected 5 curriculum modules');

    // 1. Verify Section order: #dadu is placed directly after Hero, before #lab
    const sectionOrder = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('main section[id], main .folding-section-wrapper section[id]'));
      return sections.map((s) => s.id);
    });
    const daduIdx = sectionOrder.indexOf('dadu');
    const labIdx = sectionOrder.indexOf('lab');
    const materiIdx = sectionOrder.indexOf('materi');
    assert(daduIdx !== -1, 'Expected #dadu section to exist in section order');
    assert(labIdx !== -1, 'Expected #lab section to exist in section order');
    assert(materiIdx !== -1, 'Expected #materi section to exist in section order');
    assert(daduIdx < labIdx, `Expected #dadu (index ${daduIdx}) to be placed directly after Hero, before #lab (index ${labIdx})`);
    assert(labIdx < materiIdx, `Expected #lab (index ${labIdx}) to precede #materi (index ${materiIdx})`);

    // 2. Verify Header navigation links order: Beranda -> Dadu 3D -> Lab Diagram -> Materi
    const navItems = await page.locator('nav[aria-label="Navigasi utama"] a').evaluateAll((els) =>
      els.map((e) => ({ text: e.textContent.trim(), href: e.getAttribute('href') }))
    );
    assert.equal(navItems.length, 6, 'Expected 6 main navigation links');
    assert.equal(navItems[0].text, 'Beranda');
    assert.equal(navItems[1].text, 'Dadu 3D');
    assert.equal(navItems[1].href, '#dadu');
    assert.equal(navItems[2].text, 'Lab Diagram');
    assert.equal(navItems[2].href, '#lab');
    assert.equal(navItems[3].text, 'Materi');
    assert.equal(navItems[3].href, '#materi');

    // 3. Verify Hero button links to #dadu
    const heroCtaHref = await page.locator('.hero a.button.primary').getAttribute('href');
    assert.equal(heroCtaHref, '#dadu', 'Hero CTA button must link to #dadu');

    // 4. Verify "Remove the boxes": .scrolly-step-card does NOT exist (count = 0)
    const stepCardsCount = await page.locator('.scrolly-step-card').count();
    assert.equal(stepCardsCount, 0, 'Expected 0 .scrolly-step-card elements — boxed cards must be completely removed');

    // Verify floating stage text elements exist
    const floatingItemsCount = await page.locator('.floating-stage-item').count();
    assert.equal(floatingItemsCount, 4, 'Expected 4 .floating-stage-item elements to exist for scrolly stages');

    // Verify 4 3D folding section cards exist on prototype (Hero, Dadu, Lab, Materi)
    const sectionCards = page.locator('.folding-section-card');
    assert.equal(await sectionCards.count(), 4, 'Expected 4 .folding-section-card elements (Hero, Dadu, Lab, Materi)');

    // Verify page-level folding sections container exists
    const foldingSectionsContainer = page.locator('.folding-sections-container');
    assert.equal(await foldingSectionsContainer.count() >= 1, true, 'Expected .folding-sections-container to exist');

    // Verify all floating bubbles have been removed
    for (const bubbleSelector of [
      '.freeform-status-pill',
      '.freeform-proof-callout',
      '.freeform-venn-callout',
      '.die-face-highlight-badge',
      '.section-card-index-pill',
      '.prototype-tag',
      '.prototype-banner',
      '.folding-toggle-bar',
    ]) {
      assert.equal(await page.locator(bubbleSelector).count(), 0, `Expected 0 ${bubbleSelector} floating bubbles`);
    }

    // Verify clean spacing between cards
    const c0Box = await page.locator('.folding-section-wrapper').nth(0).boundingBox();
    const c1Box = await page.locator('.folding-section-wrapper').nth(1).boundingBox();
    const gap = c1Box.y - (c0Box.y + c0Box.height);
    assert(gap >= 20, `Expected clean gap between cards, got ${gap}px`);

    // Verify calm mode flattens cards cleanly and full mode restores 3D folding
    const modeSelect = page.getByLabel('Mode tampilan');
    await modeSelect.selectOption('calm');
    await page.waitForTimeout(150);
    const calmTransform = await page.locator('.folding-section-card').first().evaluate(
      (el) => window.getComputedStyle(el).transform
    );
    assert.equal(calmTransform, 'none', 'Expected transform: none in calm mode');
    await modeSelect.selectOption('full');
    await page.waitForTimeout(150);

    // Check no horizontal overflow at start
    const isNoOverflowTop = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    assert(isNoOverflowTop, `Horizontal overflow detected at width ${width} (top)`);

    // 5. Scroll into the 3D scrollytelling runway (directly after Hero)
    const scrollyRunway = page.locator('.scrolly-canvas-runway');
    await scrollyRunway.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Take screenshot at mid-scrolly fold
    await page.screenshot({ path: `docs/screenshots/prototype-3d-folding-${width}.png` });

    // Check no horizontal overflow mid-scroll
    const isNoOverflowMid = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    assert(isNoOverflowMid, `Horizontal overflow detected at width ${width} (mid)`);

    // Verify Centered and locked 3D die stage: die is centered in viewport
    const die = page.locator('.die-stage').first();
    const dieBox = await die.boundingBox();
    assert(dieBox && dieBox.y >= 0 && dieBox.y <= 950, `Die stage must be visible in viewport at width ${width}, got y=${dieBox?.y}`);

    const viewportHeight = 950;
    const dieCenterY = dieBox.y + dieBox.height / 2;
    const expectedCenterY = viewportHeight / 2;
    const deltaY = Math.abs(dieCenterY - expectedCenterY);
    if (width >= 1024) {
      assert(
        deltaY <= 100,
        `Die stage must be vertically centered in viewport on desktop at width ${width} (expected ~${expectedCenterY}px, got ${dieCenterY}px, delta=${deltaY}px)`
      );
    } else {
      assert(
        dieBox && dieBox.y >= 0 && dieBox.y <= 950,
        `Die stage must be visible within viewport at width ${width}, got y=${dieBox?.y}`
      );
    }

    // On desktop (1440px), verify die is horizontally centered as the focal point
    if (width >= 1024) {
      const dieCenterX = dieBox.x + dieBox.width / 2;
      const expectedCenterX = width / 2;
      const deltaX = Math.abs(dieCenterX - expectedCenterX);
      assert(
        deltaX <= 100,
        `Die stage must be horizontally centered on desktop at width ${width} (expected ~${expectedCenterX}px, got ${dieCenterX}px, delta=${deltaX}px)`
      );
    }

    // Verify 3D gimbal hierarchy and continuous rolling layer
    const elevationLayer = page.locator('.die-elevation-layer');
    const orbitLayer = page.locator('.die-orbit-layer');
    const tumbleLayer = page.locator('.die-tumble-layer');
    assert.equal(await elevationLayer.count(), 1, 'Expected .die-elevation-layer');
    assert.equal(await orbitLayer.count(), 1, 'Expected .die-orbit-layer');
    assert.equal(await tumbleLayer.count(), 1, 'Expected .die-tumble-layer');

    await die.click();
    await page.waitForTimeout(300);

    // Verify scrolly progression through stages 2, 3, and 4
    const runwayInfo = await scrollyRunway.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { top: window.scrollY + rect.top, height: el.offsetHeight };
    });

    // Scroll to Stage 3 (~70% of runway) to verify die face highlight
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), runwayInfo.top + runwayInfo.height * 0.70);
    const highlightedFace = page.locator('.die-face-highlighted');
    await highlightedFace.waitFor({ state: 'attached', timeout: 3000 });
    assert(await highlightedFace.count() >= 1, 'Expected face 3 to be highlighted during Stage 3 landing');

    // Scroll to Stage 4 (~95% of runway) to verify formula visibility
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), runwayInfo.top + runwayInfo.height * 0.95);
    const formulaStage4 = page.locator('.stage-4 .floating-stage-formula');
    await formulaStage4.waitFor({ state: 'attached', timeout: 3000 });
    assert(await formulaStage4.count() >= 1, 'Expected formula element in Stage 4');

    // 6. Scroll down to Card 02: Venn Diagram Lab (#lab) and test interactivity
    const labCard = page.locator('#lab');
    await labCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'A ∩ B', exact: true }).click();
    await page.waitForTimeout(300);
    assert(await page.getByText('2 hasil termasuk A dan B sekaligus').isVisible(), 'Expected Venn calculation to update on click');


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
