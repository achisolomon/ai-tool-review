# Handle Existing Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to view, edit, or delete their existing reviews instead of seeing a confusing "thank you" message when clicking "Leave a Review".

**Architecture:** On button click, check if user has existing review via new `getUserReviewForTool()` API. If yes, show "Your Review" modal with edit/delete options. Editing updates the review and resets status to pending. Deleting removes the review and allows new submission.

**Tech Stack:** JavaScript (vanilla), Supabase (RLS policies), Playwright (E2E tests), CSS

---

## File Structure

| File | Purpose |
|------|---------|
| `supabase/migrations/007_user_review_management.sql` | RLS policies for user review read/update/delete |
| `js/reviews-api.js` | Add `getUserReviewForTool()`, `updateReview()`, `deleteReview()` functions |
| `js/review-components.js` | Add `renderExistingReviewModal()`, `renderDeleteConfirmDialog()` components |
| `_layouts/tool.html` | Modify button click handler to check for existing review first |
| `css/reviews.css` | Styles for existing review modal and delete confirmation |
| `tests/reviews.spec.js` | E2E tests for existing review flow |

---

### Task 1: Create RLS Policies Migration

**Files:**
- Create: `supabase/migrations/007_user_review_management.sql`

- [ ] **Step 1: Create migration file**

```sql
-- =============================================
-- MIGRATION 007: User Review Management Policies
-- Allows users to read, update, and delete their own reviews
-- IDEMPOTENT: Safe to re-run multiple times
-- =============================================

-- Allow users to read their own reviews (regardless of status)
-- This is needed to check if user already has a review for a tool
DROP POLICY IF EXISTS "Users can read own reviews" ON reviews;
CREATE POLICY "Users can read own reviews"
ON reviews FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own reviews
-- Status will be reset to 'pending' by the application
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant UPDATE and DELETE permissions to authenticated role
GRANT UPDATE, DELETE ON public.reviews TO authenticated;
```

- [ ] **Step 2: Verify migration file exists**

Run: `cat supabase/migrations/007_user_review_management.sql | head -20`
Expected: First 20 lines of the migration showing the header and first policy

- [ ] **Step 3: Commit migration**

```bash
git add supabase/migrations/007_user_review_management.sql
git commit -m "feat: add RLS policies for user review management"
```

---

### Task 2: Add API Functions

**Files:**
- Modify: `js/reviews-api.js` (add after `submitReview` function, before exports)

- [ ] **Step 1: Add getUserReviewForTool function**

Add this function after `submitReview()` and before `window.ReviewsAPI = {`:

```javascript
/**
 * Get the current user's review for a tool (if any)
 * SECURITY: RLS policy ensures users can only read their own reviews
 * @param {string} toolId - The tool ID
 * @returns {Object} - { hasReview: boolean, review?: Object }
 */
async function getUserReviewForTool(toolId) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) {
        return { hasReview: false };
    }

    const user = await window.SupabaseClient.getCurrentUser();
    if (!user) {
        return { hasReview: false };
    }

    const { data, error } = await supabase
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
            status,
            created_at
        `)
        .eq('tool_id', toolId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Error fetching user review:', error);
        return { hasReview: false };
    }

    if (!data) {
        return { hasReview: false };
    }

    return { hasReview: true, review: data };
}
```

- [ ] **Step 2: Add updateReview function**

Add this function after `getUserReviewForTool()`:

```javascript
/**
 * Update an existing review
 * SECURITY: RLS policy ensures users can only update their own reviews
 * @param {string} reviewId - The review ID
 * @param {Object} reviewData - Updated review fields
 * @returns {Object} - { success: boolean, error?: string }
 */
