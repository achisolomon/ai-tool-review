import { test, expect } from '@playwright/test';

/**
 * Regression suite for the hero / visual redesign shipped on branch
 * `ux-design-improvements` (tag: ux-hero-v1).
 *
 * Every block below locks in one decision made during the design session so a
 * future edit can't silently undo it. Where a value is a deliberate design
 * choice (a specific colour, a specific count) it's asserted exactly; where the
 * contract is "intent" (translucent, sequential, no-blur) the assertion targets
 * the intent so minor tuning doesn't cause false failures.
 */

// --- helpers ---------------------------------------------------------------

/** Parse "rgb(a)(r, g, b[, a])" into {r,g,b,a}. */
function parseRgba(str) {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
  return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
}

/** First numeric seconds value of a (possibly multi-value) time list, e.g. "1.05s, 0.4s" -> 1.05 */
function firstSeconds(str) {
  const m = String(str).split(',')[0].trim().match(/([\d.]+)s/);
  return m ? parseFloat(m[1]) : NaN;
}

/** Count rendered grid tracks from a computed grid-template-columns value. */
function trackCount(computed) {
  if (!computed || computed === 'none') return 0;
  return computed.trim().split(/\s+/).filter(Boolean).length;
}

const css = (page, selector, prop, pseudo = null) =>
  page.evaluate(
    ([sel, p, ps]) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      return getComputedStyle(el, ps).getPropertyValue(p);
    },
    [selector, prop, pseudo]
  );

