import { test, expect } from '@playwright/test';

test.describe('Admin Review Moderation', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('cookie_consent', 'accepted');
        });
    });

    test.describe('Admin API Functions', () => {

        test('checkIsAdmin returns false for unauthenticated users', async ({ page }) => {
            await page.goto('/admin.html');

            const result = await page.evaluate(async () => {
                // Wait for scripts to load
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!window.AdminAPI) return { error: 'AdminAPI not loaded' };
                return await window.AdminAPI.checkIsAdmin();
            });

            expect(result.isAdmin).toBe(false);
            expect(result.role).toBeNull();
        });

        test('getPendingCount returns a number', async ({ page }) => {
            await page.goto('/admin.html');

            const count = await page.evaluate(async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!window.AdminAPI) return -1;
                return await window.AdminAPI.getPendingCount();
            });

            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThanOrEqual(0);
        });

        test('getReviewsForModeration returns reviews array', async ({ page }) => {
            await page.goto('/admin.html');

            const result = await page.evaluate(async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!window.AdminAPI) return { error: 'AdminAPI not loaded' };
                return await window.AdminAPI.getReviewsForModeration('pending');
            });

            expect(result).toHaveProperty('reviews');
            expect(result).toHaveProperty('total');
            expect(Array.isArray(result.reviews)).toBe(true);
        });
    });
});
