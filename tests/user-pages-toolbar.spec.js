import { test, expect } from '@playwright/test';

const PAGES = ['/my-reviews', '/my-suggestions'];

test.describe('User pages have the canonical toolbar + keep auth header', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  for (const url of PAGES) {
    test(`${url} renders the shared toolbar`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('header.header .nav-links')).toBeAttached();
      await expect(page.locator('.nav-link-text[href="/"]')).toHaveText('Search');
      await expect(page.locator('.nav-link-text[href="/landscape.html"]')).toHaveText('Landscape');
      await expect(page.locator('.nav-link-text[href="/guides/"]')).toHaveText('Guides');
      await expect(page.locator('#auth-container')).toBeAttached();
    });

    test(`${url} preserves its auth header elements`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#user-info')).toBeAttached();
      await expect(page.locator('#logout-btn')).toBeAttached();
    });

    test(`${url} has no duplicate script tags`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const dupes = await page.evaluate(() => {
        const s = Array.from(document.querySelectorAll('script[src]')).map(x => x.getAttribute('src').split('?')[0]);
        return s.filter((v, i) => s.indexOf(v) !== i);
      });
      expect(dupes).toEqual([]);
    });
  }
});
