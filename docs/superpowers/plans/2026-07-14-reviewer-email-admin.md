# Reviewer Account Email on Admin Review Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the submitting account's email next to the author name on admin review-moderation cards (`admin.html`), admin-only, with a muted fallback for anonymous/accountless reviews.

**Architecture:** `js/admin-api.js`'s `getReviewsForModeration` gains a second, batched `user_profiles` query and merges `authorEmail` onto each returned review (no schema change — `reviews.user_id` and `user_profiles.id` share no direct FK, so PostgREST can't embed them). `admin.html`'s `renderReviewCard` reads `review.authorEmail` and renders it (or a muted fallback) next to the existing author-name span. Exposure is strictly admin/moderator-only: `admin.html` requires an admin session, and `user_profiles` RLS already restricts reads to staff.

**Tech Stack:** Vanilla JS (browser globals `window.AdminAPI`, `window.SupabaseClient`), Supabase JS client, Playwright for tests.

---

## Spec

`docs/superpowers/specs/2026-07-14-reviewer-email-admin-design.md`

## File Structure

- Modify: `js/admin-api.js` — `getReviewsForModeration` gains `user_id` in its select and a batched `user_profiles` merge step producing `authorEmail`.
- Modify: `admin.html` — `renderReviewCard` renders `review.authorEmail` (or fallback) in `.review-meta`.
- Modify: `css/admin.css` — add `.review-author-email` (and `.is-anonymous` modifier) styling.
- Create: `tests/admin-review-email.spec.js` — covers both the merge logic (real `js/admin-api.js`, mocked Supabase client) and the rendered fallback (mocked `AdminAPI`, real `admin.html`).

---

## Task 1: Merge `authorEmail` into `getReviewsForModeration`

**Files:**
- Modify: `js/admin-api.js:79-117`
- Test: `tests/admin-review-email.spec.js` (new file)

This task changes `js/admin-api.js`. Because it's a plain browser script (not an ES module `import`able into `node:test`), the test drives the **real** file through Playwright by navigating to `/admin.html` and replacing `js/supabase-client.js` (only) with a mock whose `getSupabase()` returns a fake chainable/thenable query builder — the same technique Supabase's real client uses. `js/admin-api.js` itself is loaded unmodified, so the test exercises the real merge logic.

- [ ] **Step 1: Write the failing tests**

Create `tests/admin-review-email.spec.js`:

