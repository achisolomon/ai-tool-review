/**
 * Admin Suggestions tab — mocked-auth headless tests
 *
 * These tests mock the AdminAPI layer so they run without a real Supabase
 * admin session. Real approve/reject persistence is deferred to owner-manual
 * testing (needs real admin session against the Supabase dev project).
 */
import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------
const MOCK_SUGGESTIONS = [
    {
        id: '1',
        kind: 'new_tool',
        tool_slug: null,
        payload: {
            name: 'Letta',
            website: 'https://letta.com',
            placement: null,
            slug: 'letta',
        },
        status: 'pending',
        created_at: '2026-06-10T12:00:00Z',
        credit_name: 'dani',
        rationale: 'Great stateful agent runtime',
    },
    {
        id: '2',
        kind: 'taxonomy_change',
        tool_slug: null,
        payload: { op: 'other', details: 'merge X and Y categories' },
        status: 'approved',
        created_at: '2026-06-09T10:00:00Z',
        credit_name: 'sam',
        rationale: null,
    },
];

// ------------------------------------------------------------------ //
// Mocked-auth tests
// ------------------------------------------------------------------ //

test.describe('Admin Suggestions tab (mocked auth)', () => {

    // Set up localStorage consent so cookie banner doesn't block
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('cookie_consent', 'accepted');
        });
    });

    // Helper: navigate to admin page and inject mocks
    async function gotoAdminMocked(page) {
        await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
        // Give local scripts time to parse (CDN Supabase may still be loading)
        await page.waitForFunction(() => typeof window.AdminAPI !== 'undefined', { timeout: 10000 });
    }

    // Inject all the API mocks
    async function injectMocks(page) {
        await page.evaluate((suggestions) => {
            // Mock SupabaseClient so auth check passes
            if (window.SupabaseClient) {
                window.SupabaseClient.getCurrentUser = async () => ({
                    id: 'mock-admin-id',
                    email: 'admin@example.com',
                    user_metadata: { full_name: 'Mock Admin' },
                });
                window.SupabaseClient.getSession = async () => ({ session: {} });
            }
            // Mock AdminAPI
            if (window.AdminAPI) {
                window.AdminAPI.checkIsAdmin = async () => ({ isAdmin: true, role: 'admin' });
                window.AdminAPI.getSuggestionPendingCount = async () => 3;
                window.AdminAPI.getSuggestions = async () => ({ suggestions, error: null });
                window.AdminAPI.getPendingCount = async () => 0;
                window.AdminAPI.getReviewsForModeration = async () => ({ reviews: [], total: 0 });
                window.AdminAPI.getAllUsers = async () => ({ users: [], error: null });
            }
        }, suggestions);
    }

    // Helper: show the suggestions view and load the queue
    async function showSuggestionsView(page) {
        await page.evaluate(() => {
            const view = document.getElementById('suggestions-view');
            if (view) view.classList.remove('hidden');
            if (window.AdminSuggestions) window.AdminSuggestions.loadSuggestions();
        });
        // Wait for rows to appear or empty state
        await page.waitForFunction(() => {
            const q = document.getElementById('suggestions-queue');
            return q && q.children.length > 0 && !q.innerHTML.includes('Loading');
        }, { timeout: 5000 });
    }

    test('Suggestions tab button is present in the nav', async ({ page }) => {
        await gotoAdminMocked(page);
        const suggestionsTab = page.locator('[data-view="suggestions"]');
        await expect(suggestionsTab).toBeVisible();
    });

    test('Switching to Suggestions tab shows the suggestions view container', async ({ page }) => {
        await gotoAdminMocked(page);
        await injectMocks(page);

        // Directly call switchView if accessible, otherwise click the tab
        const tabVisible = await page.locator('[data-view="suggestions"]').isVisible();
        if (tabVisible) {
            await page.locator('[data-view="suggestions"]').click();
            await page.waitForTimeout(200);
        }

        const suggestionsView = page.locator('#suggestions-view');
        await expect(suggestionsView).not.toHaveClass(/hidden/);
    });

    test('Queue renders 2 rows with kind badges from mock data', async ({ page }) => {
        await gotoAdminMocked(page);
        await injectMocks(page);
        await showSuggestionsView(page);

        // Should have 2 suggestion rows
        const rows = page.locator('.suggestion-row');
        await expect(rows).toHaveCount(2);

        // Both have kind badges
        const badges = page.locator('.suggestion-kind-badge');
        await expect(badges).toHaveCount(2);

        // First badge = "New tool", second = "Taxonomy"
        await expect(badges.first()).toHaveText(/New tool/i);
        await expect(badges.nth(1)).toHaveText(/Taxonomy/i);
    });

    test('Approve button disabled for new_tool with null placement', async ({ page }) => {
        await gotoAdminMocked(page);
        await injectMocks(page);
        await showSuggestionsView(page);

        // Click the first suggestion row (new_tool, placement null)
        await page.locator('.suggestion-row').first().click();
        await page.waitForTimeout(200);

        // Decision view should be visible
        await expect(page.locator('#suggestion-decision')).not.toHaveClass(/hidden/);

        // Approve button should be DISABLED — placement is null, gate must block
        const approveBtn = page.locator('#decision-approve');
        await expect(approveBtn).toBeDisabled();

        // Placement selects must be present
        await expect(page.locator('#edit-track')).toBeVisible();
        await expect(page.locator('#edit-category')).toBeVisible();
        await expect(page.locator('#edit-subcategory')).toBeVisible();
        await expect(page.locator('#edit-slug')).toBeVisible();
    });

    test('"Mark as applied" button shows for approved taxonomy_change with op:other', async ({ page }) => {
        await gotoAdminMocked(page);
        await injectMocks(page);
        await showSuggestionsView(page);

        // Click the second row (taxonomy_change, approved, op:other)
        await page.locator('.suggestion-row').nth(1).click();
        await page.waitForTimeout(200);

        // "Mark as applied" button should be present
        await expect(page.locator('#decision-mark-applied')).toBeVisible();
    });

    test('No relevant console errors on Suggestions tab load', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        await gotoAdminMocked(page);
        await injectMocks(page);
        await showSuggestionsView(page);

        // Filter out expected Supabase/network errors (no real session)
        const relevantErrors = consoleErrors.filter(e =>
            !e.includes('supabase') &&
            !e.includes('Failed to fetch') &&
            !e.includes('net::ERR') &&
            !e.includes('401') &&
            !e.includes('403') &&
            !e.includes('JSHandle') &&
            !e.includes('cdn.jsdelivr')
        );
        expect(relevantErrors).toHaveLength(0);
    });
});

