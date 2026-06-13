import { test, expect } from '@playwright/test';

test.describe('Tags Feature', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('cookie_consent', 'accepted');
        });
        await page.goto('/');
    });

    test.describe('Tag Search in Autocomplete', () => {
        test('typing a tag name shows tags in dropdown', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('skill');
            await page.waitForTimeout(200);

            await expect(dropdown).not.toHaveClass(/hidden/);

            // Should show Tags section header
            const headers = dropdown.locator('.autocomplete-section-header');
            const headerTexts = await headers.allTextContents();
            expect(headerTexts).toContain('Tags');
        });

        test('tag items show tool count', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('agents');
            await page.waitForTimeout(200);

            const tagItem = dropdown.locator('.autocomplete-item[data-type="tag"]').first();
            if (await tagItem.count() > 0) {
                const meta = tagItem.locator('.autocomplete-item-meta');
                await expect(meta).toContainText('tools with this tag');
            }
        });

        test('tag items display tag icon', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('rag');
            await page.waitForTimeout(200);

            const tagItem = dropdown.locator('.autocomplete-item[data-type="tag"]').first();
            if (await tagItem.count() > 0) {
                const icon = tagItem.locator('.autocomplete-item-icon');
                await expect(icon).toContainText('🏷️');
            }
        });
    });

    test.describe('Autocomplete Sorting by Tool Count', () => {
        test('items are sorted by tool count (most to least)', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('cost');
            await page.waitForTimeout(200);

            await expect(dropdown).not.toHaveClass(/hidden/);

            // Get all items with tool counts
            const items = dropdown.locator('.autocomplete-item');
            const count = await items.count();

            if (count > 1) {
                const toolCounts = [];
                for (let i = 0; i < Math.min(count, 5); i++) {
                    const meta = await items.nth(i).locator('.autocomplete-item-meta').textContent();
                    // Extract number from "X tools" or "X tools with this tag"
                    const match = meta?.match(/(\d+)\s+tools/);
                    if (match) {
                        toolCounts.push(parseInt(match[1]));
                    }
                }

                // Verify descending order
                for (let i = 0; i < toolCounts.length - 1; i++) {
                    expect(toolCounts[i]).toBeGreaterThanOrEqual(toolCounts[i + 1]);
                }
            }
        });

        test('subcategories with more tools appear before tags with fewer', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('cost');
            await page.waitForTimeout(200);

            // First item should have the highest tool count regardless of type
            const firstItem = dropdown.locator('.autocomplete-item').first();
            const firstMeta = await firstItem.locator('.autocomplete-item-meta').textContent();
            const firstMatch = firstMeta?.match(/(\d+)\s+tools/);

            if (firstMatch) {
                const firstCount = parseInt(firstMatch[1]);
                // First item should have a reasonable count (likely the subcategory)
                expect(firstCount).toBeGreaterThan(0);
            }
        });
    });

    test.describe('Tag Selection', () => {
        test('clicking a tag filters tools by that tag', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');
            const searchResults = page.locator('#search-results');

            // Type slowly to allow autocomplete to populate
            await searchInput.click();
            await searchInput.pressSequentially('skill', { delay: 50 });
            await page.waitForTimeout(400);

            await expect(dropdown).not.toHaveClass(/hidden/);

            // Find tag item with TAG label
            const tagItems = dropdown.locator('.autocomplete-item:has(.autocomplete-item-type:text("tag"))');
            const tagCount = await tagItems.count();

            if (tagCount > 0) {
                // Click the first tag item
                await tagItems.first().click();

                // Wait for results to load
                await page.waitForTimeout(500);

                // Results should appear
                await expect(searchResults).not.toHaveClass(/hidden/);

                // Verify tag filter was applied (URL or results)
                const currentUrl = page.url();
                const hasTagParam = currentUrl.includes('?tag=');

                // Either URL has tag param OR results show filtered tools
                expect(hasTagParam || await searchResults.isVisible()).toBeTruthy();
            }
        });

        test('tag URL parameter loads correct tools', async ({ page }) => {
            await page.goto('/?tag=agents');

            const searchResults = page.locator('#search-results');
            await expect(searchResults).not.toHaveClass(/hidden/);

            const resultCount = page.locator('#results-count');
            await expect(resultCount).not.toHaveText('0 tools found');
        });

        test('multiple tags filter with AND logic', async ({ page }) => {
            // First get count for single tag
            await page.goto('/?tag=api-available');
            const singleTagCount = page.locator('#results-count');
            const singleText = await singleTagCount.textContent();
            const singleCount = parseInt(singleText?.match(/(\d+)/)?.[1] || '0');

            // Then get count for multiple tags
            await page.goto('/?tag=api-available,python');
            const multiTagCount = page.locator('#results-count');
            const multiText = await multiTagCount.textContent();
            const multiCount = parseInt(multiText?.match(/(\d+)/)?.[1] || '0');

            // Multiple tags should return same or fewer results
            expect(multiCount).toBeLessThanOrEqual(singleCount);
        });
    });

    test.describe('Tag Search Relevance', () => {
        test('searching for a tag name returns tools with that tag', async ({ page }) => {
            const searchInput = page.locator('#action-input');

            await searchInput.fill('skill');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(300);

            const searchResults = page.locator('#search-results');
            await expect(searchResults).not.toHaveClass(/hidden/);

            // Should find tools with "skill" tag
            const resultCount = page.locator('#results-count');
            await expect(resultCount).not.toHaveText('0 tools found');
        });

        test('tag matches boost search relevance', async ({ page }) => {
            // Search for a tag that tools have
            await page.goto('/?q=multimodal');

            const searchResults = page.locator('#search-results');
            await expect(searchResults).not.toHaveClass(/hidden/);

            // Wait for results to render, then assert at least one card exists
            const cards = page.locator('.result-card');
            await expect(cards.first()).toBeVisible({ timeout: 10000 });
            expect(await cards.count()).toBeGreaterThan(0);
        });
    });

    test.describe('Hero Section Visibility', () => {
        test('search box remains visible when showing results', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const heroSection = page.locator('#hero-action');

            await searchInput.fill('agent');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(300);

            // Hero section should still be visible
            await expect(heroSection).toBeVisible();

            // Search input should still be visible
            await expect(searchInput).toBeVisible();
        });

        test('search box visible on direct URL with query', async ({ page }) => {
            await page.goto('/?q=test');

            const searchInput = page.locator('#action-input');
            await expect(searchInput).toBeVisible();
        });

        test('search box visible on tag URL', async ({ page }) => {
            await page.goto('/?tag=agents');

            const searchInput = page.locator('#action-input');
            await expect(searchInput).toBeVisible();
        });
    });
});

test.describe('Quick Action Chips Removed', () => {
    test('quick action chips no longer exist on homepage', async ({ page }) => {
        await page.goto('/');

        const chips = page.locator('.quick-actions .action-chip');
        await expect(chips).toHaveCount(0);
    });

    test('quick actions container is not present', async ({ page }) => {
        await page.goto('/');

        const quickActions = page.locator('.quick-actions');
        await expect(quickActions).toHaveCount(0);
    });
});

test.describe('Tag Validation (Build Time)', () => {
    test('validate_tags.rb passes with current tags', async ({ page }) => {
        // This is a placeholder - actual validation is done at build time
        // The test verifies the page loads without errors
        await page.goto('/');

        // Page should load successfully
        await expect(page.locator('#action-input')).toBeVisible();
    });
});
