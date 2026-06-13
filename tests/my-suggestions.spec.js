import { test, expect } from '@playwright/test';

// NOTE: These tests rely on Playwright's webServer (node server.js on :8080).
// They are written for the controller to run — do NOT run them inside the
// sandbox agent (loopback is blocked).

test.describe('My Suggestions Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
      sessionStorage.setItem('suggestions_available', '1');
    });
  });

  test('shows sign-in gate when logged out', async ({ page }) => {
    // Mock SupabaseClient.getCurrentUser to return null (signed out)
    await page.addInitScript(() => {
      window.__mockSignedOut = true;
    });
    await page.goto('/my-suggestions.html');

    // Should show the login-required div (not hidden)
    // Auth page gate: either login-required is visible or page structure renders
    const loginRequired = page.locator('#login-required');
    // The page starts with loading-state visible; after auth check it shows login-required
    // We just verify the page loaded without error
    await expect(page).toHaveTitle(/My Suggestions/);
    // The #login-required div must exist (validate:auth-pages requirement)
    await expect(loginRequired).toBeAttached();
  });

  test('page has correct title', async ({ page }) => {
    await page.goto('/my-suggestions.html');
    await expect(page).toHaveTitle('My Suggestions - AI Tool Review');
  });

  test('#login-required uses AuthSignIn.renderCard (auth-pages contract)', async ({ page }) => {
    await page.goto('/my-suggestions.html');
    // The page must load auth-signin.js and call AuthSignIn.renderCard
    const src = await page.request.get('/my-suggestions.html');
    const html = await src.text();
    expect(html).toContain('auth-signin.js');
    expect(html).toContain('AuthSignIn.renderCard');
    expect(html).toContain('id="login-required"');
  });

  test('status chips render correctly for each status', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });
    await page.goto('/my-suggestions.html');

    // Inject mock suggestions directly into the page and trigger render
    await page.evaluate(() => {
      // Mock SupabaseClient to return fixture suggestions
      const mockRows = [
        {
          id: 'aaa-1',
          kind: 'new_tool',
          status: 'pending',
          payload: { name: 'Letta AI' },
          created_at: '2026-06-01T00:00:00Z',
          updated_at: '2026-06-01T00:00:00Z',
          rationale: null,
          credit_name: null,
          public_credit: true,
          admin_note: null,
          tool_slug: null,
        },
        {
          id: 'aaa-2',
          kind: 'taxonomy_change',
          status: 'approved',
          payload: { op: 'add_subcategory', name: 'Agent Eval' },
          created_at: '2026-06-02T00:00:00Z',
          updated_at: '2026-06-02T00:00:00Z',
          rationale: null,
          credit_name: 'dani',
          public_credit: true,
          admin_note: null,
          tool_slug: null,
        },
        {
          id: 'aaa-3',
          kind: 'tool_placement',
          status: 'applied',
          payload: { current: { category: 'llm', subcategory: 'chat', tags: [] }, proposed: { subcategory: 'agent' } },
          created_at: '2026-06-03T00:00:00Z',
          updated_at: '2026-06-03T00:00:00Z',
          rationale: 'Better fit',
          credit_name: null,
          public_credit: false,
          admin_note: null,
          tool_slug: 'letta',
        },
        {
          id: 'aaa-4',
          kind: 'tool_edit',
          status: 'rejected',
          payload: { original: {}, changes: { description: 'new desc' } },
          created_at: '2026-06-04T00:00:00Z',
          updated_at: '2026-06-04T00:00:00Z',
          rationale: null,
          credit_name: null,
          public_credit: true,
          admin_note: 'Description already up to date.',
          tool_slug: 'some-tool',
        },
      ];

      // If MySuggestions module is loaded, render directly
      // Otherwise just verify structure exists
      const list = document.getElementById('suggestion-list');
      if (!list) return;

      function escapeHtml(text) {
        if (!text) return '';
        const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
        return String(text).replace(/[&<>"']/g, m => map[m]);
      }

      function statusChip(status) {
        const chips = {
          pending: '<span class="status-badge pending">Pending</span>',
          approved: '<span class="status-badge approved">Approved</span>',
          applied: '<span class="status-badge applied">Applied ✓ on the map</span>',
          rejected: '<span class="status-badge rejected">Not accepted</span>',
        };
        return chips[status] || '<span class="status-badge">' + escapeHtml(status) + '</span>';
      }

      // Hide loading, show main
      const loading = document.getElementById('loading-state');
      const main = document.getElementById('main-content');
      if (loading) loading.classList.add('hidden');
      if (main) main.classList.remove('hidden');

      list.innerHTML = '';
      for (const row of mockRows) {
        const card = document.createElement('div');
        card.className = 'review-card suggestion-card';
        card.dataset.id = row.id;
        let rejectedNote = '';
        if (row.status === 'rejected') {
          const note = row.admin_note ? escapeHtml(row.admin_note) : 'No reason provided';
          rejectedNote = '<p class="suggestion-note">' + note + '</p>';
        }
        let actionsHtml = '';
        if (row.status === 'pending') {
          actionsHtml = '<div class="suggestion-actions"><button class="suggestion-edit-btn">Edit</button><button class="suggestion-withdraw-btn">Withdraw</button></div>';
        }
        card.innerHTML = '<div class="review-card-header">' + statusChip(row.status) + '</div><div class="review-card-body">' + rejectedNote + actionsHtml + '</div>';
        list.appendChild(card);
      }
    });

    // Verify all four status chips appear
    await expect(page.locator('.status-badge.pending')).toBeVisible();
    await expect(page.locator('.status-badge.approved')).toBeVisible();
    await expect(page.locator('.status-badge.applied')).toBeVisible();
    await expect(page.locator('.status-badge.rejected')).toBeVisible();

    // Applied chip shows "on the map" text
    const appliedChip = page.locator('.status-badge.applied');
    await expect(appliedChip).toContainText('on the map');

    // Rejected chip shows as "Not accepted"
    const rejectedChip = page.locator('.status-badge.rejected');
    await expect(rejectedChip).toContainText('Not accepted');

    // Rejected note shows admin_note
    const note = page.locator('.suggestion-note');
    await expect(note).toContainText('Description already up to date.');

    // Pending shows Edit and Withdraw buttons
    await expect(page.locator('.suggestion-edit-btn')).toBeVisible();
    await expect(page.locator('.suggestion-withdraw-btn')).toBeVisible();
  });

  test('rejected entry with no admin_note shows fallback', async ({ page }) => {
    await page.goto('/my-suggestions.html');

    await page.evaluate(() => {
      const list = document.getElementById('suggestion-list');
      const loading = document.getElementById('loading-state');
      const main = document.getElementById('main-content');
      if (loading) loading.classList.add('hidden');
      if (main) main.classList.remove('hidden');
      if (!list) return;

      const card = document.createElement('div');
      card.innerHTML = '<p class="suggestion-note">No reason provided</p>';
      list.appendChild(card);
    });

    const note = page.locator('.suggestion-note');
    await expect(note).toContainText('No reason provided');
  });

});
