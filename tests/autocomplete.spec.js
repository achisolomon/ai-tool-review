import { test, expect } from '@playwright/test';

test.describe('Search Autocomplete', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test.describe('Browse Mode (Empty Search)', () => {
        test('shows dropdown with categories when focusing empty search', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            // Initially dropdown should be hidden
            await expect(dropdown).toHaveClass(/hidden/);

            // Focus on empty search
            await searchInput.focus();

            // Dropdown should appear with "Browse by Category" header
            await expect(dropdown).not.toHaveClass(/hidden/);
            await expect(dropdown.locator('.autocomplete-section-header')).toContainText('Browse by Category');
        });

        test('shows subcategories sorted by tool count', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/);

            // Should show multiple subcategory items
            const items = dropdown.locator('.autocomplete-item');
            await expect(items).toHaveCount(15); // Limited to 15 items

            // All items should be subcategories in browse mode
            const firstItem = items.first();
            await expect(firstItem.locator('.autocomplete-item-type')).toContainText('subcategory');
        });

        test('hides dropdown when pressing Escape', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/);

            // Press Escape to close
            await page.keyboard.press('Escape');

            // Dropdown should hide
            await expect(dropdown).toHaveClass(/hidden/);
        });
    });

    test.describe('Search Filtering', () => {
        test('filters results as user types', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            // Type to trigger search filtering
            await searchInput.click();
            await searchInput.fill('image');

            // Wait for autocomplete to update
            await page.waitForTimeout(200);
            await expect(dropdown).not.toHaveClass(/hidden/);

            // Should show items matching "image"
            const items = dropdown.locator('.autocomplete-item');
            const count = await items.count();
            expect(count).toBeGreaterThan(0);

            // Check that results contain items with "image" in them
            const allItemsText = await dropdown.textContent();
            expect(allItemsText?.toLowerCase()).toContain('image');
        });

        test('prioritizes categories over subcategories over tools', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            // Search for something that matches both categories and tools
            await searchInput.fill('ai');
            await expect(dropdown).not.toHaveClass(/hidden/);

            // Check section headers appear in correct order
            const headers = dropdown.locator('.autocomplete-section-header');
            const headerTexts = await headers.allTextContents();

            // Categories should come before Subcategories, which should come before Tools
            if (headerTexts.includes('Categories') && headerTexts.includes('Subcategories')) {
                const catIndex = headerTexts.indexOf('Categories');
                const subIndex = headerTexts.indexOf('Subcategories');
                expect(catIndex).toBeLessThan(subIndex);
            }
            if (headerTexts.includes('Subcategories') && headerTexts.includes('Tools')) {
                const subIndex = headerTexts.indexOf('Subcategories');
                const toolIndex = headerTexts.indexOf('Tools');
                expect(subIndex).toBeLessThan(toolIndex);
            }
        });

        test('shows "no results" gracefully when nothing matches', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('xyznonexistent123');

            // Dropdown should be hidden when no results
            await expect(dropdown).toHaveClass(/hidden/);
        });

        test('clears dropdown when search is cleared', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('agent');
            await expect(dropdown).not.toHaveClass(/hidden/);

            await searchInput.fill('');
            // Should show browse mode again when empty
            await expect(dropdown).not.toHaveClass(/hidden/);
            await expect(dropdown.locator('.autocomplete-section-header').first()).toContainText('Browse by Category');
        });
    });

    test.describe('Category/Subcategory Selection', () => {
        test('clicking a subcategory shows all tools in that subcategory', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');
            const searchResults = page.locator('#search-results');

            // Focus to show browse menu
            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/);

            // Click the first subcategory item (browse mode shows all subcategories)
            const subcategoryItem = dropdown.locator('.autocomplete-item').first();
            const subcategoryName = await subcategoryItem.locator('.autocomplete-item-name').textContent();
            await subcategoryItem.click();

            // Search results should appear
            await expect(searchResults).not.toHaveClass(/hidden/);

            // Wait for result cards to appear (handles loading state)
            const resultCards = searchResults.locator('.result-card');
            await expect(resultCards.first()).toBeVisible({ timeout: 5000 });
            const count = await resultCards.count();
            expect(count).toBeGreaterThan(0);

            // Input should be updated with the subcategory name
            const inputValue = await searchInput.inputValue();
            expect(inputValue).toBe(subcategoryName);
        });

        test('clicking a category shows all tools in that category', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');
            const searchResults = page.locator('#search-results');

            await searchInput.fill('generative media');
            await expect(dropdown).not.toHaveClass(/hidden/);

            // Find and click the category item
            const categoryItem = dropdown.locator('.autocomplete-item[data-type="category"]').first();
            if (await categoryItem.count() > 0) {
                await categoryItem.click();

                // Search results should appear
                await expect(searchResults).not.toHaveClass(/hidden/);

                // Should show multiple tools from all subcategories
                const resultCards = searchResults.locator('.result-card');
                const count = await resultCards.count();
                expect(count).toBeGreaterThan(0);
            }
        });

        test('clicking a tool navigates to tool page', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('cursor');
            await expect(dropdown).not.toHaveClass(/hidden/);

            // Find a tool item
            const toolItem = dropdown.locator('.autocomplete-item[data-type="tool"]').first();
            if (await toolItem.count() > 0) {
                await toolItem.click();

                // Should navigate to tool page
                await expect(page).toHaveURL(/\/tools\/.*\//);
            }
        });
    });

    test.describe('Keyboard Navigation', () => {
        test('arrow down selects first item', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/);

            await page.keyboard.press('ArrowDown');

            // First item should be selected
            const selectedItem = dropdown.locator('.autocomplete-item.selected');
            await expect(selectedItem).toHaveCount(1);
        });

        test('arrow up/down cycles through items', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/);

            // Press down twice
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');

            const items = dropdown.locator('.autocomplete-item');
            const secondItem = items.nth(1);
            await expect(secondItem).toHaveClass(/selected/);

            // Press up to go back to first
            await page.keyboard.press('ArrowUp');
            const firstItem = items.first();
            await expect(firstItem).toHaveClass(/selected/);
        });

        test('enter selects highlighted item', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');
            const searchResults = page.locator('#search-results');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/);

            // Select first item with keyboard
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');

            // Should show results (since we selected a subcategory)
            await expect(searchResults).not.toHaveClass(/hidden/);
        });

        test('escape closes dropdown', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/);

            await page.keyboard.press('Escape');
            await expect(dropdown).toHaveClass(/hidden/);
        });

        test('enter without selection triggers regular search', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');
            const searchResults = page.locator('#search-results');

            await searchInput.fill('agent memory');

            // Press enter without selecting from dropdown
            await page.keyboard.press('Enter');

            // Should perform regular search
            await expect(dropdown).toHaveClass(/hidden/);
            await expect(searchResults).not.toHaveClass(/hidden/);
        });
    });

    test.describe('Clear Search', () => {
        test('clear button resets search and hides results', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const searchResults = page.locator('#search-results');
            const clearButton = page.locator('#clear-search');

            // Perform a search first
            await searchInput.fill('agent');
            await page.keyboard.press('Enter');
            await expect(searchResults).not.toHaveClass(/hidden/);

            // Click clear
            await clearButton.click();

            // Input should be empty
            await expect(searchInput).toHaveValue('');

            // Results should be hidden
            await expect(searchResults).toHaveClass(/hidden/);
        });
    });
});
