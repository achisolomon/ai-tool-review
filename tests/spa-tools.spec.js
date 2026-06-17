import { test, expect } from '@playwright/test';

test.describe('SPA Phase 2: tool routing + landmarks', () => {
  test('tool page has #page-content and #tool-data JSON island', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toBeAttached();
    const data = await page.evaluate(() => {
      const el = document.getElementById('tool-data');
      return el ? JSON.parse(el.textContent) : null;
    });
    expect(data).toBeTruthy();
    expect(data.slug).toBe('llamaparse');
    expect(typeof data.name).toBe('string');
  });

  test('router matches /tools/:slug/', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const m = await page.evaluate(() => window.SpaRouter.matchRoute('/tools/llamaparse/'));
    expect(m).toBeTruthy();
    expect(m.params.slug).toBe('llamaparse');
  });
});

test.describe('SPA Phase 2: tool head metadata', () => {
  test('tool page head SEO/schema nodes are marked data-spa-head', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    const desc = await page.evaluate(() =>
      document.querySelector('meta[name="description"][data-spa-head]')?.getAttribute('content'));
    expect(desc).toBeTruthy();
    const schema = await page.evaluate(() =>
      !!document.querySelector('script[type="application/ld+json"][data-spa-head]'));
    expect(schema).toBe(true);
  });
});

test.describe('SPA Phase 2: tool-page init exists + suggest wiring', () => {
  test('window.toolPageInit is a function and suggest-edit button is present', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => typeof window.toolPageInit)).toBe('function');
    await expect(page.locator('#tool-suggest-open')).toBeAttached();
  });

  test('toolPageInit is idempotent for suggest wiring (no double-binding)', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'domcontentloaded' });
    // Re-running init must not re-bind the suggest button (guard via dataset flag).
    const wiredTwice = await page.evaluate(() => {
      const btn = document.getElementById('tool-suggest-open');
      window.toolPageInit();
      window.toolPageInit();
      return btn?.dataset.wired;
    });
    expect(wiredTwice).toBe('1');
  });
});

test.describe('SPA Phase 2: reviews init via tool-page.js', () => {
  // Block external CDNs (Supabase) so ensureSupabase() fails fast and
  // networkidle can fire. Reviews degrade to hidden/empty — tests tolerate that.
  test.beforeEach(async ({ page }) => {
    await page.route(/^https?:\/\/(?!localhost)/, route => route.abort());
  });

  test('reviews section renders or hides gracefully on direct load', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'networkidle' });
    const state = await page.evaluate(() => {
      const sec = document.getElementById('reviews');
      if (!sec) return 'no-section';
      if (sec.hidden) return 'hidden';
      const sum = document.getElementById('review-summary-container');
      return sum && sum.innerHTML.trim().length > 0 ? 'rendered' : 'empty';
    });
    expect(['hidden', 'rendered', 'empty']).toContain(state);
  });

  test('re-running toolPageInit does not duplicate review modals', async ({ page }) => {
    await page.goto('/tools/llamaparse/', { waitUntil: 'networkidle' });
    await page.evaluate(() => { window.toolPageInit(); window.toolPageInit(); });
    await page.waitForTimeout(300);
    // No modal id should appear more than once.
    const dupes = await page.evaluate(() => {
      const ids = ['review-modal', 'auth-modal', 'existing-review-modal', 'delete-confirm-modal'];
      return ids.filter(id => document.querySelectorAll('#' + id).length > 1);
    });
    expect(dupes).toEqual([]);
  });
});

test.describe('SPA Phase 2: tool libs available cross-page', () => {
  test('from home, tool-page libraries are loaded', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const libs = await page.evaluate(() => ({
      reviewsApi: typeof window.ReviewsAPI,
      reviewComponents: typeof window.ReviewComponents,
      suggest: typeof window.Suggest,
      toolPageInit: typeof window.toolPageInit,
    }));
    expect(libs.reviewsApi).toBe('object');
    expect(libs.reviewComponents).toBe('object');
    expect(libs.suggest).toBe('object');
    expect(libs.toolPageInit).toBe('function');
  });
});
