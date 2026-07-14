import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Fake Supabase client: a minimal chainable + thenable query builder so the
// real js/admin-api.js can run unmodified against canned table data.
// ---------------------------------------------------------------------------
function supabaseClientStub(tables, { onProfilesQuery } = {}) {
    return `
window.__profilesQueryCount = 0;
function makeQueryBuilder(result) {
    const builder = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        range: () => builder,
        in: (col, ids) => {
            window.__profilesQueryCount++;
            window.__profilesQueryIds = ids;
            return builder;
        },
        then: (resolve) => resolve(result),
    };
    return builder;
}
const TABLES = ${JSON.stringify(tables)};
window.SupabaseClient = {
    ensureSupabase: async () => {},
    getSupabase: () => ({
        from: (table) => makeQueryBuilder(TABLES[table] || { data: [], error: null }),
    }),
    getCurrentUser: async () => null,
    isSuggestionsAvailable: async () => false,
};
`;
}

test.describe('getReviewsForModeration author email merge', () => {

    test('attaches authorEmail for reviews with a matching profile, null otherwise', async ({ page }) => {
        const tables = {
            reviews: {
                data: [
                    { id: 'r1', tool_id: 't1', user_id: 'u1', author_name: 'Alice', author_initial: 'A', company_size: null, overall_rating: 5, title: 'Great', like_best: 'Fast', dislike: null, time_used: null, would_recommend: true, status: 'pending', created_at: '2026-07-01T00:00:00Z', tools: { id: 't1', slug: 'tool-a', name: 'Tool A' } },
                    { id: 'r2', tool_id: 't1', user_id: null, author_name: 'Anon', author_initial: 'A', company_size: null, overall_rating: 3, title: 'Ok', like_best: 'Fine', dislike: null, time_used: null, would_recommend: true, status: 'pending', created_at: '2026-07-02T00:00:00Z', tools: { id: 't1', slug: 'tool-a', name: 'Tool A' } },
                ],
                error: null,
                count: 2,
            },
            user_profiles: {
                data: [{ id: 'u1', email: 'alice@example.com' }],
                error: null,
            },
        };

        await page.route('**/js/supabase-client.js', route =>
            route.fulfill({ contentType: 'application/javascript', body: supabaseClientStub(tables) })
        );
        await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof window.AdminAPI !== 'undefined', { timeout: 10000 });

        const result = await page.evaluate(async () => {
            return await window.AdminAPI.getReviewsForModeration('pending');
        });

        expect(result.reviews).toHaveLength(2);
        const r1 = result.reviews.find(r => r.id === 'r1');
        const r2 = result.reviews.find(r => r.id === 'r2');
        expect(r1.authorEmail).toBe('alice@example.com');
        expect(r2.authorEmail).toBeNull();
    });

    test('skips the profile lookup when every review has a null user_id', async ({ page }) => {
        const tables = {
            reviews: {
                data: [
                    { id: 'r1', tool_id: 't1', user_id: null, author_name: 'Anon', author_initial: 'A', company_size: null, overall_rating: 4, title: 'Ok', like_best: 'Fine', dislike: null, time_used: null, would_recommend: true, status: 'pending', created_at: '2026-07-01T00:00:00Z', tools: { id: 't1', slug: 'tool-a', name: 'Tool A' } },
                ],
                error: null,
                count: 1,
            },
            user_profiles: { data: [], error: null },
        };

        await page.route('**/js/supabase-client.js', route =>
            route.fulfill({ contentType: 'application/javascript', body: supabaseClientStub(tables) })
        );
        await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof window.AdminAPI !== 'undefined', { timeout: 10000 });

        const result = await page.evaluate(async () => {
            return await window.AdminAPI.getReviewsForModeration('pending');
        });

        expect(result.reviews[0].authorEmail).toBeNull();
        const queryCount = await page.evaluate(() => window.__profilesQueryCount || 0);
        expect(queryCount).toBe(0);
    });

    test('falls back to null authorEmail for every review when the profile lookup errors', async ({ page }) => {
        const tables = {
            reviews: {
                data: [
                    { id: 'r1', tool_id: 't1', user_id: 'u1', author_name: 'Alice', author_initial: 'A', company_size: null, overall_rating: 5, title: 'Great', like_best: 'Fast', dislike: null, time_used: null, would_recommend: true, status: 'pending', created_at: '2026-07-01T00:00:00Z', tools: { id: 't1', slug: 'tool-a', name: 'Tool A' } },
                ],
                error: null,
                count: 1,
            },
            user_profiles: { data: null, error: { message: 'boom' } },
        };

        await page.route('**/js/supabase-client.js', route =>
            route.fulfill({ contentType: 'application/javascript', body: supabaseClientStub(tables) })
        );
        await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof window.AdminAPI !== 'undefined', { timeout: 10000 });

        const result = await page.evaluate(async () => {
            return await window.AdminAPI.getReviewsForModeration('pending');
        });

        expect(result.reviews).toHaveLength(1);
        expect(result.reviews[0].authorEmail).toBeNull();
    });
});

