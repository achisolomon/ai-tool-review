# Show reviewer account email on admin review cards

**Date:** 2026-07-14
**Status:** Approved (design)
**Scope:** Display-only. Surface the submitting account's email on the admin
review-moderation cards. No email *sending* — that is a separate, later feature.

## Problem

The admin review-moderation view (`admin.html`) shows each review's
`author_name` — a display name the reviewer typed into the submission form. It
does **not** show the email of the Supabase account that actually submitted the
review. A moderator triaging reviews can't tell which real account is behind a
submission, which matters for spam triage and (later) for emailing contributors.

## Goal

On every review card (pending / approved / rejected tabs), show the submitting
account's email next to the typed author name, with a muted fallback when the
review has no associated account.

Non-goals:
- Sending any email.
- Changing the review submission flow or the `author_name` field.
- Making email searchable/filterable in the admin UI.
- Any database schema or migration change.

## Relevant current state

- `reviews.user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL` — the
  submitting account. **Nullable**: anonymous submissions and deleted accounts
  both yield `NULL`.
- `user_profiles(id, email, ...)` — `id` also references `auth.users(id)`.
  Populated by an `on_auth_user_created` trigger and backfilled.
- RLS: `"Admins can read all profiles"` already lets `admin`/`moderator` read
  every `user_profiles` row. No RLS or grant change is needed.
- `js/admin-api.js` → `getReviewsForModeration(status, opts)` selects review
  fields plus embedded `tools`, but **not** `user_id` and no email.
- `admin.html` → `renderReviewCard(review)` renders the card; the author name
  sits in the `.review-meta` line as `by ${authorName}`.

## Key constraint driving the approach

`reviews.user_id` and `user_profiles.id` both reference `auth.users`, but there
is **no direct foreign key between `reviews` and `user_profiles`**. PostgREST
(Supabase) can only embed across a direct FK, so a nested
`user_profiles(email)` embed on the reviews query will not resolve. We therefore
fetch profiles in a second, batched query and merge client-side.

## Design (Approach A — two-query merge, no schema change)

### 1. `getReviewsForModeration` (`js/admin-api.js`)

- Add `user_id` to the reviews `select(...)` list.
- After the reviews query succeeds, collect the distinct non-null `user_id`s.
- If there is at least one, issue one batched lookup:
  `supabase.from('user_profiles').select('id, email').in('id', ids)`.
- Build an `id -> email` map from the result.
- Attach `authorEmail` to each returned review: the mapped email, or `null`
  when `user_id` is null or no matching profile row exists.
- Return shape stays `{ reviews, total }`; each review gains an `authorEmail`
  field. Reviews array order is unchanged.

Error handling:
- If the profile lookup errors, log it (matching the existing
  `console.error` pattern) and continue with `authorEmail = null` for all
  reviews — the cards still render, just without emails. The email is
  supplementary; its failure must not blank the moderation queue.

### 2. `renderReviewCard` (`admin.html`)

- Read `review.authorEmail`.
- In the existing `.review-meta` block, after the `review-author` span, add a
  `review-author-email` span:
  - When an email is present: render it, HTML-escaped via the existing
    `escapeHtml`.
  - When `null`: render muted text `no account (anonymous)`.
- No new query logic in the view; it only consumes `authorEmail`.

### 3. Styling

- Add a small, muted `.review-author-email` style (reuse existing muted/meta
  color tokens already used in the admin CSS; no new color system). The
  fallback text uses the same span, optionally with a `.is-anonymous` modifier
  for extra-muted/italic — kept minimal.

## Data flow

```
loadReviews()
  -> AdminAPI.getReviewsForModeration(status)
       -> query reviews (now incl. user_id)
       -> query user_profiles WHERE id IN (user_ids)   [batched, staff RLS]
       -> merge -> reviews[].authorEmail
  -> renderReviewCard(review) reads review.authorEmail
       -> .review-meta shows email OR "no account (anonymous)"
```

## Edge cases

- `user_id` is `NULL` → `authorEmail = null` → fallback text. (No wasted query
  if *all* rows are null: skip the profile lookup when the id list is empty.)
- Account existed but profile row missing → not in map → `null` → fallback.
- Profile lookup fails → all `authorEmail = null`, cards still render.
- Email contains HTML-significant characters → escaped like every other field.
- Duplicate `user_id`s across reviews → de-duplicated before the `.in(...)`
  lookup.

## Privacy

Emails are PII, but this surface is admin/moderator-only and `user_profiles`
RLS already restricts reads to staff. No new exposure: the same staff can
already open the users view (`admin.html`) which lists emails. This only brings
the association to the point of triage.

## Testing

- Extend the admin/review admin tests to assert:
  - `getReviewsForModeration` returns `authorEmail` populated for a review with
    a known account, and `null` for a review with `user_id = null`.
  - A rendered review card shows the email when present and the
    `no account (anonymous)` fallback when absent.
- Follow the repo's existing Playwright/spec patterns under `tests/`.

## Files touched

- `js/admin-api.js` — extend query + merge (the only logic change).
- `admin.html` — `renderReviewCard` markup + a small CSS rule.
- `tests/` — add/extend coverage for the merge and the rendered fallback.