```javascript
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx playwright test tests/admin-review-email.spec.js`
Expected: All 3 tests FAIL — `result.reviews[*].authorEmail` is `undefined`, not `'alice@example.com'` / `null` (the merge doesn't exist yet).

- [ ] **Step 3: Implement the merge in `js/admin-api.js`**

Replace the current `getReviewsForModeration` (lines 79-117 in `js/admin-api.js`) with:

```javascript
/**
 * Fetch reviews for moderation with tool info joined
 * @param {string} status - 'pending', 'approved', or 'rejected'
 * @param {Object} options - { limit, offset }
 * @returns {Promise<{reviews: Array, total: number}>}
 */
async function getReviewsForModeration(status, { limit = 50, offset = 0 } = {}) {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { reviews: [], total: 0 };

    const ascending = status === 'pending'; // Pending: oldest first (FIFO), others: newest first

    const { data, error, count } = await supabase
        .from('reviews')
        .select(`
            id,
            tool_id,
            user_id,
            author_name,
            author_initial,
            company_size,
            overall_rating,
            title,
            like_best,
            dislike,
            time_used,
            would_recommend,
            status,
            created_at,
            tools (
                id,
                slug,
                name
            )
        `, { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching reviews for moderation:', error);
        return { reviews: [], total: 0 };
    }

    const reviews = data || [];

    // reviews.user_id and user_profiles.id both reference auth.users, but there
    // is no direct FK between reviews and user_profiles, so PostgREST can't
    // embed the email — fetch it in one batched second query and merge here.
    const userIds = [...new Set(reviews.map(r => r.user_id).filter(Boolean))];
    const emailByUserId = {};

    if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, email')
            .in('id', userIds);

        if (profilesError) {
            console.error('Error fetching reviewer profiles:', profilesError);
        } else {
            for (const profile of profiles || []) {
                emailByUserId[profile.id] = profile.email || null;
            }
        }
    }

    const reviewsWithEmail = reviews.map(review => ({
        ...review,
        authorEmail: review.user_id ? (emailByUserId[review.user_id] ?? null) : null,
    }));

    return { reviews: reviewsWithEmail, total: count || 0 };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx playwright test tests/admin-review-email.spec.js`
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add js/admin-api.js tests/admin-review-email.spec.js
git commit -m "feat: merge reviewer account email into getReviewsForModeration"
```

---

## Task 2: Render `authorEmail` on the review card with a muted fallback

**Files:**
- Modify: `admin.html:490-546` (`renderReviewCard`)
- Modify: `css/admin.css:477-495`
- Test: `tests/admin-review-email.spec.js` (extend)

This task tests the **rendering** side. Here `AdminAPI.getReviewsForModeration` itself is mocked (returning canned `authorEmail` values directly) so the test isolates `renderReviewCard`'s markup — the merge logic was already covered by real execution in Task 1.

- [ ] **Step 1: Write the failing tests**

Append to `tests/admin-review-email.spec.js`:

```javascript
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx playwright test tests/admin-review-email.spec.js`
Expected: The 3 new tests FAIL — `.review-author-email` doesn't exist yet (selector not found / timeout).

- [ ] **Step 3: Update `renderReviewCard` in `admin.html`**

In `admin.html`, find this line (around line 536):

```javascript
                            <span class="review-author">by ${escapeHtml(authorName)}</span>
```

Replace it with:

```javascript
                            <span class="review-author">by ${escapeHtml(authorName)}</span>
                            <span class="review-author-email${review.authorEmail ? '' : ' is-anonymous'}">${review.authorEmail ? escapeHtml(review.authorEmail) : 'no account (anonymous)'}</span>
```

- [ ] **Step 4: Add the CSS rule**

In `css/admin.css`, right after the `.review-author` rule (around line 491), add:

```css
.review-author-email {
    color: var(--vscode-text-muted);
    font-size: 12px;
}

.review-author-email.is-anonymous {
    font-style: italic;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx playwright test tests/admin-review-email.spec.js`
Expected: All 6 tests PASS (3 from Task 1 + 3 from this task).

- [ ] **Step 6: Commit**

```bash
git add admin.html css/admin.css tests/admin-review-email.spec.js
git commit -m "feat: show reviewer account email on admin review cards"
```

---

## Task 3: Full regression pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx playwright test`
Expected: All tests pass, including the pre-existing `tests/admin.spec.js` and `tests/admin-suggestions.spec.js` (unaffected by these changes — Task 1 only adds a field, Task 2 only adds a span/CSS rule, neither removes or renames anything existing tests depend on).

- [ ] **Step 2: Manually sanity-check in the browser** (if a real Supabase admin session is available)

Run: `npm run serve`, sign in as an admin/moderator at `/admin.html`, open the Reviews tab, and confirm real reviews show the correct email (or the anonymous fallback) next to the author name.

---

## Self-Review Notes

- **Spec coverage:** All-tabs display (pending/approved/rejected) — `renderReviewCard` is shared across all three status tabs, so Task 2's change applies everywhere the spec requires without extra work. Muted fallback, HTML-escaping, no-schema-change, batched/deduped lookup, error-doesn't-blank-queue, and admin-only exposure are each covered by a task step or test above.
- **Placeholder scan:** none found — every step has runnable code and exact commands.
- **Type/name consistency:** `authorEmail` (camelCase, matching existing `authorName`/`toolName` local-var style in `renderReviewCard`) is used identically in Task 1's merge output and Task 2's render/tests. `.review-author-email` / `.is-anonymous` class names are used identically in the CSS and the render + test assertions.
