# Admin Review Moderation Page

## Overview

A standalone admin page for moderating user-submitted reviews. Admins can view all reviews by status, approve/reject pending reviews, and delete spam.

## Access Control

- Only users with `admin` or `moderator` role in the `user_roles` table can access
- Non-admins see "Access Denied" and are redirected
- Uses existing RLS policies from `004_admin_moderation_policy.sql`

## Page Structure

**Location:** `admin.html` (standalone file, not part of Jekyll build)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Review Moderation                    [Logout]   │
├─────────────────────────────────────────────────┤
│ [Pending (3)]  [Approved (47)]  [Rejected (2)]  │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Tool: Claude Code                           │ │
│ │ Category: Developers > Coding Assistants    │ │
│ │ ★★★★★ by John D. · June 8, 2026            │ │
│ │ "Best AI coding assistant"                  │ │
│ │ Like: Great integration with IDEs...        │ │
│ │ Dislike: Sometimes slow on large files...   │ │
│ │                                             │ │
│ │ [Approve]  [Reject]  [Delete]               │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ (next review card...)                       │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Review Card Content

Each card displays:
- **Tool name** (joined from Supabase tools table)
- **Category / Subcategory** (looked up from `js/data.js` by tool slug)
- **Rating** (star display)
- **Author name** and **date**
- **Title** (review headline)
- **Like best** (full text)
- **Dislike** (full text, if provided)
- **Action buttons:** Approve, Reject, Delete

## Actions

| Action | Behavior |
|--------|----------|
| **Approve** | Sets `status = 'approved'`, triggers aggregate stats update, moves card to Approved tab |
| **Reject** | Sets `status = 'rejected'`, moves card to Rejected tab |
| **Delete** | Shows confirmation dialog, then hard-deletes the review |

All actions use optimistic UI updates with toast notifications for feedback.

## Status Tabs

- **Pending** — Reviews awaiting moderation (default view, sorted oldest first)
- **Approved** — Published reviews (sorted newest first)
- **Rejected** — Rejected reviews (sorted newest first)

Each tab shows a count in parentheses.

## Admin Badge (Main Site)

When an admin/moderator is logged in on any page of the main site:
- Check if user has admin/moderator role
- If yes, fetch pending review count
- Display badge in header (e.g., "Admin (3)" or icon with count)
- Badge links to `admin.html`

Regular users see no difference.

## Files

### New Files

| File | Purpose |
|------|---------|
| `admin.html` | Standalone admin page |
| `js/admin-api.js` | Admin-specific API functions |
| `css/admin.css` | Admin page styles |

### Modified Files

| File | Change |
|------|--------|
| `_includes/header.html` or equivalent | Add admin badge logic |

## API Functions (`js/admin-api.js`)

```javascript
checkIsAdmin()
// Returns: { isAdmin: boolean, role: 'admin' | 'moderator' | null }

getPendingCount()
// Returns: number

getReviewsForModeration(status, { limit, offset })
// Returns: Array of reviews with tool name joined
// Sorted: pending = oldest first, others = newest first

approveReview(reviewId)
// Returns: { success: boolean, error?: string }

rejectReview(reviewId)
// Returns: { success: boolean, error?: string }

deleteReviewAdmin(reviewId)
// Returns: { success: boolean, error?: string }
```

## Database

No new migrations required. Existing RLS policies in `004_admin_moderation_policy.sql` already support:
- Moderators viewing all reviews
- Moderators updating any review (for status changes)
- Admins deleting any review

## Out of Scope

- Rejection reasons (future feature)
- Email notifications (future feature)
- Tool category management (separate feature)
- Bulk actions (select multiple reviews)
