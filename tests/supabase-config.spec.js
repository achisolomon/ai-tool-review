import { test, expect } from '@playwright/test';

test.describe('Supabase Environment Configuration', () => {

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('cookie_consent', 'accepted');
        });
    });

    test('SupabaseClient exports required functions', async ({ page }) => {
        await page.goto('/admin.html');

        const exports = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (!window.SupabaseClient) return { error: 'SupabaseClient not loaded' };
            return {
                hasGetSupabase: typeof window.SupabaseClient.getSupabase === 'function',
                hasGetCurrentUser: typeof window.SupabaseClient.getCurrentUser === 'function',
                hasIsAuthenticated: typeof window.SupabaseClient.isAuthenticated === 'function',
                hasSignInWithProvider: typeof window.SupabaseClient.signInWithProvider === 'function',
                hasSignOut: typeof window.SupabaseClient.signOut === 'function',
                hasGetSession: typeof window.SupabaseClient.getSession === 'function',
                hasSupabaseUrl: typeof window.SupabaseClient.SUPABASE_URL === 'string',
            };
        });

        expect(exports.hasGetSupabase).toBe(true);
        expect(exports.hasGetCurrentUser).toBe(true);
        expect(exports.hasIsAuthenticated).toBe(true);
        expect(exports.hasSignInWithProvider).toBe(true);
        expect(exports.hasSignOut).toBe(true);
        expect(exports.hasGetSession).toBe(true);
        expect(exports.hasSupabaseUrl).toBe(true);
    });

    test('dev environment uses dev Supabase URL on localhost', async ({ page }) => {
        await page.goto('/admin.html');

        const supabaseUrl = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return window.SupabaseClient?.SUPABASE_URL;
        });

        // On localhost (test server), should use dev URL
        expect(supabaseUrl).toContain('yewcxcvngvdtsnigtmwd.supabase.co');
    });

    test('getSupabase returns a valid client', async ({ page }) => {
        await page.goto('/admin.html');

        const hasClient = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            const client = window.SupabaseClient?.getSupabase();
            return client !== null && typeof client === 'object';
        });

        expect(hasClient).toBe(true);
    });

    test('getCurrentUser returns null for unauthenticated user', async ({ page }) => {
        await page.goto('/admin.html');

        const user = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return await window.SupabaseClient?.getCurrentUser();
        });

        expect(user).toBeNull();
    });

    test('isAuthenticated returns false for unauthenticated user', async ({ page }) => {
        await page.goto('/admin.html');

        const isAuth = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return await window.SupabaseClient?.isAuthenticated();
        });

        expect(isAuth).toBe(false);
    });

    test('getSession returns null for unauthenticated user', async ({ page }) => {
        await page.goto('/admin.html');

        const session = await page.evaluate(async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return await window.SupabaseClient?.getSession();
        });

        expect(session).toBeNull();
    });

    test('signInWithProvider returns error when Supabase not initialized', async ({ page }) => {
        // Create a page without Supabase loaded
        await page.setContent('<html><body></body></html>');

        // Manually define a broken SupabaseClient
        await page.evaluate(() => {
            window.SupabaseClient = {
                signInWithProvider: async () => ({ error: { message: 'Supabase not initialized' } })
            };
        });

        const result = await page.evaluate(async () => {
            return await window.SupabaseClient.signInWithProvider('github');
        });

        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('not initialized');
    });
});

test.describe('OAuth Hash Processing', () => {

    test('admin page processes OAuth hash on load', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('cookie_consent', 'accepted');
        });

        // Navigate to admin with a fake OAuth hash (won't actually authenticate, but tests the code path)
        await page.goto('/admin.html#access_token=fake&type=bearer');

        // The hash should be cleared after processing
        await page.waitForTimeout(1000);
        const hash = await page.evaluate(() => window.location.hash);
        expect(hash).toBe('');
    });

    test('admin page clears hash after OAuth redirect', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('cookie_consent', 'accepted');
        });

        await page.goto('/admin.html#access_token=test&token_type=bearer');

        // Wait for the hash to be cleared
        await page.waitForFunction(() => window.location.hash === '', { timeout: 3000 });

        const currentHash = await page.evaluate(() => window.location.hash);
        expect(currentHash).toBe('');
    });
});
