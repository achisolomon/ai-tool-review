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

  test.describe('URL Updates on Search/Filter', () => {

    test('typing search updates URL with ?q= parameter', async ({ page }) => {
      await page.goto('/');

      const searchInput = page.locator('#action-input');
      await searchInput.fill('langchain');
      await page.waitForTimeout(300);

      await expect(page).toHaveURL(/\?q=langchain/);
    });

    test('selecting category from autocomplete updates URL', async ({ page }) => {
      await page.goto('/');

      const searchInput = page.locator('#action-input');
      await searchInput.fill('Foundation');
      await page.waitForTimeout(150);

      const categoryItem = page.locator('.autocomplete-item[data-type="category"]').first();
      await categoryItem.click();

      await expect(page).toHaveURL(/\?category=/);
    });

    test('selecting subcategory from autocomplete updates URL', async ({ page }) => {
      await page.goto('/');

      const searchInput = page.locator('#action-input');
      await searchInput.fill('LLM API');
      await page.waitForTimeout(150);

      const subcategoryItem = page.locator('.autocomplete-item[data-type="subcategory"]').first();
      await subcategoryItem.click();

      await expect(page).toHaveURL(/\?subcategory=/);
    });

    test('clearing search removes URL parameters', async ({ page }) => {
      await page.goto('/?q=test');
      await page.waitForTimeout(300);

      await page.locator('#clear-search').click();

      const url = page.url();
      expect(url).not.toContain('?q=');
      expect(url).not.toContain('?category=');
      expect(url).not.toContain('?subcategory=');
    });

  });

});