// ---------------------------------------------------------------------------
// Stubs for real-admin persistence (require actual Supabase admin session)
// ---------------------------------------------------------------------------

test.describe('Admin Suggestions — real-admin persistence (SKIPPED: needs real session)', () => {

    test.skip('approve new_tool writes status=approved and payload with slug+placement to DB', async ({ page }) => {
        // Requires: signed-in admin session against dev Supabase project (yewcxcvngvdtsnigtmwd)
        // Steps:
        //   1. Insert a test new_tool suggestion via SupabaseClient.submitSuggestion
        //   2. Load /admin.html with real admin credentials
        //   3. Switch to Suggestions tab, open the suggestion
        //   4. Fill placement selects + slug input
        //   5. Click Approve
        //   6. Verify DB row has status='approved', payload.slug, payload.placement set
        //   7. Clean up the test row
    });

    test.skip('reject without note shows error and does not update DB', async ({ page }) => {
        // Requires: signed-in admin session
        // Steps:
        //   1. Insert a test suggestion
        //   2. Open decision view
        //   3. Click Reject without filling the note textarea
        //   4. Assert toast shows "A rejection note is required"
        //   5. Assert DB row status is still 'pending'
    });

    test.skip('reject with note sets status=rejected and admin_note in DB', async ({ page }) => {
        // Requires: signed-in admin session
        // Steps:
        //   1. Insert a test suggestion
        //   2. Open decision view, fill rejection note, click Reject
        //   3. Verify DB: status='rejected', admin_note=<the note>
    });

    test.skip('markSuggestionApplied sets status=applied for approved op:other suggestion', async ({ page }) => {
        // Requires: signed-in admin session + an existing approved taxonomy_change op:other row
        // Steps:
        //   1. Switch status filter to 'approved', find the op:other row
        //   2. Open decision view
        //   3. Click "Mark as applied"
        //   4. Verify DB: status='applied', applied_at set
    });
});
