# Admin Review Moderation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin page where moderators can view, approve, reject, and delete user-submitted reviews, plus show a pending count badge on the main site for admins.

**Architecture:** Standalone `admin.html` page with vanilla JS, reusing existing Supabase client. Admin API functions in separate file. Badge integration via auth state listener on main pages.

**Tech Stack:** HTML, vanilla JavaScript, Supabase RLS, CSS (dark mode theme matching existing site)

---

## File Structure

| File | Responsibility |
|------|----------------|
| `admin.html` | Standalone admin page (auth check, tabs, review cards, actions) |
| `js/admin-api.js` | Admin-specific Supabase queries (check role, fetch reviews, approve/reject/delete) |
| `css/admin.css` | Admin page styles (reuses CSS variables from main site) |
| `tests/admin.spec.js` | E2E tests for admin functionality |
| `index.html` | Add admin badge to header (modified) |
| `landscape.html` | Add admin badge to header (modified) |

---

### Task 1: Admin API Functions

**Files:**
- Create: `js/admin-api.js`
- Test: `tests/admin.spec.js`

- [ ] **Step 1: Create admin-api.js with checkIsAdmin function**

Create `js/admin-api.js`:

```javascript
// Admin API - Moderation utilities
// =================================

/**
 * Check if current user has admin or moderator role
 * @returns {Promise<{isAdmin: boolean, role: string|null}>}
 */
async function checkIsAdmin() {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) {
        return { isAdmin: false, role: null };
    }

    const user = await window.SupabaseClient.getCurrentUser();
    if (!user) {
        return { isAdmin: false, role: null };
    }

    const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator'])
        .maybeSingle();

    if (error || !data) {
        return { isAdmin: false, role: null };
    }

    return { isAdmin: true, role: data.role };
}

/**
 * Get count of pending reviews
 * @returns {Promise<number>}
 */
async function getPendingCount() {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) return 0;

    const { count, error } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (error) {
        console.error('Error fetching pending count:', error);
        return 0;
    }

    return count || 0;
}

/**
 * Fetch reviews for moderation with tool info joined
 * @param {string} status - 'pending', 'approved', or 'rejected'
 * @param {Object} options - { limit, offset }
 * @returns {Promise<{reviews: Array, total: number}>}
 */
async function getReviewsForModeration(status, { limit = 50, offset = 0 } = {}) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) return { reviews: [], total: 0 };

    const ascending = status === 'pending'; // Pending: oldest first (FIFO), others: newest first

    const { data, error, count } = await supabase
        .from('reviews')
        .select(`
            id,
            tool_id,
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

    return { reviews: data || [], total: count || 0 };
}

