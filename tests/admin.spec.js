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

    test.describe('Admin Page UI', () => {

        test('admin page shows access denied for non-admin users', async ({ page }) => {
            await page.goto('/admin.html');

            // Wait for auth check to complete
            await page.waitForSelector('#access-denied:not(.hidden), #admin-main:not(.hidden)', { timeout: 5000 });

            // Should show access denied (not logged in)
            const accessDenied = page.locator('#access-denied');
            await expect(accessDenied).toBeVisible();
        });

        test('admin page has status tabs', async ({ page }) => {
            await page.goto('/admin.html');

            // Tabs should exist even if hidden behind access check
            const pendingTab = page.locator('.status-tab[data-status="pending"]');
            const approvedTab = page.locator('.status-tab[data-status="approved"]');
            const rejectedTab = page.locator('.status-tab[data-status="rejected"]');

            await expect(pendingTab).toHaveCount(1);
            await expect(approvedTab).toHaveCount(1);
            await expect(rejectedTab).toHaveCount(1);
        });

        test('admin page has delete confirmation modal', async ({ page }) => {
            await page.goto('/admin.html');

            const deleteModal = page.locator('#delete-modal');
            await expect(deleteModal).toHaveCount(1);
            await expect(deleteModal).toHaveClass(/hidden/);
        });

        test('admin page has logout button', async ({ page }) => {
            await page.goto('/admin.html');

            const logoutBtn = page.locator('#logout-btn');
            await expect(logoutBtn).toHaveCount(1);
        });
    });
