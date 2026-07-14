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
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });
            await expect(dropdown.locator('.autocomplete-section-header')).toContainText('Browse by Category', { timeout: 10000 });
        });

        test('shows subcategories sorted by tool count', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            // Should show multiple subcategory items
            const items = dropdown.locator('.autocomplete-item');
            await expect(items).toHaveCount(15, { timeout: 10000 }); // Limited to 15 items

            // All items should be subcategories in browse mode
            const firstItem = items.first();
            await expect(firstItem.locator('.autocomplete-item-type')).toContainText('subcategory', { timeout: 10000 });
        });

        test('hides dropdown when pressing Escape', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            // Press Escape to close
            await page.keyboard.press('Escape');

            // Dropdown should hide
            await expect(dropdown).toHaveClass(/hidden/, { timeout: 10000 });
        });
    });

    test.describe('Search Filtering', () => {
        test('filters results as user types', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            // Type to trigger search filtering
            await searchInput.click();
            await searchInput.fill('image');

            // Wait for autocomplete to update (poll instead of fixed sleep)
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

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
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

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
            await expect(dropdown).toHaveClass(/hidden/, { timeout: 10000 });
        });

        test('clears dropdown when search is cleared', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('agent');
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            await searchInput.fill('');
            // Should show browse mode again when empty
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });
            await expect(dropdown.locator('.autocomplete-section-header').first()).toContainText('Browse by Category', { timeout: 10000 });
        });
    });

    test.describe('Category/Subcategory Selection', () => {
        test('clicking a subcategory shows all tools in that subcategory', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');
            const searchResults = page.locator('#search-results');

            // Focus to show browse menu
            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

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
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

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
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            // Find a tool item
            const toolItem = dropdown.locator('.autocomplete-item[data-type="tool"]').first();
            if (await toolItem.count() > 0) {
                await toolItem.click();

                // Should navigate to tool page
                await expect(page).toHaveURL(/\/tools\/.*\//);
            }
        });

        test('shows a review button on tool rows but not category/subcategory rows', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('cursor');
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            const toolItem = dropdown.locator('.autocomplete-item[data-type="tool"]').first();
            if (await toolItem.count() > 0) {
                await expect(toolItem.locator('.review-quick-btn')).toBeVisible();
            }

            const nonToolItem = dropdown.locator('.autocomplete-item:not([data-type="tool"])').first();
            if (await nonToolItem.count() > 0) {
                await expect(nonToolItem.locator('.review-quick-btn')).toHaveCount(0);
            }
        });

        test('clicking the review button navigates to the tool page with ?review=1', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('cursor');
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            const reviewBtn = dropdown.locator('.review-quick-btn').first();
            if (await reviewBtn.count() > 0) {
                await reviewBtn.click();
                await expect(page).toHaveURL(/\/tools\/.*\/\?review=1/);
            }
        });

        test('full flow: search, click review button, lands on tool page with review flow open', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('claude code');
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            const toolItem = dropdown.locator('.autocomplete-item[data-type="tool"]').first();
            if (await toolItem.count() > 0) {
                await toolItem.locator('.review-quick-btn').click();

                await expect(page).toHaveURL(/\/tools\/claude-code\//);

                const authModal = page.locator('#auth-modal');
                await expect(authModal).toHaveClass(/active/, { timeout: 10000 });
            }
        });
    });

    test.describe('Keyboard Navigation', () => {
        test('arrow down selects first item', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            await page.keyboard.press('ArrowDown');

            // First item should be selected
            const selectedItem = dropdown.locator('.autocomplete-item.selected');
            await expect(selectedItem).toHaveCount(1, { timeout: 10000 });
        });

        test('arrow up/down cycles through items', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            // Press down twice
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');

            const items = dropdown.locator('.autocomplete-item');
            const secondItem = items.nth(1);
            await expect(secondItem).toHaveClass(/selected/, { timeout: 10000 });

            // Press up to go back to first
            await page.keyboard.press('ArrowUp');
            const firstItem = items.first();
            await expect(firstItem).toHaveClass(/selected/, { timeout: 10000 });
        });

        test('enter selects highlighted item', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');
            const searchResults = page.locator('#search-results');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            // Select first item with keyboard
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');

            // Should show results (since we selected a subcategory)
            await expect(searchResults).not.toHaveClass(/hidden/, { timeout: 10000 });
        });

        test('escape closes dropdown', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.focus();
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            await page.keyboard.press('Escape');
            await expect(dropdown).toHaveClass(/hidden/, { timeout: 10000 });
        });

        test('enter without selection triggers regular search', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');
            const searchResults = page.locator('#search-results');

            await searchInput.fill('agent memory');

            // Press enter without selecting from dropdown
            await page.keyboard.press('Enter');

            // Should perform regular search
            await expect(dropdown).toHaveClass(/hidden/, { timeout: 10000 });
            await expect(searchResults).not.toHaveClass(/hidden/, { timeout: 10000 });
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
            // Wait for results to actually appear
            await expect(page.locator('.result-card').first()).toBeVisible({ timeout: 10000 });
            await expect(searchResults).not.toHaveClass(/hidden/);

            // UX redesign removed visible clear button; use Escape to clear instead
            await searchInput.press('Escape');

            // Input should be empty
            await expect(searchInput).toHaveValue('');

            // Results should be hidden
            await expect(searchResults).toHaveClass(/hidden/, { timeout: 10000 });
        });
    });
});
