import { test, expect } from '@playwright/test';

test.describe('Admin page has canonical toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  test('admin page renders the shared nav toolbar (logo + Search/Landscape/Guides + auth container)', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('header.header .nav-links')).toBeAttached();
    await expect(page.locator('.nav-link-text[href="/"]')).toHaveText('Search');
    await expect(page.locator('.nav-link-text[href="/landscape.html"]')).toHaveText('Landscape');
    await expect(page.locator('.nav-link-text[href="/guides/"]')).toHaveText('Guides');
    await expect(page.locator('#auth-container')).toBeAttached();
  });

  test('admin page preserves its moderation auth elements (no regression)', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#admin-user-info')).toBeAttached();
    await expect(page.locator('#logout-btn')).toBeAttached();
    await expect(page.locator('.admin-header h1')).toHaveText('Moderation');
  });

  test('no duplicate script tags on admin page', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    const dupes = await page.evaluate(() => {
      const srcs = Array.from(document.querySelectorAll('script[src]')).map(s => s.getAttribute('src').split('?')[0]);
      return srcs.filter((s, i) => srcs.indexOf(s) !== i);
    });
    expect(dupes).toEqual([]);
  });
});