/**
 * Approve a review (set status to 'approved')
 * @param {string} reviewId - UUID of the review
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function approveReview(reviewId) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

    if (error) {
        console.error('Error approving review:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Reject a review (set status to 'rejected')
 * @param {string} reviewId - UUID of the review
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function rejectReview(reviewId) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);

    if (error) {
        console.error('Error rejecting review:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete a review permanently (admin only)
 * @param {string} reviewId - UUID of the review
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteReviewAdmin(reviewId) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) return { success: false, error: 'Supabase not initialized' };

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

    if (error) {
        console.error('Error deleting review:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Export for use in admin page
window.AdminAPI = {
    checkIsAdmin,
    getPendingCount,
    getReviewsForModeration,
    approveReview,
    rejectReview,
    deleteReviewAdmin,
};
```

- [ ] **Step 2: Write E2E test for checkIsAdmin**

Create `tests/admin.spec.js`:

```javascript
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
```

- [ ] **Step 3: Commit admin-api.js and initial tests**

```bash
git add js/admin-api.js tests/admin.spec.js
git commit -m "feat: add admin API functions for review moderation"
```

---

### Task 2: Admin Page HTML Structure

**Files:**
- Create: `admin.html`
- Create: `css/admin.css`

- [ ] **Step 1: Create admin.html with basic structure**

Create `admin.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Review Moderation - AI Tool Review</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/reviews.css">
    <link rel="stylesheet" href="css/admin.css">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
    <div class="admin-container">
        <!-- Header -->
        <header class="admin-header">
            <h1>Review Moderation</h1>
            <div class="admin-header-actions">
                <span id="admin-user-info"></span>
                <button id="logout-btn" class="btn btn-secondary">Logout</button>
            </div>
        </header>

        <!-- Access Denied State -->
        <div id="access-denied" class="access-denied hidden">
            <h2>Access Denied</h2>
            <p>You must be an admin or moderator to access this page.</p>
            <a href="/" class="btn btn-primary">Return to Home</a>
        </div>

        <!-- Loading State -->
        <div id="loading-state" class="loading-state">
            <p>Checking permissions...</p>
        </div>

        <!-- Main Content (hidden until auth verified) -->
        <main id="admin-main" class="admin-main hidden">
            <!-- Status Tabs -->
            <div class="status-tabs">
                <button class="status-tab active" data-status="pending">
                    Pending <span id="pending-count" class="tab-count">(0)</span>
                </button>
                <button class="status-tab" data-status="approved">
                    Approved <span id="approved-count" class="tab-count">(0)</span>
                </button>
                <button class="status-tab" data-status="rejected">
                    Rejected <span id="rejected-count" class="tab-count">(0)</span>
                </button>
            </div>

            <!-- Review List -->
            <div id="review-list" class="review-list">
                <!-- Review cards will be inserted here -->
            </div>

            <!-- Empty State -->
            <div id="empty-state" class="empty-state hidden">
                <p>No reviews in this category.</p>
            </div>
        </main>

        <!-- Delete Confirmation Modal -->
        <div id="delete-modal" class="modal hidden">
            <div class="modal-content">
                <h3>Delete Review</h3>
                <p>Are you sure you want to permanently delete this review? This action cannot be undone.</p>
                <div class="modal-actions">
                    <button id="delete-cancel" class="btn btn-secondary">Cancel</button>
                    <button id="delete-confirm" class="btn btn-danger">Delete</button>
                </div>
            </div>
        </div>

        <!-- Toast Notification -->
        <div id="toast" class="toast hidden"></div>
    </div>

    <script src="js/supabase-client.js"></script>
    <script src="js/admin-api.js"></script>
    <script src="js/data.js"></script>
    <script>
        // Admin page initialization
        (async function() {
            const loadingState = document.getElementById('loading-state');
            const accessDenied = document.getElementById('access-denied');
            const adminMain = document.getElementById('admin-main');
            const userInfo = document.getElementById('admin-user-info');
            const logoutBtn = document.getElementById('logout-btn');
            const reviewList = document.getElementById('review-list');
            const emptyState = document.getElementById('empty-state');
            const deleteModal = document.getElementById('delete-modal');
            const toast = document.getElementById('toast');
            const statusTabs = document.querySelectorAll('.status-tab');

            let currentStatus = 'pending';
            let reviewToDelete = null;

            // Check admin access
            async function checkAccess() {
                const result = await window.AdminAPI.checkIsAdmin();
                loadingState.classList.add('hidden');

                if (!result.isAdmin) {
                    accessDenied.classList.remove('hidden');
                    return false;
                }

                const user = await window.SupabaseClient.getCurrentUser();
                userInfo.textContent = user?.user_metadata?.full_name || user?.email || 'Admin';
                adminMain.classList.remove('hidden');
                return true;
            }

            // Show toast notification
            function showToast(message, type = 'success') {
                toast.textContent = message;
                toast.className = `toast ${type}`;
                toast.classList.remove('hidden');
                setTimeout(() => toast.classList.add('hidden'), 3000);
            }

            // Find category/subcategory for a tool slug
            function findToolCategory(slug) {
                if (!window.landscapeData) return { category: 'Unknown', subcategory: 'Unknown' };

                for (const category of window.landscapeData.users || []) {
                    for (const subcategory of category.subcategories || []) {
                        for (const tool of subcategory.tools || []) {
                            if (tool.slug === slug) {
                                return { category: category.name, subcategory: subcategory.name };
                            }
                        }
                    }
                }
                return { category: 'Unknown', subcategory: 'Unknown' };
            }

            // Render a single review card
            function renderReviewCard(review) {
                const tool = review.tools || {};
                const categoryInfo = findToolCategory(tool.slug);
                const date = new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
                const stars = '★'.repeat(review.overall_rating) + '☆'.repeat(5 - review.overall_rating);

                const card = document.createElement('div');
                card.className = 'review-card';
                card.dataset.reviewId = review.id;

                card.innerHTML = `
                    <div class="review-card-header">
                        <div class="review-tool-info">
                            <strong class="tool-name">${tool.name || 'Unknown Tool'}</strong>
                            <span class="tool-category">${categoryInfo.category} › ${categoryInfo.subcategory}</span>
                        </div>
                        <div class="review-meta">
                            <span class="review-stars">${stars}</span>
                            <span class="review-author">by ${review.author_name}</span>
                            <span class="review-date">${date}</span>
                        </div>
                    </div>
                    <div class="review-card-body">
                        <h4 class="review-title">"${review.title}"</h4>
                        <div class="review-content">
                            <p><strong>Like:</strong> ${review.like_best}</p>
                            ${review.dislike ? `<p><strong>Dislike:</strong> ${review.dislike}</p>` : ''}
                        </div>
                    </div>
                    <div class="review-card-actions">
                        ${currentStatus === 'pending' ? `
                            <button class="btn btn-success action-approve" data-id="${review.id}">Approve</button>
                            <button class="btn btn-warning action-reject" data-id="${review.id}">Reject</button>
                        ` : ''}
                        ${currentStatus === 'rejected' ? `
                            <button class="btn btn-success action-approve" data-id="${review.id}">Approve</button>
                        ` : ''}
                        ${currentStatus === 'approved' ? `
                            <button class="btn btn-warning action-reject" data-id="${review.id}">Reject</button>
                        ` : ''}
                        <button class="btn btn-danger action-delete" data-id="${review.id}">Delete</button>
                    </div>
                `;

                return card;
            }

            // Load reviews for current status
            async function loadReviews() {
                reviewList.innerHTML = '<p class="loading">Loading reviews...</p>';
                emptyState.classList.add('hidden');

                const result = await window.AdminAPI.getReviewsForModeration(currentStatus);

                reviewList.innerHTML = '';

                if (result.reviews.length === 0) {
                    emptyState.classList.remove('hidden');
                    return;
                }

                result.reviews.forEach(review => {
                    reviewList.appendChild(renderReviewCard(review));
                });
            }

            // Update tab counts
            async function updateCounts() {
                const pending = await window.AdminAPI.getPendingCount();
                document.getElementById('pending-count').textContent = `(${pending})`;

                const approved = await window.AdminAPI.getReviewsForModeration('approved', { limit: 1 });
                document.getElementById('approved-count').textContent = `(${approved.total})`;

                const rejected = await window.AdminAPI.getReviewsForModeration('rejected', { limit: 1 });
                document.getElementById('rejected-count').textContent = `(${rejected.total})`;
            }

            // Handle tab clicks
            statusTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    statusTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    currentStatus = tab.dataset.status;
                    loadReviews();
                });
            });

            // Handle action button clicks (event delegation)
            reviewList.addEventListener('click', async (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;

                const reviewId = btn.dataset.id;
                const card = btn.closest('.review-card');

                if (btn.classList.contains('action-approve')) {
                    btn.disabled = true;
                    const result = await window.AdminAPI.approveReview(reviewId);
                    if (result.success) {
                        card.remove();
                        showToast('Review approved');
                        updateCounts();
                        if (reviewList.children.length === 0) emptyState.classList.remove('hidden');
                    } else {
                        showToast(result.error || 'Failed to approve', 'error');
                        btn.disabled = false;
                    }
                }

                if (btn.classList.contains('action-reject')) {
                    btn.disabled = true;
                    const result = await window.AdminAPI.rejectReview(reviewId);
                    if (result.success) {
                        card.remove();
                        showToast('Review rejected');
                        updateCounts();
                        if (reviewList.children.length === 0) emptyState.classList.remove('hidden');
                    } else {
                        showToast(result.error || 'Failed to reject', 'error');
                        btn.disabled = false;
                    }
                }

                if (btn.classList.contains('action-delete')) {
                    reviewToDelete = reviewId;
                    deleteModal.classList.remove('hidden');
                }
            });

            // Delete modal handlers
            document.getElementById('delete-cancel').addEventListener('click', () => {
                deleteModal.classList.add('hidden');
                reviewToDelete = null;
            });

            document.getElementById('delete-confirm').addEventListener('click', async () => {
                if (!reviewToDelete) return;

                const result = await window.AdminAPI.deleteReviewAdmin(reviewToDelete);
                deleteModal.classList.add('hidden');

                if (result.success) {
                    const card = document.querySelector(`[data-review-id="${reviewToDelete}"]`);
                    if (card) card.remove();
                    showToast('Review deleted');
                    updateCounts();
                    if (reviewList.children.length === 0) emptyState.classList.remove('hidden');
                } else {
                    showToast(result.error || 'Failed to delete', 'error');
                }

                reviewToDelete = null;
            });

            // Logout handler
            logoutBtn.addEventListener('click', async () => {
                await window.SupabaseClient.signOut();
                window.location.href = '/';
            });

            // Initialize
            const hasAccess = await checkAccess();
            if (hasAccess) {
                await updateCounts();
                await loadReviews();
            }
        })();
    </script>
</body>
</html>
```

- [ ] **Step 2: Create admin.css with styles**

Create `css/admin.css`:

```css
/* ===========================================
   ADMIN PAGE STYLES - Dark Mode Theme
   =========================================== */

