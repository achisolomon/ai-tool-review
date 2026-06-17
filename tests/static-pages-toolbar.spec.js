import { test, expect } from '@playwright/test';

const PAGES = ['/about', '/contact', '/privacy', '/changes'];

test.describe('Static pages have the canonical toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await page.route('https://pagead2.googlesyndication.com/**', r => r.abort());
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
