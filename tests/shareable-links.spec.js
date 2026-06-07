import { test, expect } from '@playwright/test';

test.describe('Shareable Links', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });
  });

  test.describe('URL Parameters on Page Load', () => {

    test('?q= parameter triggers search and shows results', async ({ page }) => {
      await page.goto('/?q=observability');

      const searchInput = page.locator('#action-input');
      await expect(searchInput).toHaveValue('observability');

      const results = page.locator('#search-results');
      await expect(results).not.toHaveClass(/hidden/);

      const resultCount = page.locator('#results-count');
      await expect(resultCount).not.toHaveText('0 tools found');
    });

    test('?category= parameter filters to category', async ({ page }) => {
      await page.goto('/?category=foundation-models');

      const searchInput = page.locator('#action-input');
      await expect(searchInput).toHaveValue('Foundation Models');

      const results = page.locator('#search-results');
      await expect(results).not.toHaveClass(/hidden/);
    });

    test('?subcategory= parameter filters to subcategory', async ({ page }) => {
      await page.goto('/?subcategory=llm-apis');

      const searchInput = page.locator('#action-input');
      await expect(searchInput).toHaveValue('LLM APIs');

      const results = page.locator('#search-results');
      await expect(results).not.toHaveClass(/hidden/);
    });

    test('empty ?q= is ignored, shows default homepage', async ({ page }) => {
      await page.goto('/?q=');

      const results = page.locator('#search-results');
      await expect(results).toHaveClass(/hidden/);
    });

    test('invalid category shows no results', async ({ page }) => {
      await page.goto('/?category=nonexistent-category');

      const results = page.locator('#search-results');
      await expect(results).not.toHaveClass(/hidden/);

      const resultCount = page.locator('#results-count');
      await expect(resultCount).toHaveText('0 tools found');
    });

  });

});