.admin-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 24px;
    min-height: 100vh;
}

/* Header */
.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--vscode-border);
}

.admin-header h1 {
    margin: 0;
    color: var(--vscode-text);
    font-size: 24px;
}

.admin-header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

#admin-user-info {
    color: var(--vscode-text-muted);
    font-size: 14px;
}

/* Access Denied */
.access-denied {
    text-align: center;
    padding: 48px 24px;
}

.access-denied h2 {
    color: var(--vscode-text);
    margin-bottom: 16px;
}

.access-denied p {
    color: var(--vscode-text-muted);
    margin-bottom: 24px;
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--vscode-text-muted);
}

/* Status Tabs */
.status-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
}

.status-tab {
    padding: 10px 20px;
    background: var(--vscode-sidebar-bg);
    border: 1px solid var(--vscode-border);
    border-radius: 6px;
    color: var(--vscode-text-muted);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.status-tab:hover {
    background: var(--vscode-hover-bg);
    color: var(--vscode-text);
}

.status-tab.active {
    background: var(--vscode-button-bg);
    color: var(--vscode-button-text);
    border-color: var(--vscode-button-bg);
}

.tab-count {
    opacity: 0.8;
}

/* Review List */
.review-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.review-list .loading {
    text-align: center;
    color: var(--vscode-text-muted);
    padding: 24px;
}

/* Review Card */
.review-card {
    background: var(--vscode-sidebar-bg);
    border: 1px solid var(--vscode-border);
    border-radius: 8px;
    overflow: hidden;
}

.review-card-header {
    padding: 16px;
    border-bottom: 1px solid var(--vscode-border);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 12px;
}

.review-tool-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.tool-name {
    color: var(--vscode-text);
    font-size: 16px;
}

.tool-category {
    color: var(--vscode-text-muted);
    font-size: 13px;
}

.review-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
}