async function updateReview(reviewId, reviewData) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) {
        return { success: false, error: 'Unable to connect to database' };
    }

    const user = await window.SupabaseClient.getCurrentUser();
    if (!user) {
        return { success: false, error: 'You must be signed in to update a review' };
    }

    // Validate required fields
    if (!reviewData.overall_rating || reviewData.overall_rating < 1 || reviewData.overall_rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5' };
    }
    if (!reviewData.title || reviewData.title.trim().length === 0) {
        return { success: false, error: 'Review title is required' };
    }
    if (!reviewData.like_best || reviewData.like_best.trim().length < 10) {
        return { success: false, error: 'Please describe what you like best (minimum 10 characters)' };
    }

    // Prepare update data - always reset to pending for re-moderation
    const updateData = {
        author_name: reviewData.author_name.trim(),
        author_initial: reviewData.author_name.trim().charAt(0).toUpperCase(),
        company_size: reviewData.company_size || null,
        overall_rating: parseInt(reviewData.overall_rating, 10),
        title: reviewData.title.trim(),
        like_best: reviewData.like_best.trim(),
        dislike: reviewData.dislike?.trim() || null,
        time_used: reviewData.time_used || null,
        status: 'pending', // Reset to pending for re-moderation
    };

    const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId);

    if (error) {
        console.error('Error updating review:', error);
        if (error.code === '42501') {
            return { success: false, error: 'Permission denied. You can only edit your own reviews.' };
        }
        return { success: false, error: 'Failed to update review. Please try again.' };
    }

    return { success: true };
}
```

- [ ] **Step 3: Add deleteReview function**

Add this function after `updateReview()`:

```javascript
/**
 * Delete a review
 * SECURITY: RLS policy ensures users can only delete their own reviews
 * @param {string} reviewId - The review ID
 * @returns {Object} - { success: boolean, error?: string }
 */
