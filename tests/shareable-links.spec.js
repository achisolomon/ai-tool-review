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
      await expect(searchInput).toHaveValue('Foundation Models & Model Hubs');

      const results = page.locator('#search-results');
      await expect(results).not.toHaveClass(/hidden/);
    });

    test('?subcategory= parameter filters to subcategory', async ({ page }) => {
      await page.goto('/?subcategory=model-hubs');

      const searchInput = page.locator('#action-input');
      await expect(searchInput).toHaveValue('Model Hubs & Registries');

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

  test.describe('Parameter Precedence', () => {

    test('subcategory takes precedence over category', async ({ page }) => {
      await page.goto('/?category=foundation-models&subcategory=model-hubs');
      const searchInput = page.locator('#action-input');
      // Should show the subcategory name, not the category
      await expect(searchInput).toHaveValue('Model Hubs & Registries');
    });

    test('subcategory takes precedence over q', async ({ page }) => {
      await page.goto('/?q=test&subcategory=model-hubs');
      const searchInput = page.locator('#action-input');
      await expect(searchInput).toHaveValue('Model Hubs & Registries');
    });

    test('category takes precedence over q', async ({ page }) => {
      await page.goto('/?q=test&category=foundation-models');
      const searchInput = page.locator('#action-input');
      await expect(searchInput).toHaveValue('Foundation Models & Model Hubs');
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
      await searchInput.fill('Model Hubs');
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

  test.describe('Copy Link Button', () => {

    test('Copy Link button is visible when results are showing', async ({ page }) => {
      await page.goto('/?q=agent');

      const copyButton = page.locator('#copy-link');
      await expect(copyButton).toBeVisible();
    });

    test('Copy Link button is hidden when no results', async ({ page }) => {
      await page.goto('/');

      const copyButton = page.locator('#copy-link');
      await expect(copyButton).not.toBeVisible();
    });

    test('clicking Copy Link copies URL to clipboard', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto('/?q=vector');

      const copyButton = page.locator('#copy-link');
      await copyButton.click();

      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toContain('?q=vector');
    });

    test('Copy Link button shows "Copied!" feedback', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto('/?q=rag');

      const copyButton = page.locator('#copy-link');
      await copyButton.click();

      await expect(copyButton).toContainText('Copied');

      // Wait for it to revert
      await page.waitForTimeout(2000);
      await expect(copyButton).toContainText('Copy Link');
    });

  });

  test.describe('Browser Navigation', () => {

    test('browser back button restores previous search', async ({ page }) => {
      await page.goto('/');

      // First search
      const searchInput = page.locator('#action-input');
      await searchInput.fill('langchain');

      // Wait for debounce (250ms) + URL update
      await expect(page).toHaveURL(/\?q=langchain/, { timeout: 5000 });

      // Second search
      await searchInput.fill('vector');
      await expect(page).toHaveURL(/\?q=vector/, { timeout: 5000 });

      // Go back - should restore langchain
      await page.goBack();
      await expect(page).toHaveURL(/\?q=langchain/, { timeout: 5000 });
      await expect(searchInput).toHaveValue('langchain');
    });

    test('browser forward button restores next search', async ({ page }) => {
      await page.goto('/');

      const searchInput = page.locator('#action-input');
      await searchInput.fill('agent');
      await expect(page).toHaveURL(/\?q=agent/, { timeout: 5000 });

      await searchInput.fill('rag');
      await expect(page).toHaveURL(/\?q=rag/, { timeout: 5000 });

      // Go back
      await page.goBack();
      await expect(page).toHaveURL(/\?q=agent/, { timeout: 5000 });

      // Then go forward
      await page.goForward();
      await expect(page).toHaveURL(/\?q=rag/, { timeout: 5000 });
      await expect(searchInput).toHaveValue('rag');
    });

  });

});
