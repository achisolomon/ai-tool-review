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

  test.describe('View Toggle (3-State)', () => {

    test('view toggle buttons exist with correct labels', async ({ page }) => {
      await page.waitForSelector('.view-toggle', { timeout: 5000 });

      const categoriesBtn = page.locator('[data-view="categories"]');
      const subcategoriesBtn = page.locator('[data-view="subcategories"]');
      const expandedBtn = page.locator('[data-view="all"]');

      await expect(categoriesBtn).toBeVisible();
      await expect(subcategoriesBtn).toBeVisible();
      await expect(expandedBtn).toBeVisible();

      await expect(categoriesBtn).toHaveText('Categories');
      await expect(subcategoriesBtn).toHaveText('Subcategories');
      await expect(expandedBtn).toHaveText('Expanded');
    });

    test('subcategories view is default (active on page load)', async ({ page }) => {
      await page.waitForSelector('.view-toggle', { timeout: 5000 });

      const subcategoriesBtn = page.locator('[data-view="subcategories"]');
      await expect(subcategoriesBtn).toHaveClass(/active/);

      // Landscape should have view-subcategories class
      const landscape = page.locator('#landscape');
      await expect(landscape).toHaveClass(/view-subcategories/);
    });

    test('categories view collapses everything', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Switch to categories view
      await page.click('[data-view="categories"]');
      await page.waitForTimeout(100);

      // Button should be active
      const categoriesBtn = page.locator('[data-view="categories"]');
      await expect(categoriesBtn).toHaveClass(/active/);

      // Landscape should have view-categories class
      const landscape = page.locator('#landscape');
      await expect(landscape).toHaveClass(/view-categories/);

      // All categories should be collapsed
      const categories = page.locator('.category');
      const count = await categories.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(count, 5); i++) {
        await expect(categories.nth(i)).toHaveClass(/collapsed/);
      }

      // Subcategory content should not be visible
      const subcategoryContent = page.locator('.subcategory-content').first();
      await expect(subcategoryContent).not.toBeVisible();
    });

    test('subcategories view shows categories expanded, subcategories collapsed', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // First switch to a different view, then back to subcategories
      await page.click('[data-view="categories"]');
      await page.waitForTimeout(100);
      await page.click('[data-view="subcategories"]');
      await page.waitForTimeout(100);

      // Landscape should have view-subcategories class
      const landscape = page.locator('#landscape');
      await expect(landscape).toHaveClass(/view-subcategories/);

      // Categories should NOT be collapsed
      const categories = page.locator('.category');
      const catCount = await categories.count();
      for (let i = 0; i < Math.min(catCount, 3); i++) {
        await expect(categories.nth(i)).not.toHaveClass(/collapsed/);
      }

      // Subcategories should be collapsed
      const subcategories = page.locator('.subcategory');
      const subCount = await subcategories.count();
      expect(subCount).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(subCount, 5); i++) {
        await expect(subcategories.nth(i)).toHaveClass(/collapsed/);
      }
    });

    test('expanded view shows everything with CSS columns layout', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Switch to expanded view
      await page.click('[data-view="all"]');
      await page.waitForTimeout(100);

      // Button should be active
      const expandedBtn = page.locator('[data-view="all"]');
      await expect(expandedBtn).toHaveClass(/active/);

      // Landscape should have view-all class
      const landscape = page.locator('#landscape');
      await expect(landscape).toHaveClass(/view-all/);

      // Categories should NOT be collapsed
      const categories = page.locator('.category');
      const catCount = await categories.count();
      for (let i = 0; i < Math.min(catCount, 3); i++) {
        await expect(categories.nth(i)).not.toHaveClass(/collapsed/);
      }

      // Subcategories should NOT be collapsed
      const subcategories = page.locator('.subcategory');
      const subCount = await subcategories.count();
      for (let i = 0; i < Math.min(subCount, 5); i++) {
        await expect(subcategories.nth(i)).not.toHaveClass(/collapsed/);
      }

      // Tool cards should be visible
      const toolCards = page.locator('.tool-card');
      const cardCount = await toolCards.count();
      expect(cardCount).toBeGreaterThan(50);
    });

    test('expanded view uses CSS columns (not grid)', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Switch to expanded view
      await page.click('[data-view="all"]');
      await page.waitForTimeout(100);

      // Check that landscape has block display (CSS columns)
      const displayStyle = await page.locator('#landscape').evaluate(el =>
        window.getComputedStyle(el).display
      );
      expect(displayStyle).toBe('block');

      // Check column-count is set
      const columnCount = await page.locator('#landscape').evaluate(el =>
        window.getComputedStyle(el).columnCount
      );
      expect(parseInt(columnCount)).toBeGreaterThanOrEqual(2);
    });

    test('categories/subcategories views use CSS grid (not columns)', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Check subcategories view (default)
      const displayStyle = await page.locator('#landscape').evaluate(el =>
        window.getComputedStyle(el).display
      );
      expect(displayStyle).toBe('grid');

      // Switch to categories view
      await page.click('[data-view="categories"]');
      await page.waitForTimeout(100);

      const catDisplayStyle = await page.locator('#landscape').evaluate(el =>
        window.getComputedStyle(el).display
      );
      expect(catDisplayStyle).toBe('grid');
    });

    test('view state persists after track filter change', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Switch to expanded view
      await page.click('[data-view="all"]');
      await page.waitForTimeout(100);

      // Change track filter
      await page.click('[data-track="users"]');
      await page.waitForTimeout(100);

      // Expanded view should still be active
      const expandedBtn = page.locator('[data-view="all"]');
      await expect(expandedBtn).toHaveClass(/active/);

      // Landscape should still have view-all class
      const landscape = page.locator('#landscape');
      await expect(landscape).toHaveClass(/view-all/);

      // Subcategories should still be expanded
      const subcategories = page.locator('.subcategory');
      const subCount = await subcategories.count();
      if (subCount > 0) {
        await expect(subcategories.first()).not.toHaveClass(/collapsed/);
      }
    });

    test('view state persists after type filter change', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Switch to categories view
      await page.click('[data-view="categories"]');
      await page.waitForTimeout(100);

      // Change type filter
      await page.click('[data-type="oss"]');
      await page.waitForTimeout(100);

      // Categories view should still be active
      const categoriesBtn = page.locator('[data-view="categories"]');
      await expect(categoriesBtn).toHaveClass(/active/);

      // Landscape should still have view-categories class
      const landscape = page.locator('#landscape');
      await expect(landscape).toHaveClass(/view-categories/);
    });

    test('collapse toggles hidden in expanded view', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Switch to expanded view
      await page.click('[data-view="all"]');
      await page.waitForTimeout(100);

      // Category toggle arrows should be hidden
      const categoryToggle = page.locator('.category-toggle').first();
      await expect(categoryToggle).not.toBeVisible();

      // Subcategory toggle arrows should be hidden
      const subcategoryToggle = page.locator('.subcategory-toggle').first();
      await expect(subcategoryToggle).not.toBeVisible();
    });

    test('collapse toggles visible in subcategories view', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Subcategories view is default
      // Category toggle arrows should be visible
      const categoryToggle = page.locator('.category-toggle').first();
      await expect(categoryToggle).toBeVisible();

      // Subcategory toggle arrows should be visible
      const subcategoryToggle = page.locator('.subcategory-toggle').first();
      await expect(subcategoryToggle).toBeVisible();
    });

    test('manual collapse/expand works in subcategories view', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Click on a subcategory header to expand it
      const subcategoryHeader = page.locator('.subcategory-header').first();
      await subcategoryHeader.click();
      await page.waitForTimeout(100);

      // Subcategory should now be expanded (no collapsed class)
      const subcategory = page.locator('.subcategory').first();
      await expect(subcategory).not.toHaveClass(/collapsed/);

      // Click again to collapse
      await subcategoryHeader.click();
      await page.waitForTimeout(100);

      // Subcategory should be collapsed again
      await expect(subcategory).toHaveClass(/collapsed/);
    });

    test('manual collapse/expand works in categories view', async ({ page }) => {
      await page.waitForSelector('.category', { timeout: 5000 });

      // Switch to categories view
      await page.click('[data-view="categories"]');
      await page.waitForTimeout(100);

      // Click on a category header to expand it
      const categoryHeader = page.locator('.category-header').first();
      await categoryHeader.click();
      await page.waitForTimeout(100);

      // Category should now be expanded
      const category = page.locator('.category').first();
      await expect(category).not.toHaveClass(/collapsed/);

      // Click again to collapse
      await categoryHeader.click();
      await page.waitForTimeout(100);

      // Category should be collapsed again
      await expect(category).toHaveClass(/collapsed/);
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

      // Switch to expanded view where all tools are visible and clickable
      await page.click('[data-view="all"]');
      await page.waitForTimeout(200);

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
