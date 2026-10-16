import { test, expect } from '@playwright/test';

// AdSense policy: no Google-served ads on screens used for navigation, on
// utility/account screens, or on pages with little content. Ads belong only
// on substantial tool reviews and guide articles.

const NO_AD_PAGES = ['/', '/landscape', '/guides/', '/about', '/contact', '/changes', '/privacy', '/admin', '/my-reviews', '/my-suggestions'];

test.describe('AdSense placement policy', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.setItem('cookie_consent', 'accepted'); });
    await page.route('https://www.googletagmanager.com/**', r => r.abort());
    await page.route('https://cdn.jsdelivr.net/**', r => r.abort());
  });

  for (const url of NO_AD_PAGES) {
    test(`${url} ships no ad code`, async ({ page }) => {
      const res = await page.request.get(url);
      const html = await res.text();
      expect(html).not.toContain('pagead2.googlesyndication.com');
      expect(html).not.toContain('class="adsbygoogle"');
    });
  }

  test('home keeps the AdSense ownership meta tag', async ({ page }) => {
    const html = await (await page.request.get('/')).text();
    expect(html).toContain('name="google-adsense-account"');
  });

  test('a stub tool review has no ad and is noindex', async ({ page }) => {
    const html = await (await page.request.get('/tools/agentops/')).text();
    expect(html).not.toContain('class="adsbygoogle"');
    expect(html).toContain('content="noindex, follow"');
  });

  test('a substantial tool review shows a visible ad slot', async ({ page }) => {
    await page.goto('/tools/cursor/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#page-content')).toHaveClass(/ad-eligible/);
    const ins = page.locator('.footer-ad ins.adsbygoogle');
    await expect(ins).toBeVisible();
    await expect(ins).toHaveCSS('opacity', '1');
    await expect(ins).toHaveCSS('position', 'static');
  });

  test('a guide article shows a visible ad slot', async ({ page }) => {
    await page.goto('/guides/loop-engineering/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.footer-ad ins.adsbygoogle')).toBeVisible();
  });

  test('ad slot hides after SPA navigation to the home search screen', async ({ page }) => {
    await page.goto('/tools/cursor/', { waitUntil: 'load' });
    await expect(page.locator('.footer-ad')).toBeVisible();
    await page.locator('a[data-spa-link][href="/"]').first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#page-content')).not.toHaveClass(/ad-eligible/);
    await expect(page.locator('.footer-ad')).toBeHidden();
  });

  test('dev/test files are not published', async ({ page }) => {
    for (const url of ['/hero-variants.html', '/test-popstate.html', '/prototypes/', '/server.js', '/package.json', '/tests/search.spec.js']) {
      const res = await page.request.get(url);
      expect(res.status(), url).toBe(404);
    }
  });
});
