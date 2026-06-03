import { test, expect } from '@playwright/test';

test.describe('Page Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });
  });

  test.describe('Landscape Page', () => {

    test('landscape page loads at /landscape.html', async ({ page }) => {
      await page.goto('/landscape.html');
      await expect(page).toHaveTitle(/AI Tool/);
      await expect(page.locator('#landscape')).toBeVisible();
    });

    test('landscape page loads at /landscape (clean URL)', async ({ page }) => {
      const response = await page.goto('/landscape');
      expect(response.status()).toBe(200);
      await expect(page.locator('#landscape')).toBeVisible();
    });

    test('landscape nav link works from homepage', async ({ page }) => {
      await page.goto('/');
      await page.locator('a[href="landscape.html"]').first().click();
      await expect(page).toHaveURL(/landscape/);
      await expect(page.locator('#landscape')).toBeVisible();
    });

    test('landscape page displays tool categories', async ({ page }) => {
      await page.goto('/landscape.html');
      // Should have category sections
      const categories = page.locator('.category');
      expect(await categories.count()).toBeGreaterThan(0);
    });

    test('clicking tool card in landscape navigates to internal tool page', async ({ page }) => {
      await page.goto('/landscape.html');

      // Wait for tools to render
      await page.waitForSelector('.tool-card');

      // Expand to "Tools" view to make tool cards clickable
      const toolsBtn = page.locator('[data-view="all"]');
      await toolsBtn.click();
      await page.waitForTimeout(500);

      // Get a visible tool card
      const firstCard = page.locator('.tool-card').first();
      const slug = await firstCard.getAttribute('data-slug');

      // Use JavaScript click to ensure the event bubbles to the delegated handler
      await firstCard.evaluate(el => el.click());

      // Should navigate to internal tool page, not external URL
      await expect(page).toHaveURL(new RegExp(`/tools/${slug}/?`));
      await expect(page.locator('.tool-page')).toBeVisible();
    });

    test('all landscape tool pages exist and load successfully', async ({ page }) => {
      await page.goto('/landscape.html');
      await page.waitForSelector('.tool-card');

      // Get all tool slugs from landscape
      const slugs = await page.locator('.tool-card').evaluateAll(cards =>
        cards.map(card => card.dataset.slug).filter(Boolean)
      );

      // Sample up to 10 random tools to test (to keep test fast)
      const sampleSize = Math.min(slugs.length, 10);
      const sampledSlugs = slugs.sort(() => 0.5 - Math.random()).slice(0, sampleSize);

      // Verify each sampled tool page loads with 200
      for (const slug of sampledSlugs) {
        const response = await page.request.get(`/tools/${slug}/`);
        expect(response.status(), `Tool page /tools/${slug}/ should exist`).toBe(200);
      }
    });
  });

  test.describe('Tool Pages', () => {

    test('tool page loads for a known tool', async ({ page }) => {
      // Navigate to a tool page that should exist
      await page.goto('/tools/langchain/');

      // Should load without error (not 404)
      await expect(page.locator('.tool-page')).toBeVisible();
    });

    test('tool page displays tool name in header', async ({ page }) => {
      await page.goto('/tools/langchain/');

      const header = page.locator('.tool-header h1');
      await expect(header).toBeVisible();
      await expect(header).not.toBeEmpty();
    });

    test('tool page has required sections', async ({ page }) => {
      await page.goto('/tools/langchain/');

      // Should have tool content
      await expect(page.locator('.tool-content')).toBeVisible();
    });

    test('clicking search result navigates to tool page', async ({ page }) => {
      await page.goto('/');

      // Search for a tool
      await page.locator('#action-input').fill('langchain');
      await page.waitForTimeout(300);

      // Click first result
      const firstCard = page.locator('.result-card').first();
      const slug = await firstCard.getAttribute('data-slug');
      await firstCard.click();

      // Should be on tool page
      await expect(page).toHaveURL(new RegExp(`/tools/${slug}/?`));
      await expect(page.locator('.tool-page')).toBeVisible();
    });
  });

  test.describe('Navigation Links', () => {

    test('homepage logo links to root', async ({ page }) => {
      await page.goto('/landscape.html');
      await page.locator('.logo').click();
      await expect(page).toHaveURL('/');
    });

    test('browse link from homepage goes to landscape', async ({ page }) => {
      await page.goto('/');
      await page.locator('.browse-toggle').click();
      await expect(page).toHaveURL(/landscape/);
    });
  });
});

test.describe('404 Prevention', () => {

  test('no broken internal links on homepage', async ({ page }) => {
    await page.goto('/');

    // Get all internal links
    const links = await page.locator('a[href^="/"], a[href^="./"], a[href$=".html"]').all();

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.includes('mailto:')) {
        const response = await page.request.get(href);
        expect(response.status(), `Link ${href} should not 404`).not.toBe(404);
      }
    }
  });

  test('no broken internal links on landscape page', async ({ page }) => {
    await page.goto('/landscape.html');

    // Check nav links
    const navLinks = await page.locator('nav a[href]').all();

    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/') || href.endsWith('.html')) {
        const response = await page.request.get(href);
        expect(response.status(), `Nav link ${href} should not 404`).not.toBe(404);
      }
    }
  });
});
