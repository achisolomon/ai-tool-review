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

        test('admin page shows login required for unauthenticated users', async ({ page }) => {
            await page.goto('/admin.html');

            // Wait for auth check to complete
            await page.waitForSelector('#login-required:not(.hidden), #access-denied:not(.hidden), #admin-main:not(.hidden)', { timeout: 5000 });

            // Should show login required (not logged in)
            const loginRequired = page.locator('#login-required');
            await expect(loginRequired).toBeVisible();
        });

        test('login required state has GitHub login button', async ({ page }) => {
            await page.goto('/admin.html');

            await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

            // Admin uses the shared AuthSignIn module (.auth-provider-btn), not the
            // old hardcoded #github-login-btn.
            const githubBtn = page.locator('.auth-provider-btn[data-provider="github"]');
            await expect(githubBtn).toBeVisible();
            await expect(githubBtn).toContainText('Continue with GitHub');
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

        test('admin page has clickable stat cards', async ({ page }) => {
            await page.goto('/admin.html');

            // Stat cards should exist with data-status attributes
            const pendingStat = page.locator('.stat-item[data-status="pending"]');
            const approvedStat = page.locator('.stat-item[data-status="approved"]');
            const rejectedStat = page.locator('.stat-item[data-status="rejected"]');

            await expect(pendingStat).toHaveCount(1);
            await expect(approvedStat).toHaveCount(1);
            await expect(rejectedStat).toHaveCount(1);

            // Pending stat should be active by default
            await expect(pendingStat).toHaveClass(/active/);
        });

        test('stat cards have cursor pointer style', async ({ page }) => {
            await page.goto('/admin.html');

            const statItem = page.locator('.stat-item').first();
            const cursor = await statItem.evaluate(el => getComputedStyle(el).cursor);
            expect(cursor).toBe('pointer');
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

    test.describe('Admin Badge on Main Site', () => {

        test('admin badge is hidden for non-admin users on index', async ({ page }) => {
            await page.goto('/');

            // Wait for page to load
            await page.waitForSelector('.header', { timeout: 5000 });

            const adminBadge = page.locator('#admin-badge');
            // Should either not exist or be hidden
            const count = await adminBadge.count();
            if (count > 0) {
                await expect(adminBadge).toHaveClass(/hidden/);
            }
        });

        test('admin badge is hidden for non-admin users on landscape', async ({ page }) => {
            await page.goto('/landscape.html');

            await page.waitForSelector('.header', { timeout: 5000 });

            const adminBadge = page.locator('#admin-badge');
            const count = await adminBadge.count();
            if (count > 0) {
                await expect(adminBadge).toHaveClass(/hidden/);
            }
        });

        test('admin badge links to admin.html', async ({ page }) => {
            await page.goto('/');

            const adminBadge = page.locator('#admin-badge');
            const count = await adminBadge.count();
            if (count > 0) {
                const href = await adminBadge.getAttribute('href');
                expect(href).toBe('admin.html');
            }
        });
    });
