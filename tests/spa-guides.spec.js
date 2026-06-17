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
