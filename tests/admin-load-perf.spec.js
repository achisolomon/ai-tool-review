import { test, expect } from '@playwright/test';

// The admin page used to make 6 /auth/v1/user round trips and 2 user_roles
// lookups on load (auth-ui, the nav admin badge and the admin page each asked
// separately), then ran its count/review queries one after another. This runs
// the REAL supabase-client.js and admin-api.js against a fake supabase-js that
// counts calls, so a regression in the de-duplication shows up as a number.

const FAKE_SUPABASE_LIB = `
(function () {
    const calls = window.__sbCalls = { getUser: 0, tables: {} };
    const user = { id: 'admin-1', email: 'admin@example.com', user_metadata: { full_name: 'Ad Min' } };
    const delay = ms => new Promise(r => setTimeout(r, ms));

    function query(table) {
        calls.tables[table] = (calls.tables[table] || 0) + 1;
        let head = false, single = false;
        const q = {
            select(_cols, opts) { head = !!(opts && opts.head); return q; },
            eq() { return q; }, in() { return q; }, order() { return q; },
            range() { return q; }, limit() { return q; }, update() { return q; },
            maybeSingle() { single = true; return q; }, single() { single = true; return q; },
            then(resolve, reject) {
                return delay(50).then(() => {
                    if (table === 'user_roles') return { data: single ? { role: 'admin' } : [], error: null };
                    if (head) return { data: null, count: 2, error: null };
                    return { data: single ? null : [], count: 0, error: null };
                }).then(resolve, reject);
            },
        };
        return q;
    }

    window.supabase = {
        createClient() {
            return {
                auth: {
                    async getUser() { calls.getUser++; await delay(50); return { data: { user } }; },
                    async getSession() { return { data: { session: { user } } }; },
                    onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
                    async signOut() { return { error: null }; },
                },
                from: query,
                functions: { invoke: async () => ({}) },
            };
        },
    };
})();
`;

test.describe('Admin page load', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('cookie_consent', 'accepted');
            localStorage.setItem('suggestions_available', '1');
            // Cached session so auth-ui and the nav badge reconcile in the background
            // (the real-world signed-in path), all on dev project ref.
            localStorage.setItem('sb-yewcxcvngvdtsnigtmwd-auth-token', JSON.stringify({
                access_token: 'x', user: { id: 'admin-1', email: 'admin@example.com' },
            }));
        });
        await page.route('**/npm/@supabase/supabase-js@2', route =>
            route.fulfill({ contentType: 'application/javascript', body: FAKE_SUPABASE_LIB })
        );
    });

    test('fetches the signed-in user once and checks the admin role once', async ({ page }) => {
        await page.goto('/admin.html');
        await expect(page.locator('#admin-main')).toBeVisible({ timeout: 10000 });
        // Let the background auth-ui and nav-badge work settle.
        await page.waitForTimeout(500);

        const calls = await page.evaluate(() => window.__sbCalls);
        expect(calls.getUser).toBe(1);
        expect(calls.tables.user_roles).toBe(1);
    });

    test('loads the review stats with head-only count queries', async ({ page }) => {
        await page.goto('/admin.html');
        await expect(page.locator('#stat-pending')).toHaveText('2', { timeout: 10000 });
        await expect(page.locator('#stat-approved')).toHaveText('2');
        await expect(page.locator('#stat-rejected')).toHaveText('2');
    });
});