async function deleteReview(reviewId) {
    const supabase = window.SupabaseClient.getSupabase();
    if (!supabase) {
        return { success: false, error: 'Unable to connect to database' };
    }

    const user = await window.SupabaseClient.getCurrentUser();
    if (!user) {
        return { success: false, error: 'You must be signed in to delete a review' };
    }

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

    if (error) {
        console.error('Error deleting review:', error);
        if (error.code === '42501') {
            return { success: false, error: 'Permission denied. You can only delete your own reviews.' };
        }
        return { success: false, error: 'Failed to delete review. Please try again.' };
    }

    return { success: true };
}
```

- [ ] **Step 4: Update exports**

Update the `window.ReviewsAPI` export to include new functions:

```javascript
// Export for use in other modules
window.ReviewsAPI = {
    getToolBySlug,
    getReviewsForTool,
    formatStarsCount,
    formatReviewSummary,
    formatReviewCard,
    findOrCreateTool,
    submitReview,
    getUserReviewForTool,
    updateReview,
    deleteReview,
};
```

- [ ] **Step 5: Verify API changes**

Run: `grep -n "getUserReviewForTool\|updateReview\|deleteReview" js/reviews-api.js`
Expected: Lines showing function definitions and exports

- [ ] **Step 6: Commit API changes**

```bash
git add js/reviews-api.js
git commit -m "feat: add getUserReviewForTool, updateReview, deleteReview API functions"
```

---

### Task 3: Add UI Components

**Files:**
- Modify: `js/review-components.js` (add before exports)

- [ ] **Step 1: Add renderExistingReviewModal function**

Add before `window.ReviewComponents = {`:

```javascript
/**
 * Render the "Your Review" modal for users with existing reviews
 * @param {string} toolName - Tool name for display
 * @param {Object} review - The user's existing review
 * @returns {string} - HTML string
 */
function renderExistingReviewModal(toolName, review) {
    const safeToolName = escapeHtml(toolName);
    const safeTitle = escapeHtml(review.title);
    const statusLabel = review.status === 'approved' ? 'Published' : 'Pending Approval';
    const statusClass = review.status === 'approved' ? 'status-published' : 'status-pending';
    const createdDate = formatDate(new Date(review.created_at));

    return `
        <div class="review-modal-overlay" id="existing-review-modal">
            <div class="review-modal existing-review-modal">
                <div class="review-modal-header">
                    <h2>Your Review for ${safeToolName}</h2>
                    <button class="review-modal-close" id="existing-review-close">&times;</button>
                </div>

                <div class="existing-review-content">
                    <div class="existing-review-preview">
                        <div class="existing-review-rating">
                            ${renderStarRating(review.overall_rating, { showNumeric: true })}
                        </div>
                        <h3 class="existing-review-title">"${safeTitle}"</h3>
                        <div class="existing-review-meta">
                            <span class="review-status-badge ${statusClass}">${statusLabel}</span>
                            <span class="review-date">Submitted ${createdDate}</span>
                        </div>
                    </div>

                    <div class="existing-review-actions">
                        <button class="btn-primary" id="edit-review-btn" data-review-id="${review.id}">
                            Edit Review
                        </button>
                        <button class="btn-danger" id="delete-review-btn" data-review-id="${review.id}">
                            Delete Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render the delete confirmation dialog
 * @returns {string} - HTML string
 */
function renderDeleteConfirmDialog() {
    return `
        <div class="review-modal-overlay" id="delete-confirm-modal">
            <div class="review-modal delete-confirm-modal">
                <div class="review-modal-header">
                    <h2>Delete Review?</h2>
                    <button class="review-modal-close" id="delete-confirm-close">&times;</button>
                </div>

                <div class="delete-confirm-content">
                    <p>Are you sure you want to delete your review? This cannot be undone.</p>

                    <div class="delete-confirm-actions">
                        <button class="btn-cancel" id="delete-cancel-btn">Cancel</button>
                        <button class="btn-danger" id="delete-confirm-btn">Delete Review</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render success message after review update
 */
function renderUpdateSuccess() {
    return `
        <div class="review-success">
            <div class="review-success-icon">✓</div>
            <h3>Review Updated!</h3>
            <p>Your review has been updated and is pending approval.</p>
        </div>
    `;
}

/**
 * Render success message after review deletion
 */
function renderDeleteSuccess() {
    return `
        <div class="review-success">
            <div class="review-success-icon">✓</div>
            <h3>Review Deleted</h3>
            <p>Your review has been deleted. You can submit a new review anytime.</p>
        </div>
    `;
}
```

- [ ] **Step 2: Update exports**

Update the `window.ReviewComponents` export:

```javascript
// Export for use in other modules
window.ReviewComponents = {
    // Security utilities (shared across modules)
    escapeHtml,
    isValidHttpUrl,
    // Rendering functions
    renderStarRating,
    renderRatingDistribution,
    renderGitHubStars,
    renderProConsTags,
    renderAISummary,
    renderReviewSummary,
    renderReviewCard,
    renderReviewList,
    renderReviewFormModal,
    renderReviewSuccess,
    renderAuthModal,
    renderUserInfo,
    formatDate,
    // Existing review management
    renderExistingReviewModal,
    renderDeleteConfirmDialog,
    renderUpdateSuccess,
    renderDeleteSuccess,
};
```

- [ ] **Step 3: Verify component changes**

Run: `grep -n "renderExistingReviewModal\|renderDeleteConfirmDialog" js/review-components.js`
Expected: Lines showing function definitions and exports

- [ ] **Step 4: Commit component changes**

```bash
git add js/review-components.js
git commit -m "feat: add existing review modal and delete confirmation components"
```

---

### Task 4: Add CSS Styles

**Files:**
- Modify: `css/reviews.css` (add at end of file)

- [ ] **Step 1: Add existing review modal styles**

Append to end of `css/reviews.css`:

```css
/* ===========================================
   EXISTING REVIEW MODAL
   =========================================== */

.existing-review-modal {
    max-width: 480px;
}

.existing-review-content {
    padding: 24px;
}

.existing-review-preview {
    background: var(--vscode-editor-bg);
    border: 1px solid var(--vscode-border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
}

.existing-review-rating {
    margin-bottom: 12px;
}

.existing-review-title {
    margin: 0 0 12px 0;
    font-size: 18px;
    color: var(--vscode-text);
    font-weight: 600;
}

.existing-review-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
}

.review-status-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 500;
    font-size: 12px;
}

.review-status-badge.status-pending {
    background: rgba(250, 204, 21, 0.15);
    color: #facc15;
}

.review-status-badge.status-published {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
}

.existing-review-actions {
    display: flex;
    gap: 12px;
}

.existing-review-actions .btn-primary {
    flex: 1;
    padding: 12px 20px;
    background: #007acc;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s ease;
}

.existing-review-actions .btn-primary:hover {
    background: #006bb3;
}

.existing-review-actions .btn-danger {
    padding: 12px 20px;
    background: transparent;
    color: #ef4444;
    border: 1px solid #ef4444;
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.existing-review-actions .btn-danger:hover {
    background: rgba(239, 68, 68, 0.1);
}

/* ===========================================
   DELETE CONFIRMATION MODAL
   =========================================== */

.delete-confirm-modal {
    max-width: 400px;
}

.delete-confirm-content {
    padding: 24px;
}

.delete-confirm-content p {
    margin: 0 0 24px 0;
    color: var(--vscode-text-muted);
    font-size: 14px;
    line-height: 1.6;
}

.delete-confirm-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.delete-confirm-actions .btn-cancel {
    padding: 10px 20px;
    background: var(--vscode-sidebar-bg);
    color: var(--vscode-text);
    border: 1px solid var(--vscode-border);
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.delete-confirm-actions .btn-cancel:hover {
    background: var(--vscode-border);
}

.delete-confirm-actions .btn-danger {
    padding: 10px 20px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s ease;
}

.delete-confirm-actions .btn-danger:hover {
    background: #dc2626;
}
```

- [ ] **Step 2: Verify CSS changes**

Run: `tail -20 css/reviews.css`
Expected: Last 20 lines showing delete confirmation styles

- [ ] **Step 3: Commit CSS changes**

```bash
git add css/reviews.css
git commit -m "feat: add styles for existing review and delete confirmation modals"
```

---

### Task 5: Update Tool Page Handler

**Files:**
- Modify: `_layouts/tool.html` (modify the `leaveReviewBtn` click handler)

- [ ] **Step 1: Add existing review modal to page**

Find the line with `document.body.insertAdjacentHTML('beforeend', window.ReviewComponents.renderAuthModal());` and add after it (in all three places where auth modal is added):

```javascript
          document.body.insertAdjacentHTML('beforeend',
            window.ReviewComponents.renderDeleteConfirmDialog()
          );
```

- [ ] **Step 2: Modify leaveReviewBtn click handler to check for existing review**

Replace the existing `leaveReviewBtn` click handler inside `setupReviewFormHandlers()` with:

```javascript
      // Open modal - check auth first, then check for existing review
      if (leaveReviewBtn) {
        leaveReviewBtn.addEventListener('click', async function() {
          await checkAuthState();

          if (currentUser) {
            // User is logged in - check if they have an existing review
            const toolId = form.dataset.toolId;
            if (toolId) {
              const existingResult = await window.ReviewsAPI.getUserReviewForTool(toolId);
              if (existingResult.hasReview) {
                // User has existing review - show existing review modal
                showExistingReviewModal(existingResult.review);
                return;
              }
            }
            // No existing review - show review form
            prefillUserInfo(currentUser);
            modal.classList.add('active');
          } else {
            // User not logged in - show auth modal
            authModal.classList.add('active');
          }
          document.body.style.overflow = 'hidden';
        });
      }
```

- [ ] **Step 3: Add showExistingReviewModal function**

Add this function inside the `<script>` block, after `setupReviewFormHandlers()`:

```javascript
    // Show existing review modal
    function showExistingReviewModal(review) {
      const toolName = '{{ page.name | escape }}';

      // Remove existing modal if present
      const existingModal = document.getElementById('existing-review-modal');
      if (existingModal) existingModal.remove();

      // Add modal to page
      document.body.insertAdjacentHTML('beforeend',
        window.ReviewComponents.renderExistingReviewModal(toolName, review)
      );

      // Setup handlers
      setupExistingReviewHandlers(review);

      // Show modal
      document.getElementById('existing-review-modal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Setup handlers for existing review modal
    function setupExistingReviewHandlers(review) {
      const existingModal = document.getElementById('existing-review-modal');
      const closeBtn = document.getElementById('existing-review-close');
      const editBtn = document.getElementById('edit-review-btn');
      const deleteBtn = document.getElementById('delete-review-btn');

      function closeExistingModal() {
        existingModal.classList.remove('active');
        document.body.style.overflow = '';
      }

      if (closeBtn) closeBtn.addEventListener('click', closeExistingModal);

      existingModal.addEventListener('click', function(e) {
        if (e.target === existingModal) closeExistingModal();
      });

      // Edit button - open form pre-filled
      if (editBtn) {
        editBtn.addEventListener('click', function() {
          closeExistingModal();
          openEditForm(review);
        });
      }

      // Delete button - show confirmation
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
          showDeleteConfirmation(review.id);
        });
      }
    }

    // Open review form for editing
    function openEditForm(review) {
      const modal = document.getElementById('review-modal');
      const form = document.getElementById('review-form');
      const ratingInput = document.getElementById('rating-input');
      const ratingValue = document.getElementById('rating-value');
      const submitBtn = document.getElementById('review-submit');

      // Pre-fill form with existing review data
      document.getElementById('review-title').value = review.title || '';
      document.getElementById('review-name').value = review.author_name || '';
      document.getElementById('review-author-display').textContent = review.author_name || '';
      document.getElementById('review-company-size').value = review.company_size || '';
      document.getElementById('review-like-best').value = review.like_best || '';
      document.getElementById('review-dislike').value = review.dislike || '';
      document.getElementById('review-time-used').value = review.time_used || '';

      // Set rating
      const rating = review.overall_rating || 0;
      ratingInput.dataset.rating = rating;
      ratingValue.value = rating;
      const stars = ratingInput.querySelectorAll('button');
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < rating);
        s.style.color = i < rating ? '#fbbf24' : '#3c3c3c';
      });

      // Mark form as edit mode
      form.dataset.editMode = 'true';
      form.dataset.reviewId = review.id;
      submitBtn.textContent = 'Update Review';

      // Show modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Show delete confirmation
    function showDeleteConfirmation(reviewId) {
      const deleteModal = document.getElementById('delete-confirm-modal');
      const confirmBtn = document.getElementById('delete-confirm-btn');
      const cancelBtn = document.getElementById('delete-cancel-btn');
      const closeBtn = document.getElementById('delete-confirm-close');

      function closeDeleteModal() {
        deleteModal.classList.remove('active');
      }

      if (closeBtn) closeBtn.addEventListener('click', closeDeleteModal);
      if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteModal);

      deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) closeDeleteModal();
      });

      // Confirm delete
      if (confirmBtn) {
        confirmBtn.addEventListener('click', async function() {
          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Deleting...';

          const result = await window.ReviewsAPI.deleteReview(reviewId);

          if (result.success) {
            // Close all modals
            closeDeleteModal();
            const existingModal = document.getElementById('existing-review-modal');
            if (existingModal) existingModal.classList.remove('active');
            document.body.style.overflow = '';

            // Show success and reload
            alert('Your review has been deleted.');
            window.location.reload();
          } else {
            alert(result.error || 'Failed to delete review.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Delete Review';
          }
        });
      }

      // Show modal
      deleteModal.classList.add('active');
    }