test.describe('UX redesign regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  // ------------------------------------------------------------------ eyebrow
  test.describe('Hero eyebrow (sequential typing, two lines, dim //)', () => {
    test('renders exactly two eyebrow lines with the agreed copy', async ({ page }) => {
      const lines = page.locator('.hero-eyebrow .hero-eyebrow-line');
      await expect(lines).toHaveCount(2);

      await expect(page.locator('.hero-eyebrow .line1')).toHaveText('// For developers by developers (and claude)');
      await expect(page.locator('.hero-eyebrow .line2')).toHaveText('// Community-curated, honestly ranked');
    });

    test('each line carries a dimmed // prefix as real text (not a ::before)', async ({ page }) => {
      const dims = page.locator('.hero-eyebrow .eyebrow-dim');
      await expect(dims).toHaveCount(2);
      await expect(dims.first()).toHaveText('//');

      // The old design injected "// " via .hero-eyebrow::before, which doubled
      // the slashes on line 1. That ::before must stay gone.
      const beforeContent = await css(page, '.hero-eyebrow', 'content', '::before');
      expect(beforeContent === 'none' || beforeContent === 'normal' || beforeContent === '').toBeTruthy();
    });

    test('line 2 only starts typing after line 1 has finished (sequential, not simultaneous)', async ({ page }) => {
      const timing = await page.evaluate(() => {
        const l1 = getComputedStyle(document.querySelector('.hero-eyebrow .line1'));
        const l2 = getComputedStyle(document.querySelector('.hero-eyebrow .line2'));
        return {
          l1delay: l1.animationDelay,
          l1dur: l1.animationDuration,
          l2delay: l2.animationDelay,
        };
      });
      const l1delay = firstSeconds(timing.l1delay);
      const l1dur = firstSeconds(timing.l1dur);
      const l2delay = firstSeconds(timing.l2delay);

      expect(l1delay).toBeGreaterThanOrEqual(0);
      // Line 2's typewriter cannot begin before line 1's typewriter has ended.
      expect(l2delay).toBeGreaterThanOrEqual(l1delay + l1dur);
    });
  });

  // -------------------------------------------------------------- hero copy
  test.describe('Hero copy & stats placement', () => {
    test('subtitle is the agreed one-liner in the developer voice', async ({ page }) => {
      await expect(page.locator('.hero-subtitle')).toHaveText('Find the right AI tool, share your take.');
    });

    test('subtitle no longer carries the inline tool/category counts', async ({ page }) => {
      const text = await page.locator('.hero-subtitle').textContent();
      expect(text).not.toMatch(/\d+\+/); // "330+ tools across 15+ categories" lived here before
      expect(text).not.toContain('community-reviewed');
    });

    test('stats line is a footnote BELOW the browse link', async ({ page }) => {
      const stats = page.locator('.hero-stats');
      await expect(stats).toBeVisible();
      await expect(stats).toContainText('tools across');
      await expect(stats).toContainText('categories');

      const order = await page.evaluate(() => {
        const browse = document.querySelector('.browse-toggle');
        const stats = document.querySelector('.hero-stats');
        // DOCUMENT_POSITION_FOLLOWING (4) => stats comes after browse
        return browse.compareDocumentPosition(stats) & Node.DOCUMENT_POSITION_FOLLOWING ? 'after' : 'before';
      });
      expect(order).toBe('after');
    });

    test('search placeholder dropped the duplicated "330+" count', async ({ page }) => {
      const placeholder = await page.locator('#action-input').getAttribute('placeholder');
      expect(placeholder).not.toContain('330');
    });
  });

  // --------------------------------------------------------- dynamic counts
  test.describe('Hero counts are driven from landscapeData (not static)', () => {
    test('rendered counts equal the live data totals', async ({ page }) => {
      const expected = await page.evaluate(() => {
        if (typeof landscapeData === 'undefined') return null;
        let tools = 0;
        let cats = 0;
        for (const track of ['users', 'developers']) {
          if (!landscapeData[track]) continue;
          cats += landscapeData[track].length;
          for (const cat of landscapeData[track]) {
            for (const sub of cat.subcategories) tools += sub.tools.length;
          }
        }
        return { tools, cats };
      });
      expect(expected).not.toBeNull();
      expect(expected.tools).toBeGreaterThan(0);
      expect(expected.cats).toBeGreaterThan(0);

      await expect(page.locator('#hero-tool-count')).toHaveText(`${expected.tools}+`);
      await expect(page.locator('#hero-cat-count')).toHaveText(`${expected.cats}+`);
    });
  });

  // ----------------------------------------------------- search bar stays put
  test.describe('Search bar position is stable when results appear', () => {
    test('the search box does not move once results render below it', async ({ page }) => {
      const box = page.locator('.action-search');
      const before = await box.boundingBox();

      await page.locator('#action-input').fill('agent');
      await page.waitForTimeout(350);
      await expect(page.locator('#search-results')).not.toHaveClass(/hidden/);

      const after = await box.boundingBox();
      expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
    });
  });

  // ----------------------------------------------------------------- header
  test.describe('Header is frosted (translucent + blur), not opaque', () => {
    test('background is translucent dark and uses a backdrop blur', async ({ page }) => {
      const bg = parseRgba(await css(page, '.header', 'background-color'));
      expect(bg).not.toBeNull();
      expect(bg.a).toBeGreaterThan(0); // not fully transparent
      expect(bg.a).toBeLessThan(1); // not fully opaque -> constellation shows through
      expect(bg.r).toBeLessThan(70); // dark
      expect(bg.g).toBeLessThan(70);
      expect(bg.b).toBeLessThan(70);

      const blur =
        (await css(page, '.header', 'backdrop-filter')) ||
        (await css(page, '.header', '-webkit-backdrop-filter'));
      expect(blur).toMatch(/blur\(/);
    });

    test('header stays sticky at the top', async ({ page }) => {
      expect(await css(page, '.header', 'position')).toBe('sticky');
      expect(parseInt(await css(page, '.header', 'z-index'), 10)).toBeGreaterThanOrEqual(100);
    });
  });

  // ----------------------------------------------------------------- footer
  test.describe('Footer', () => {
    test('is visible (the always-show decision)', async ({ page }) => {
      await expect(page.locator('.footer')).toBeVisible();
    });

    test('copyright line dropped "Community-curated" but kept the brand line', async ({ page }) => {
      const text = await page.locator('.footer-bottom p').textContent();
      expect(text).toContain('© 2026 AI Tool Review');
      expect(text).not.toContain('Community-curated');
    });

    test('the old marketing block and border lines are gone', async ({ page }) => {
      // The "AI Tool Review / your community-curated guide" block was removed.
      await expect(page.locator('.footer .footer-content')).toHaveCount(0);
      // The blue top border line was removed.
      const borderTop = await css(page, '.footer', 'border-top-width');
      expect(parseFloat(borderTop)).toBe(0);
    });
  });

  // ------------------------------------------------------------ result cards
  test.describe('Result cards are translucent with no per-card blur (seamless glow)', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('#action-input').fill('agent');
      await page.waitForTimeout(350);
      await expect(page.locator('.result-card').first()).toBeVisible();
    });

    test('card background is semi-transparent so the canvas shows through', async ({ page }) => {
      const bg = parseRgba(await css(page, '.result-card', 'background-color'));
      expect(bg).not.toBeNull();
      expect(bg.a).toBeGreaterThan(0);
      expect(bg.a).toBeLessThan(1);
    });

    test('cards have NO backdrop-filter (the seam rule)', async ({ page }) => {
      const filter = await css(page, '.result-card', 'backdrop-filter');
      const webkit = await css(page, '.result-card', '-webkit-backdrop-filter');
      expect(filter === 'none' || filter === '' || filter == null).toBeTruthy();
      expect(webkit === 'none' || webkit === '' || webkit == null).toBeTruthy();
    });

    test('the per-card glow ::after was removed in favour of the page-level glow', async ({ page }) => {
      const content = await css(page, '.result-card', 'content', '::after');
      expect(content === 'none' || content === 'normal' || content === '').toBeTruthy();
    });
  });

  // ----------------------------------------------------------- results grid
  test.describe('Search results grid uses full width with consistent columns', () => {
    test('3 columns on desktop, 2 on tablet, 1 on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.locator('#action-input').fill('agent');
      await page.waitForTimeout(350);
      await expect(page.locator('#results-grid .result-card').first()).toBeVisible();

      const cols = (w) =>
        page.evaluate(() => getComputedStyle(document.querySelector('#results-grid')).gridTemplateColumns);

      await page.setViewportSize({ width: 1280, height: 900 });
      await page.waitForTimeout(150);
      expect(trackCount(await cols())).toBe(3);

      await page.setViewportSize({ width: 1000, height: 900 });
      await page.waitForTimeout(150);
      expect(trackCount(await cols())).toBe(2);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(150);
      expect(trackCount(await cols())).toBe(1);
    });
  });

  // ------------------------------------------------------------ cursor glow
  test.describe('Single page-level cursor glow', () => {
    test('a fixed full-viewport glow layer exists with a radial gradient', async ({ page }) => {
      const glow = page.locator('#cursor-glow');
      await expect(glow).toHaveCount(1);
      expect(await css(page, '#cursor-glow', 'position')).toBe('fixed');
      expect(await css(page, '#cursor-glow', 'background-image')).toMatch(/radial-gradient/);
      // Decorative only: must not eat pointer events.
      expect(await css(page, '#cursor-glow', 'pointer-events')).toBe('none');
    });

    test('moving the mouse updates the --mouse-x/--mouse-y custom properties on <html>', async ({ page }) => {
      await page.mouse.move(420, 310);
      await page.waitForTimeout(50);
      const vars = await page.evaluate(() => ({
        x: document.documentElement.style.getPropertyValue('--mouse-x'),
        y: document.documentElement.style.getPropertyValue('--mouse-y'),
      }));
      expect(vars.x).toBe('420px');
      expect(vars.y).toBe('310px');
    });
  });

  // -------------------------------------------------------- constellation bg
  test.describe('Constellation canvas is a full-viewport background', () => {
    test('canvas is fixed, sits behind content, and spans the viewport', async ({ page }) => {
      const canvas = page.locator('#hero-map');
      await expect(canvas).toHaveCount(1);
      expect(await css(page, '#hero-map', 'position')).toBe('fixed');
      expect(parseInt(await css(page, '#hero-map', 'z-index'), 10)).toBeLessThan(0);

      const vp = page.viewportSize();
      const boxW = await canvas.evaluate((el) => el.getBoundingClientRect().width);
      expect(boxW).toBeGreaterThanOrEqual(vp.width - 2);
    });
  });

  // ------------------------------------------ search result chrome was removed
  test.describe('Search results lost the two chrome bars', () => {
    test('the editor-tabs bar and results-header bar are gone', async ({ page }) => {
      await page.locator('#action-input').fill('agent');
      await page.waitForTimeout(350);
      await expect(page.locator('.editor-tabs')).toHaveCount(0);
      await expect(page.locator('.results-header')).toHaveCount(0);
    });

    test('JS-required nodes are kept but hidden', async ({ page }) => {
      // These are referenced by app.js, so they must exist but stay invisible.
      for (const id of ['#results-count', '#clear-search', '#copy-link']) {
        await expect(page.locator(id)).toHaveCount(1);
        await expect(page.locator(id)).toBeHidden();
      }
    });
  });
});

// ---------------------------------------------------------------- reduced motion
test.describe('Reduced-motion contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
    await page.goto('/');
  });

  test('eyebrow lines do not animate when the user prefers reduced motion', async ({ page }) => {
    // Guards the specificity fix: the reduced-motion override must beat the
    // per-line `.hero-eyebrow .line1/.line2` animation rules.
    const matches = await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    expect(matches).toBe(true);

    const name = await page.evaluate(
      () => getComputedStyle(document.querySelector('.hero-eyebrow-line')).animationName
    );
    expect(name).toBe('none');
  });

  test('both eyebrow lines are fully shown (no clipped typing state)', async ({ page }) => {
    await expect(page.locator('.hero-eyebrow .line1')).toHaveText('// For developers by developers (and claude)');
    await expect(page.locator('.hero-eyebrow .line2')).toHaveText('// Community-curated, honestly ranked');
  });
});
