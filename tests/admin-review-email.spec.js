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