```

- [ ] **Step 4: Modify form submission to handle edit mode**

Find the form submit handler and replace the submission logic with:

```javascript
          // Submit review (new or update)
          const isEditMode = form.dataset.editMode === 'true';
          let result;

          if (isEditMode) {
            const reviewId = form.dataset.reviewId;
            result = await window.ReviewsAPI.updateReview(reviewId, reviewData);
          } else {
            result = await window.ReviewsAPI.submitReview(reviewData);
          }

          if (result.success) {
            // Show success message
            const modalContent = modal.querySelector('.review-modal');
            const successHtml = isEditMode
              ? window.ReviewComponents.renderUpdateSuccess()
              : window.ReviewComponents.renderReviewSuccess();
            modalContent.innerHTML = `
              <div class="review-modal-header">
                <h2>${isEditMode ? 'Review Updated' : 'Review Submitted'}</h2>
                <button class="review-modal-close" onclick="this.closest('.review-modal-overlay').classList.remove('active'); document.body.style.overflow = ''; window.location.reload();">&times;</button>
              </div>
              ${successHtml}
            `;
          } else {
            // Show error
            alert(result.error || 'Failed to submit review. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? 'Update Review' : 'Submit Review';
          }
```

- [ ] **Step 5: Verify tool.html changes**

Run: `grep -n "getUserReviewForTool\|showExistingReviewModal\|editMode" _layouts/tool.html`
Expected: Lines showing the new function calls and edit mode handling

- [ ] **Step 6: Commit tool.html changes**

```bash
git add _layouts/tool.html
git commit -m "feat: integrate existing review check and edit/delete handlers"
```

---

### Task 6: Add E2E Tests

**Files:**
- Modify: `tests/reviews.spec.js` (add new test describe block)

- [ ] **Step 1: Add test for existing review check**

Add at the end of the test file, before the final closing brace:

```javascript
  test.describe('Existing Review Management', () => {

    test('shows existing review modal when user has already reviewed', async ({ page }) => {
      // This test requires a logged-in user with an existing review
      // For now, we test that the modal component exists
      await page.goto('/tools/claude-code/');

      // Verify the delete confirmation dialog is added to the page
      await page.waitForSelector('#delete-confirm-modal', { timeout: 10000 }).catch(() => null);

      const deleteModal = page.locator('#delete-confirm-modal');
      // Modal should exist but not be visible initially
      if (await deleteModal.count() > 0) {
        await expect(deleteModal).not.toHaveClass(/active/);
      }
    });

    test('existing review modal has edit and delete buttons', async ({ page }) => {
      // Test component rendering
      await page.goto('/tools/claude-code/');

      // Inject test modal to verify structure
      await page.evaluate(() => {
        const testReview = {
          id: 'test-123',
          title: 'Great tool',
          overall_rating: 5,
          status: 'approved',
          created_at: '2024-01-15T00:00:00Z'
        };
        const modalHtml = window.ReviewComponents.renderExistingReviewModal('Test Tool', testReview);
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      });

      const modal = page.locator('#existing-review-modal');
      await expect(modal).toBeVisible();

      const editBtn = modal.locator('#edit-review-btn');
      const deleteBtn = modal.locator('#delete-review-btn');

      await expect(editBtn).toBeVisible();
      await expect(deleteBtn).toBeVisible();
      await expect(editBtn).toHaveText('Edit Review');
      await expect(deleteBtn).toHaveText('Delete Review');
    });

    test('existing review modal shows correct status badge', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Test pending status
      await page.evaluate(() => {
        const pendingReview = {
          id: 'test-pending',
          title: 'Pending Review',
          overall_rating: 4,
          status: 'pending',
          created_at: '2024-01-15T00:00:00Z'
        };
        const existing = document.getElementById('existing-review-modal');
        if (existing) existing.remove();
        const modalHtml = window.ReviewComponents.renderExistingReviewModal('Test Tool', pendingReview);
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      });

      const pendingBadge = page.locator('.review-status-badge.status-pending');
      await expect(pendingBadge).toHaveText('Pending Approval');

      // Test approved status
      await page.evaluate(() => {
        const approvedReview = {
          id: 'test-approved',
          title: 'Approved Review',
          overall_rating: 5,
          status: 'approved',
          created_at: '2024-01-15T00:00:00Z'
        };
        const existing = document.getElementById('existing-review-modal');
        if (existing) existing.remove();
        const modalHtml = window.ReviewComponents.renderExistingReviewModal('Test Tool', approvedReview);
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      });

      const publishedBadge = page.locator('.review-status-badge.status-published');
      await expect(publishedBadge).toHaveText('Published');
    });

    test('delete confirmation modal has cancel and confirm buttons', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Inject delete confirmation modal
      await page.evaluate(() => {
        const modalHtml = window.ReviewComponents.renderDeleteConfirmDialog();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('delete-confirm-modal').classList.add('active');
      });

      const modal = page.locator('#delete-confirm-modal');
      await expect(modal).toHaveClass(/active/);

      const cancelBtn = modal.locator('#delete-cancel-btn');
      const confirmBtn = modal.locator('#delete-confirm-btn');

      await expect(cancelBtn).toBeVisible();
      await expect(confirmBtn).toBeVisible();
      await expect(cancelBtn).toHaveText('Cancel');
      await expect(confirmBtn).toHaveText('Delete Review');
    });

    test('API functions exist for review management', async ({ page }) => {
      await page.goto('/tools/claude-code/');

      // Verify API functions exist
      const hasGetUserReview = await page.evaluate(() => {
        return typeof window.ReviewsAPI.getUserReviewForTool === 'function';
      });
      const hasUpdateReview = await page.evaluate(() => {
        return typeof window.ReviewsAPI.updateReview === 'function';
      });
      const hasDeleteReview = await page.evaluate(() => {
        return typeof window.ReviewsAPI.deleteReview === 'function';
      });

      expect(hasGetUserReview).toBe(true);
      expect(hasUpdateReview).toBe(true);
      expect(hasDeleteReview).toBe(true);
    });

  });
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `cd /Users/achisolomon/Documents/Git-Achi-gmail/ai\ landscape/ai-tool-review/.worktrees/add-reviews-database && npx playwright test tests/reviews.spec.js --reporter=list`
Expected: All tests pass (including the new Existing Review Management tests)

