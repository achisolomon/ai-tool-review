# Handle Existing Review Feature Design

**Date:** 2026-06-09
**Status:** Approved
**Branch:** add-reviews-database

## Problem

When a user who has already submitted a review clicks "Leave a Review", the system currently shows a "Thank you" success message (from the previous submission). This is confusing and doesn't allow users to edit or manage their existing review.

## Solution

Check for existing reviews on button click and show appropriate UI:
- **No existing review:** Show the review form as normal
- **Has existing review:** Show "Your Review" modal with edit/delete options

## User Flow

```
User clicks "Leave a Review" button
         |
         v
Check: Does user have existing review for this tool?
         |
    +----+----+
    |         |
   No        Yes
    |         |
    v         v
Show review   Show "Your Review" modal:
form          - Review preview (title, rating, status)
              - "Edit Review" button
              - "Delete Review" button
```

## UI Design

### "Your Review" Modal

When user has an existing review, show a modal with:

1. **Header:** "Your Review for [Tool Name]"

2. **Review Preview:**
   - Star rating display (read-only)
   - Review title
   - Status badge: "Pending Approval" (yellow) or "Published" (green)
   - Submission date

3. **Actions:**
   - **Edit Review** button (primary) → Opens pre-filled form
   - **Delete Review** button (destructive) → Shows confirmation dialog

### Edit Flow

- Opens the same review form, pre-filled with existing data
- All fields editable
- On submit: Updates review and sets status back to "pending"
- Success message: "Your review has been updated and is pending approval."

### Delete Flow

- Confirmation dialog: "Are you sure you want to delete your review? This cannot be undone."
- On confirm: Deletes review from database
- Success message: "Your review has been deleted."
- UI returns to "Leave a Review" state (can submit new review)

## Status Handling

| Current Status | Can Edit? | Can Delete? | Edit Result |
|----------------|-----------|-------------|-------------|
| pending        | Yes       | Yes         | Stays pending |
| approved       | Yes       | Yes         | Goes to pending |

Editing an approved review resets it to pending for re-moderation.

## API Changes

### New Functions in `reviews-api.js`

```javascript
/**
 * Get the current user's review for a tool (if any)
 * @param {string} toolId - The tool ID
 * @returns {Object} - { hasReview: boolean, review?: Object }
 */
async function getUserReviewForTool(toolId)

/**
 * Update an existing review
 * @param {string} reviewId - The review ID
 * @param {Object} reviewData - Updated review fields
 * @returns {Object} - { success: boolean, error?: string }
 */
async function updateReview(reviewId, reviewData)

/**
 * Delete a review
 * @param {string} reviewId - The review ID
 * @returns {Object} - { success: boolean, error?: string }
 */
async function deleteReview(reviewId)
```

### New UI Components in `review-components.js`

```javascript
/**
 * Render the "Your Review" modal for users with existing reviews
 * @param {string} toolName - Tool name for display
 * @param {Object} review - The user's existing review
 * @returns {string} - HTML string
 */
function renderExistingReviewModal(toolName, review)

/**
 * Render the delete confirmation dialog
 * @returns {string} - HTML string
 */
function renderDeleteConfirmDialog()
```

## Database/RLS Changes

### New RLS Policies Required

1. **Users can read their own reviews** (regardless of status):
   ```sql
   CREATE POLICY "Users can read own reviews"
   ON reviews FOR SELECT
   TO authenticated
   USING (auth.uid() = user_id);
   ```

2. **Users can update their own reviews**:
   ```sql
   CREATE POLICY "Users can update own reviews"
   ON reviews FOR UPDATE
   TO authenticated
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);
   ```

3. **Users can delete their own reviews**:
   ```sql
   CREATE POLICY "Users can delete own reviews"
   ON reviews FOR DELETE
   TO authenticated
   USING (auth.uid() = user_id);
   ```

### Migration File

Create `007_user_review_management.sql` with idempotent policies.

## Testing Requirements

1. **Unit tests for new API functions:**
   - `getUserReviewForTool()` returns review when exists
   - `getUserReviewForTool()` returns null when no review
   - `updateReview()` updates fields correctly
   - `updateReview()` resets status to pending
   - `deleteReview()` removes review

2. **E2E tests:**
   - User without review sees review form
   - User with review sees "Your Review" modal
   - Edit pre-fills form with existing data
   - Edit submission updates review
   - Delete removes review and allows new submission

## Security Considerations

- RLS ensures users can only read/update/delete their own reviews
- `user_id` check prevents tampering with other users' reviews
- Status reset to pending on edit ensures moderation of changes

## Out of Scope

- Admin editing of user reviews (separate feature)
- Review history/versioning
- Email notifications on status change