test.describe('Review card author email rendering', () => {

    const SUPABASE_CLIENT_STUB = `
window.SupabaseClient = {
    getCurrentUser: async () => ({
        id: 'mock-admin-id',
        email: 'admin@example.com',
        user_metadata: { full_name: 'Mock Admin' },
    }),
    getSession: async () => ({ session: { user: { id: 'mock-admin-id' } } }),
    isSuggestionsAvailable: async () => false,
    isAuthenticated: async () => true,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithProvider: async () => {},
    signOut: async () => {},
    getUserProfile: async () => null,
    updateLastSignIn: async () => {},
};
`;

    function adminApiStub(reviews) {
        return `
window.AdminAPI = {
    checkIsAdmin: async () => ({ isAdmin: true, role: 'admin' }),
    getPendingCount: async () => ${reviews.length},
    getReviewsForModeration: async () => ({ reviews: ${JSON.stringify(reviews)}, total: ${reviews.length} }),
    getAllUsers: async () => ({ users: [], error: null }),
    getSuggestions: async () => ({ suggestions: [], error: null }),
    getSuggestionPendingCount: async () => 0,
    approveSuggestion: async () => ({ error: null }),
    rejectSuggestion: async () => ({ error: null }),
    markSuggestionApplied: async () => ({ error: null }),
    updateUserRole: async () => ({ error: null }),
    deleteReview: async () => ({ error: null }),
    approveReview: async () => ({ error: null }),
    rejectReview: async () => ({ error: null }),
    deleteReviewAdmin: async () => ({ error: null }),
};
`;
    }

    const MOCK_REVIEWS = [
        {
            id: 'r1', tool_id: 't1', author_name: 'Alice', author_initial: 'A',
            company_size: null, overall_rating: 5, title: 'Great tool',
            like_best: 'Fast and reliable', dislike: null, time_used: null,
            would_recommend: true, status: 'pending', created_at: '2026-07-01T00:00:00Z',
            tools: { id: 't1', slug: 'tool-a', name: 'Tool A' },
            authorEmail: 'alice@example.com',
        },
        {
            id: 'r2', tool_id: 't1', author_name: 'Anon Bob', author_initial: 'A',
            company_size: null, overall_rating: 3, title: 'It is fine',
            like_best: 'Does the job', dislike: null, time_used: null,
            would_recommend: true, status: 'pending', created_at: '2026-07-02T00:00:00Z',
            tools: { id: 't1', slug: 'tool-a', name: 'Tool A' },
            authorEmail: null,
        },
    ];

    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('cookie_consent', 'accepted');
        });
        await page.route('**/js/supabase-client.js', route =>
            route.fulfill({ contentType: 'application/javascript', body: SUPABASE_CLIENT_STUB })
        );
        await page.route('**/js/admin-api.js', route =>
            route.fulfill({ contentType: 'application/javascript', body: adminApiStub(MOCK_REVIEWS) })
        );
    });

    test('shows the account email next to the author name', async ({ page }) => {
        await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.review-card', { timeout: 10000 });

        const firstCard = page.locator('.review-card').first();
        await expect(firstCard.locator('.review-author-email')).toHaveText('alice@example.com');
    });

    test('shows the muted anonymous fallback when there is no account', async ({ page }) => {
        await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.review-card', { timeout: 10000 });

        const secondCard = page.locator('.review-card').nth(1);
        const emailEl = secondCard.locator('.review-author-email');
        await expect(emailEl).toHaveText('no account (anonymous)');
        await expect(emailEl).toHaveClass(/is-anonymous/);
    });

    test('escapes HTML-significant characters in the email', async ({ page }) => {
        const maliciousReviews = [{
            ...MOCK_REVIEWS[0],
            authorEmail: '<script>alert(1)</script>@example.com',
        }];
        await page.route('**/js/admin-api.js', route =>
            route.fulfill({ contentType: 'application/javascript', body: adminApiStub(maliciousReviews) })
        );

        await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.review-card', { timeout: 10000 });

        const emailEl = page.locator('.review-author-email').first();
        await expect(emailEl).toHaveText('<script>alert(1)</script>@example.com');
        const scriptCount = await page.locator('.review-author-email script').count();
        expect(scriptCount).toBe(0);
    });
});