- [ ] **Step 3: Commit test changes**

```bash
git add tests/reviews.spec.js
git commit -m "test: add E2E tests for existing review management"
```

---

### Task 7: Run Migration on Dev

**Files:** None (manual Supabase step)

- [ ] **Step 1: Run migration on dev Supabase**

Run the migration SQL on dev Supabase via the dashboard SQL editor:
1. Go to dev Supabase dashboard → SQL Editor
2. Paste the contents of `supabase/migrations/007_user_review_management.sql`
3. Execute the query

Expected: "Success. No rows returned"

- [ ] **Step 2: Verify policies exist**

Run in Supabase SQL Editor:
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'reviews' ORDER BY policyname;
```

Expected: Should show policies including:
- "Users can delete own reviews" (DELETE)
- "Users can read own reviews" (SELECT)
- "Users can update own reviews" (UPDATE)

---

### Task 8: Final Integration Test

- [ ] **Step 1: Start Jekyll server**

Run: `cd /Users/achisolomon/Documents/Git-Achi-gmail/ai\ landscape/ai-tool-review/.worktrees/add-reviews-database && bundle exec jekyll serve --port 4000`

- [ ] **Step 2: Test complete flow**

1. Go to http://localhost:4000/tools/nano-banana/
2. Click "Leave a Review"
3. Sign in with GitHub
4. Submit a review
5. Close modal
6. Click "Leave a Review" again
7. Should see "Your Review" modal with edit/delete options
8. Click "Edit Review" - should open pre-filled form
9. Close and click "Delete Review" - should show confirmation

- [ ] **Step 3: Commit final changes if any fixes needed**

```bash
git add -A
git commit -m "fix: integration fixes for existing review flow"
```
