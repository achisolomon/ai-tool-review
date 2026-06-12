import { test, expect } from '@playwright/test';

test.describe('Search Page', () => {

  test.beforeEach(async ({ page }) => {
    // Accept cookies to avoid banner interference
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });
    await page.goto('/');
  });

  test.describe('Basic UI Elements', () => {

    test('search input is visible and focusable', async ({ page }) => {
      const searchInput = page.locator('#action-input');
      await expect(searchInput).toBeVisible();
      await searchInput.focus();
      await expect(searchInput).toBeFocused();
    });

    test('browse link is visible', async ({ page }) => {
      const browseLink = page.locator('.browse-toggle');
      await expect(browseLink).toBeVisible();
      await expect(browseLink).toHaveAttribute('href', 'landscape.html');
    });

    test('search results are hidden by default', async ({ page }) => {
      const results = page.locator('#search-results');
      await expect(results).toHaveClass(/hidden/);
    });
  });

  test.describe('Search Functionality', () => {

    test('typing in search shows results', async ({ page }) => {
      const searchInput = page.locator('#action-input');
      await searchInput.fill('llm observability');

      // Wait for debounce and results to appear
      await page.waitForTimeout(300);

      const results = page.locator('#search-results');
      await expect(results).not.toHaveClass(/hidden/);

      const resultCount = page.locator('#results-count');
      await expect(resultCount).not.toHaveText('0 tools found');
    });

    test('search results contain tool cards', async ({ page }) => {
      await page.locator('#action-input').fill('observability');
      const cards = page.locator('.result-card');
      await expect(cards.first()).toBeVisible({ timeout: 10000 });
      expect(await cards.count()).toBeGreaterThan(0);
    });

    test('empty search hides results', async ({ page }) => {
      const searchInput = page.locator('#action-input');
      await searchInput.fill('test');
      await page.waitForTimeout(300);

      await searchInput.fill('');
      await page.waitForTimeout(300);

      const results = page.locator('#search-results');
      await expect(results).toHaveClass(/hidden/);
    });

    test('clear button resets search', async ({ page }) => {
      const searchInput = page.locator('#action-input');
      await searchInput.fill('agent');
      await page.waitForTimeout(300);

      await page.locator('#clear-search').click();

      await expect(searchInput).toHaveValue('');
      const results = page.locator('#search-results');
      await expect(results).toHaveClass(/hidden/);
    });
  });


  test.describe('Result Card Rendering', () => {

    test('tool cards display name correctly (not raw HTML)', async ({ page }) => {
      await page.locator('#action-input').fill('observability');
      await page.waitForTimeout(300);

      const cards = page.locator('.result-card');
      const firstCard = cards.first();

      // Get the tool name
      const nameElement = firstCard.locator('.result-name');
      const name = await nameElement.textContent();

      // Name should not contain HTML data attributes
      expect(name).not.toContain('data-type=');
      expect(name).not.toContain('data-track=');
      expect(name).not.toContain('data-category=');

      // Name should be a reasonable tool name (non-empty, doesn't start with special chars)
      expect(name.trim().length).toBeGreaterThan(0);
      expect(name.trim()).not.toMatch(/^[<"]/);
    });

    test('tool cards display description correctly (not HTML markup)', async ({ page }) => {
      await page.locator('#action-input').fill('langchain');
      await page.waitForTimeout(300);

      const cards = page.locator('.result-card');
      const firstCard = cards.first();

      const descElement = firstCard.locator('.result-desc');
      const desc = await descElement.textContent();

      // Description should not contain HTML tags
      expect(desc).not.toContain('<div');
      expect(desc).not.toContain('<span');
      expect(desc).not.toContain('class=');
      expect(desc).not.toContain('key-stats');
    });

    test('tool cards have valid data attributes', async ({ page }) => {
      await page.locator('#action-input').fill('vector database');
      await page.waitForTimeout(300);

      const cards = page.locator('.result-card');
      const firstCard = cards.first();

      // Check required data attributes exist and are valid
      const url = await firstCard.getAttribute('data-url');
      const name = await firstCard.getAttribute('data-name');
      const type = await firstCard.getAttribute('data-type');

      expect(url).toBeTruthy();
      expect(url).toMatch(/^https?:\/\//);
      expect(name).toBeTruthy();
      expect(type).toMatch(/^(oss|saas|commercial)$/);
    });

    test('no result cards show broken HTML as content', async ({ page }) => {
      // Search for something that returns multiple results
      await page.locator('#action-input').fill('ai');
      await page.waitForTimeout(300);

      const cards = page.locator('.result-card');
      const count = await cards.count();

      // Check each visible card (up to first 10)
      const checkCount = Math.min(count, 10);
      for (let i = 0; i < checkCount; i++) {
        const card = cards.nth(i);
        const nameText = await card.locator('.result-name').textContent();
        const descText = await card.locator('.result-desc').textContent();

        // Neither should contain raw HTML attribute patterns
        expect(nameText).not.toMatch(/data-\w+=/);
        expect(descText).not.toMatch(/<\w+\s/);
      }
    });
  });

  test.describe('Tool Card Click Behavior', () => {

    test('clicking card navigates to internal tool page', async ({ page }) => {
      await page.locator('#action-input').fill('claude');
      await page.waitForTimeout(300);

      const cards = page.locator('.result-card');
      const firstCard = cards.first();
      const slug = await firstCard.getAttribute('data-slug');

      await firstCard.click();

      // Should navigate to internal tool page
      await expect(page).toHaveURL(new RegExp(`/tools/${slug}/?`));
    });
  });

  test.describe('Keyboard Navigation', () => {

    test('pressing / focuses search input', async ({ page }) => {
      // Wait for page to be fully loaded
      await page.waitForLoadState('domcontentloaded');

      // Click on the hero title to ensure input is not focused
      await page.locator('.hero-title').click();
      await page.waitForTimeout(100);

      await page.keyboard.press('/');
      await page.waitForTimeout(100);

      const searchInput = page.locator('#action-input');
      await expect(searchInput).toBeFocused();
    });

    test('pressing Escape clears search and hides results', async ({ page }) => {
      const searchInput = page.locator('#action-input');
      await searchInput.fill('test');
      await page.waitForTimeout(300);

      await page.keyboard.press('Escape');

      await expect(searchInput).toHaveValue('');
      const results = page.locator('#search-results');
      await expect(results).toHaveClass(/hidden/);
    });
  });
});

test.describe('Data Integrity', () => {

  test('data.js loads and landscapeData is available', async ({ page }) => {
    // Accept cookies to avoid banner interference
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });

    await page.goto('/');

    // Check that landscapeData is defined and has expected structure
    const dataCheck = await page.evaluate(() => {
      if (typeof landscapeData === 'undefined') {
        return { error: 'landscapeData is undefined' };
      }
      if (!landscapeData.users || !Array.isArray(landscapeData.users)) {
        return { error: 'landscapeData.users is missing or not an array' };
      }
      if (!landscapeData.developers || !Array.isArray(landscapeData.developers)) {
        return { error: 'landscapeData.developers is missing or not an array' };
      }
      return {
        success: true,
        userCategories: landscapeData.users.length,
        devCategories: landscapeData.developers.length
      };
    });

    expect(dataCheck.error).toBeUndefined();
    expect(dataCheck.success).toBe(true);
    expect(dataCheck.userCategories).toBeGreaterThan(0);
    expect(dataCheck.devCategories).toBeGreaterThan(0);
  });

  test('all tools have required fields', async ({ page }) => {
    await page.goto('/');

    const invalidTools = await page.evaluate(() => {
      const invalid = [];
      ['users', 'developers'].forEach(track => {
        landscapeData[track].forEach(category => {
          category.subcategories.forEach(subcategory => {
            subcategory.tools.forEach(tool => {
              if (!tool.name || !tool.url || !tool.type) {
                invalid.push(tool);
              }
            });
          });
        });
      });
      return invalid;
    });

    expect(invalidTools).toHaveLength(0);
  });

  test('no tool descriptions contain HTML markup', async ({ page }) => {
    await page.goto('/');

    const toolsWithHtmlDesc = await page.evaluate(() => {
      const badTools = [];
      ['users', 'developers'].forEach(track => {
        landscapeData[track].forEach(category => {
          category.subcategories.forEach(subcategory => {
            subcategory.tools.forEach(tool => {
              if (tool.desc && (tool.desc.includes('<div') || tool.desc.includes('<span'))) {
                badTools.push({ name: tool.name, desc: tool.desc.substring(0, 50) });
              }
            });
          });
        });
      });
      return badTools;
    });

    expect(toolsWithHtmlDesc).toHaveLength(0);
  });
});
