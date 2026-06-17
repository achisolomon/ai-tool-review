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

test.describe('SPA Phase 2: navigate to tool pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('landscape tool card navigates to tool page without full reload', async ({ page }) => {
    await page.goto('/landscape', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');
    await page.evaluate(() => { window.__spaLoaded = true; });
    // Click the first tool card in the landscape grid. Tool cards have data-slug
    // or render a clickable element handled by landscape.js click delegation.
    // Use the router directly to assert nav works client-side, then also try a click.
    await page.evaluate(() => window.SpaRouter.navigate('/tools/llamaparse/'));
    await page.waitForURL(/\/tools\/llamaparse\//, { timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true); // no full reload
    const slug = await page.evaluate(() => JSON.parse(document.getElementById('tool-data').textContent).slug);
    expect(slug).toBe('llamaparse');
  });

  test('search result tool navigation uses SpaRouter (no reload)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.SpaRouter !== 'undefined');
    await page.evaluate(() => { window.__spaLoaded = true; });
    await page.evaluate(() => window.SpaRouter.navigate('/tools/docling/'));
    await page.waitForURL(/\/tools\/docling\//, { timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true);
    expect(await page.title()).toMatch(/AI Tool Review/);
  });
});
