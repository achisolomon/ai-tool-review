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