.review-stars {
    color: #f5a623;
}

.review-author {
    color: var(--vscode-text);
}

.review-date {
    color: var(--vscode-text-muted);
}

.review-card-body {
    padding: 16px;
}

.review-title {
    margin: 0 0 12px;
    color: var(--vscode-text);
    font-size: 15px;
    font-style: italic;
}

.review-content p {
    margin: 0 0 8px;
    color: var(--vscode-text-muted);
    font-size: 14px;
    line-height: 1.5;
}

.review-content p:last-child {
    margin-bottom: 0;
}

.review-content strong {
    color: var(--vscode-text);
}

.review-card-actions {
    padding: 12px 16px;
    border-top: 1px solid var(--vscode-border);
    display: flex;
    gap: 8px;
}

/* Buttons */
.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background: var(--vscode-button-bg);
    color: var(--vscode-button-text);
}

.btn-secondary {
    background: var(--vscode-sidebar-bg);
    color: var(--vscode-text);
    border: 1px solid var(--vscode-border);
}

.btn-success {
    background: #238636;
    color: white;
}

.btn-warning {
    background: #9e6a03;
    color: white;
}

.btn-danger {
    background: #da3633;
    color: white;
}

.btn:hover:not(:disabled) {
    opacity: 0.9;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--vscode-text-muted);
}

/* Modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: var(--vscode-sidebar-bg);
    border: 1px solid var(--vscode-border);
    border-radius: 8px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
}

.modal-content h3 {
    margin: 0 0 16px;
    color: var(--vscode-text);
}

.modal-content p {
    margin: 0 0 24px;
    color: var(--vscode-text-muted);
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

/* Toast */
.toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 24px;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    z-index: 1001;
    animation: slideIn 0.3s ease;
}

.toast.success {
    background: #238636;
}

