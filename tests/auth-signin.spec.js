import { test, expect } from '@playwright/test';

test.describe('Auth Sign-In Module', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('cookie_consent', 'accepted');
        });
    });

    test.describe('Shared Auth Module on Admin Page', () => {

        test('admin page loads AuthSignIn module', async ({ page }) => {
            await page.goto('/admin.html');

            const hasAuthSignIn = await page.evaluate(async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return typeof window.AuthSignIn !== 'undefined' &&
                       typeof window.AuthSignIn.renderCard === 'function' &&
                       typeof window.AuthSignIn.initHandlers === 'function';
            });

            expect(hasAuthSignIn).toBe(true);
        });

        test('admin page has GitHub login button via shared module', async ({ page }) => {
            await page.goto('/admin.html');

            await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

            const githubBtn = page.locator('.auth-provider-btn[data-provider="github"]');
            await expect(githubBtn).toBeVisible();
            await expect(githubBtn).toContainText('Continue with GitHub');
        });

        test('admin page has Google login button via shared module', async ({ page }) => {
            await page.goto('/admin.html');

            await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

            const googleBtn = page.locator('.auth-provider-btn[data-provider="google"]');
            await expect(googleBtn).toBeVisible();
            await expect(googleBtn).toContainText('Continue with Google');
        });

        test('admin page has both auth buttons in correct container', async ({ page }) => {
            await page.goto('/admin.html');

            await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

            const container = page.locator('.auth-signin-buttons');
            await expect(container).toBeVisible();

            const buttons = container.locator('.auth-provider-btn');
            await expect(buttons).toHaveCount(2);
        });
    });

    test.describe('Shared Auth Module on My Reviews Page', () => {

        test('my-reviews page loads AuthSignIn module', async ({ page }) => {
            await page.goto('/my-reviews.html');

            const hasAuthSignIn = await page.evaluate(async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                return typeof window.AuthSignIn !== 'undefined' &&
                       typeof window.AuthSignIn.renderCard === 'function' &&
                       typeof window.AuthSignIn.initHandlers === 'function';
            });

            expect(hasAuthSignIn).toBe(true);
        });

        test('my-reviews page has GitHub login button via shared module', async ({ page }) => {
            await page.goto('/my-reviews.html');

            await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

            const githubBtn = page.locator('.auth-provider-btn[data-provider="github"]');
            await expect(githubBtn).toBeVisible();
            await expect(githubBtn).toContainText('Continue with GitHub');
        });

        test('my-reviews page has Google login button via shared module', async ({ page }) => {
            await page.goto('/my-reviews.html');

            await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

            const googleBtn = page.locator('.auth-provider-btn[data-provider="google"]');
            await expect(googleBtn).toBeVisible();
            await expect(googleBtn).toContainText('Continue with Google');
        });

        test('my-reviews page has both auth buttons in correct container', async ({ page }) => {
            await page.goto('/my-reviews.html');

            await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

            const container = page.locator('.auth-signin-buttons');
            await expect(container).toBeVisible();

            const buttons = container.locator('.auth-provider-btn');
            await expect(buttons).toHaveCount(2);
        });
    });

    test.describe('Auth Buttons Consistency', () => {

        test('both pages have identical auth button structure', async ({ page }) => {
            // Check admin page
            await page.goto('/admin.html');
            await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

            const adminGithub = await page.locator('.auth-provider-btn[data-provider="github"]').innerHTML();
            const adminGoogle = await page.locator('.auth-provider-btn[data-provider="google"]').innerHTML();

            // Check my-reviews page
            await page.goto('/my-reviews.html');
            await page.waitForSelector('#login-required:not(.hidden)', { timeout: 5000 });

            const reviewsGithub = await page.locator('.auth-provider-btn[data-provider="github"]').innerHTML();
            const reviewsGoogle = await page.locator('.auth-provider-btn[data-provider="google"]').innerHTML();

            // Buttons should have same structure (from shared module)
            expect(adminGithub).toBe(reviewsGithub);
            expect(adminGoogle).toBe(reviewsGoogle);
        });
    });
});
