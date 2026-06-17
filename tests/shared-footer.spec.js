import { test, expect } from '@playwright/test';

const PAGES = ['/', '/landscape', '/guides/', '/admin', '/about', '/contact', '/privacy', '/changes', '/my-reviews', '/my-suggestions', '/tools/llamaparse/', '/guides/managing-ai-coding-tool-budgets/'];

test.describe('Shared footer on every page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
    await page.route('https://pagead2.googlesyndication.com/**', r => r.abort());
  });

  for (const url of PAGES) {
    test(`${url} has the shared footer with absolute links`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const footer = page.locator('footer.footer .footer-bottom');
      await expect(footer).toBeAttached();
      await expect(footer).toContainText('AI Tool Review');
      await expect(footer.locator('a[href="/about.html"]')).toHaveCount(1);
      await expect(footer.locator('a[href="/contact.html"]')).toHaveCount(1);
      await expect(footer.locator('a[href="/privacy.html"]')).toHaveCount(1);
    });
  }
});