.toast.error {
    background: #da3633;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Hidden utility */
.hidden {
    display: none !important;
}
```

- [ ] **Step 3: Verify admin page loads**

Run: `npx playwright test tests/admin.spec.js --reporter=list`

Expected: Tests pass (checkIsAdmin returns false for unauthenticated, etc.)

- [ ] **Step 4: Commit admin page structure**

```bash
git add admin.html css/admin.css
git commit -m "feat: add admin review moderation page structure"
```

---

### Task 3: Admin Page E2E Tests

**Files:**
- Modify: `tests/admin.spec.js`

- [ ] **Step 1: Add tests for admin page UI elements**

Append to `tests/admin.spec.js`:

```javascript
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
```

- [ ] **Step 2: Run tests to verify**

Run: `npx playwright test tests/admin.spec.js --reporter=list`

Expected: All tests pass

- [ ] **Step 3: Commit test additions**

```bash
git add tests/admin.spec.js
git commit -m "test: add E2E tests for admin moderation page"
```

---

### Task 4: Admin Badge on Main Site

**Files:**
- Modify: `index.html`
- Modify: `landscape.html`

- [ ] **Step 1: Add admin badge HTML to index.html header**

In `index.html`, find the header's nav-links section and add the admin badge container:

```html
<nav class="nav-links">
    <a href="/" class="nav-link nav-link-text nav-active">Search</a>
    <a href="landscape.html" class="nav-link nav-link-text">Landscape</a>
    <a href="admin.html" id="admin-badge" class="nav-link admin-badge hidden">
        Admin <span id="admin-badge-count"></span>
    </a>
</nav>
```

- [ ] **Step 2: Add admin badge initialization script to index.html**

Add before the closing `</body>` tag in `index.html`:

```html
<script>
// Admin badge initialization
(async function initAdminBadge() {
    if (!window.AdminAPI) return;

    const result = await window.AdminAPI.checkIsAdmin();
    if (!result.isAdmin) return;

    const badge = document.getElementById('admin-badge');
    const countSpan = document.getElementById('admin-badge-count');
    if (!badge || !countSpan) return;

    const count = await window.AdminAPI.getPendingCount();
    if (count > 0) {
        countSpan.textContent = `(${count})`;
    }
    badge.classList.remove('hidden');
})();
</script>
```

- [ ] **Step 3: Add admin-api.js script to index.html**

Add after supabase-client.js in the script includes:

```html
<script src="js/admin-api.js"></script>
```

- [ ] **Step 4: Add admin badge CSS to styles**

Add to `css/admin.css`:

```css
/* Admin Badge in Header */
.admin-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: #238636;
    color: white !important;
    border-radius: 4px;
    font-size: 13px;
    text-decoration: none;
}

.admin-badge:hover {
    background: #2ea043;
}
```

- [ ] **Step 5: Repeat for landscape.html**

Apply the same changes to `landscape.html`:
1. Add admin badge HTML to nav-links
2. Add admin-api.js script include
3. Add admin badge initialization script

- [ ] **Step 6: Link admin.css in index.html and landscape.html**

Add to the `<head>` section of both files:

```html
<link rel="stylesheet" href="css/admin.css">
```

- [ ] **Step 7: Commit admin badge integration**

```bash
git add index.html landscape.html css/admin.css
git commit -m "feat: add admin badge to main site header"
```

---

### Task 5: Admin Badge E2E Tests

**Files:**
- Modify: `tests/admin.spec.js`

- [ ] **Step 1: Add tests for admin badge on main pages**

Append to `tests/admin.spec.js`:

```javascript
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
```

- [ ] **Step 2: Run all admin tests**

Run: `npx playwright test tests/admin.spec.js --reporter=list`

Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add tests/admin.spec.js
git commit -m "test: add E2E tests for admin badge on main site"
```

---

### Task 6: Final Integration Test

**Files:**
- Verify all tests pass

- [ ] **Step 1: Run full test suite**

Run: `npx playwright test --reporter=list`

Expected: All tests pass (183+ existing + new admin tests)

- [ ] **Step 2: Manual verification checklist**

Test manually in browser:
1. Go to `/admin.html` while not logged in → should see "Access Denied"
2. Go to `/` → admin badge should NOT be visible
3. (If you can log in as admin) → badge appears, admin page shows reviews

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git status
# If clean, no action needed
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Admin API Functions | `js/admin-api.js`, `tests/admin.spec.js` |
| 2 | Admin Page HTML/CSS | `admin.html`, `css/admin.css` |
| 3 | Admin Page E2E Tests | `tests/admin.spec.js` |
| 4 | Admin Badge Integration | `index.html`, `landscape.html`, `css/admin.css` |
| 5 | Admin Badge Tests | `tests/admin.spec.js` |
| 6 | Final Integration Test | All files verified |
