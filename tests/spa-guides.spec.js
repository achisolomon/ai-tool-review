import { test, expect } from '@playwright/test';

test.describe('SPA Phase 1: shared bootstrap', () => {
  test('article page loads router.js and page-init functions', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    const has = await page.evaluate(() => ({
      router: typeof window.SpaRouter,
      landscapeInit: typeof window.landscapeInit,
    }));
    expect(has.router).toBe('object');
    expect(has.landscapeInit).toBe('function');
  });
});

test.describe('SPA Phase 1: route matching', () => {
  test('matchRoute resolves static and param routes with correct precedence', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(() => ({
      guidesIndex: !!window.SpaRouter.matchRoute('/guides/'),
      article: !!window.SpaRouter.matchRoute('/guides/some-slug/'),
      home: !!window.SpaRouter.matchRoute('/'),
      unknown: !!window.SpaRouter.matchRoute('/nope/'),
      articleSlug: window.SpaRouter.matchRoute('/guides/some-slug/')?.params?.slug,
      guidesIndexParams: window.SpaRouter.matchRoute('/guides/')?.params,
    }));
    expect(r.guidesIndex).toBe(true);
    expect(r.article).toBe(true);
    expect(r.home).toBe(true);
    expect(r.unknown).toBe(false);
    expect(r.articleSlug).toBe('some-slug');
    expect(r.guidesIndexParams).toEqual({});
  });
});

test.describe('SPA Phase 1: article init', () => {
  test('articlePageInit builds TOC from article headings', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    const count = await page.locator('#toc-list li').count();
    expect(count).toBeGreaterThan(0);
    expect(await page.evaluate(() => typeof window.articlePageInit)).toBe('function');
  });

  test('articlePageInit is idempotent (no duplicate TOC entries on re-run)', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    const before = await page.locator('#toc-list li').count();
    await page.evaluate(() => window.articlePageInit());
    const after = await page.locator('#toc-list li').count();
    expect(after).toBe(before);
  });
});

test.describe('SPA Phase 1: DOM prerequisites', () => {
  test('article page has #page-content', async ({ page }) => {
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toBeAttached();
  });
});

test.describe('SPA Phase 1: cross-page nav from article', () => {
  test('article → search works without full reload and search initializes', async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await page.goto('/guides/managing-ai-coding-tool-budgets/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });

    await page.locator('.nav-link-text[href="/"]').click();

    await expect(page.locator('#search-input')).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true); // no reload
    expect(page.url()).toMatch(/localhost:\d+\/$/);
  });
});

test.describe('SPA Phase 1: navigate to articles', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('A3: clicking an article card navigates without full reload', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });
    await page.locator('a.article-card[data-spa-link]').first().click();
    await expect(page.locator('#page-content h1')).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true);
    expect(page.url()).toMatch(/\/guides\/.+\//);
  });

  test('A6: browser back from article restores guides index', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.__spaLoaded = true; });
    await page.locator('a.article-card[data-spa-link]').first().click();
    await expect(page.locator('#page-content h1')).toBeVisible({ timeout: 5000 });
    await page.goBack();
    await expect(page.locator('.article-card').first()).toBeVisible({ timeout: 5000 });
    expect(await page.evaluate(() => window.__spaLoaded)).toBe(true);
    expect(page.url()).toMatch(/\/guides\/$/);
  });
});

test.describe('SPA Phase 1: head metadata swap', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('title and description update when navigating to an article', async ({ page }) => {
    await page.goto('/guides/', { waitUntil: 'domcontentloaded' });
    const card = page.locator('a.article-card[data-spa-link]').first();
    const expectedTitlePart = await card.locator('h2').textContent();
    await card.click();
    await expect(page.locator('#page-content h1')).toBeVisible({ timeout: 5000 });

    const title = await page.title();
    expect(title).toContain(expectedTitlePart.trim());

    const desc = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute('content'));
    expect(desc).toBeTruthy();
  });
});
