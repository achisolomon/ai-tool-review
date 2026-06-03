import { test, expect } from '@playwright/test';

test.describe('Landscape Page', () => {

  test.beforeEach(async ({ page }) => {
    // Accept cookies to avoid banner interference
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });
    await page.goto('/landscape.html');
  });

  test.describe('Data Loading', () => {

    test('landscapeData is defined and has correct structure', async ({ page }) => {
      const dataCheck = await page.evaluate(() => {
        if (typeof landscapeData === 'undefined') {
          return { error: 'landscapeData is undefined - data.js may be malformed' };
        }
        if (!landscapeData.users || !Array.isArray(landscapeData.users)) {
          return { error: 'landscapeData.users is missing or not an array' };
        }
        if (!landscapeData.developers || !Array.isArray(landscapeData.developers)) {
          return { error: 'landscapeData.developers is missing or not an array' };
        }

        // Count total tools
        let totalTools = 0;
        ['users', 'developers'].forEach(track => {
          landscapeData[track].forEach(category => {
            category.subcategories.forEach(sub => {
              totalTools += sub.tools.length;
            });
          });
        });

        return {
          success: true,
          userCategories: landscapeData.users.length,
          devCategories: landscapeData.developers.length,
          totalTools
        };
      });

      expect(dataCheck.error).toBeUndefined();
      expect(dataCheck.success).toBe(true);
      expect(dataCheck.userCategories).toBeGreaterThan(0);
      expect(dataCheck.devCategories).toBeGreaterThan(0);
      expect(dataCheck.totalTools).toBeGreaterThan(100); // Should have many tools
    });

    test('tools are rendered on the page', async ({ page }) => {
      // Wait for landscape to render
      await page.waitForSelector('.tool-card', { timeout: 5000 });

      const toolCards = page.locator('.tool-card');
      const count = await toolCards.count();

      // Should have many tool cards visible
      expect(count).toBeGreaterThan(50);
    });

    test('tool count matches displayed stats', async ({ page }) => {
      // Wait for landscape to render
      await page.waitForSelector('.tool-card', { timeout: 5000 });

      const visibleCount = await page.locator('#visible-count').textContent();
      const toolCards = await page.locator('.tool-card').count();

      // Stats should match actual rendered cards
      expect(parseInt(visibleCount)).toBe(toolCards);
      expect(parseInt(visibleCount)).toBeGreaterThan(0);
    });

    test('category count is greater than zero', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      const categoryCount = await page.locator('#category-count').textContent();
      const categories = await page.locator('.category').count();

      expect(parseInt(categoryCount)).toBeGreaterThan(0);
      expect(categories).toBeGreaterThan(0);
    });
  });

  test.describe('UI Controls', () => {

    test('track filter buttons work', async ({ page }) => {
      await page.waitForSelector('.tool-card', { timeout: 5000 });

      const initialCount = await page.locator('.tool-card').count();

      // Click "For Users" filter
      await page.click('[data-track="users"]');
      await page.waitForTimeout(100);

      const usersCount = await page.locator('.tool-card').count();
      expect(usersCount).toBeGreaterThan(0);
      expect(usersCount).toBeLessThanOrEqual(initialCount);

      // Click "For Developers" filter
      await page.click('[data-track="developers"]');
      await page.waitForTimeout(100);

      const devsCount = await page.locator('.tool-card').count();
      expect(devsCount).toBeGreaterThan(0);

      // Click "All Tools" to restore
      await page.click('[data-track="all"]');
      await page.waitForTimeout(100);

      const allCount = await page.locator('.tool-card').count();
      expect(allCount).toBe(initialCount);
    });

    test('type filter buttons work', async ({ page }) => {
      await page.waitForSelector('.tool-card', { timeout: 5000 });

      const initialCount = await page.locator('.tool-card').count();

      // Click OSS filter
      await page.click('[data-type="oss"]');
      await page.waitForTimeout(100);

      const ossCount = await page.locator('.tool-card').count();
      expect(ossCount).toBeGreaterThan(0);
      expect(ossCount).toBeLessThan(initialCount);

      // Click All to restore
      await page.click('[data-type="all"]');
      await page.waitForTimeout(100);

      const allCount = await page.locator('.tool-card').count();
      expect(allCount).toBe(initialCount);
    });
  });

  test.describe('Tool Cards', () => {

    test('tool cards have required data attributes', async ({ page }) => {
      await page.waitForSelector('.tool-card', { timeout: 5000 });

      const firstCard = page.locator('.tool-card').first();

      const name = await firstCard.getAttribute('data-name');
      const url = await firstCard.getAttribute('data-url');
      const type = await firstCard.getAttribute('data-type');

      expect(name).toBeTruthy();
      expect(url).toMatch(/^https?:\/\//);
      expect(type).toMatch(/^(oss|saas|commercial)$/);
    });

    test('clicking tool card navigates to tool page', async ({ page }) => {
      await page.waitForSelector('.tool-card', { timeout: 5000 });

      const firstCard = page.locator('.tool-card').first();
      const slug = await firstCard.getAttribute('data-slug');

      await firstCard.click();

      // Should navigate to internal tool page
      await expect(page).toHaveURL(new RegExp(`/tools/.+/?`));
    });
  });
});

test.describe('Data File Integrity', () => {

  test('data.js file has valid JavaScript structure', async ({ page }) => {
    // Fetch the raw data.js file content
    const response = await page.request.get('/js/data.js');
    const content = await response.text();

    // Must start with variable declaration
    expect(content.trimStart()).toMatch(/^\/\/.*\n|^const landscapeData\s*=/);
    expect(content).toContain('const landscapeData');

    // Must end with semicolon (valid JS statement)
    expect(content.trimEnd()).toMatch(/;\s*$/);

    // Must not be raw JSON (which would start with {)
    expect(content.trimStart().charAt(0)).not.toBe('{');
  });

  test('data.js contains expected data arrays', async ({ page }) => {
    const response = await page.request.get('/js/data.js');
    const content = await response.text();

    // Must contain both tracks
    expect(content).toContain('"users"');
    expect(content).toContain('"developers"');

    // Must contain tool structure
    expect(content).toContain('"subcategories"');
    expect(content).toContain('"tools"');
  });
});
