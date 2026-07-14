# Search Dropdown Quick-Review Button

## Problem

Leaving a review today requires finding a tool via search, opening its results,
clicking into the tool page, and then finding the "Leave a Review" button. Users
searching for a specific tool with the intent to review it have no shortcut.

## Goal

From the search autocomplete dropdown, let users jump straight into the review
flow for a tool with one click — without adding a second modal/review system.
Category, subcategory, and tag rows are unaffected.

## Design

### 1. Dropdown markup (`js/app.js`, `renderAutocomplete`)

For items where `item.type === 'tool'` only, render a small icon-only button
(✍️, `aria-label="Write a review for {name}"`, class `review-quick-btn`) right
after the tool name, inside `.autocomplete-item-name`. Category, subcategory,
and tag rows keep their current markup unchanged — no button is added for
those types.

### 2. Click handling

A delegated click listener on `autocompleteDropdown` checks for a
`.review-quick-btn` target before the existing item-select handler runs. On
match:

- `e.stopPropagation()` so the row's normal select/navigate handler does not
  also fire.
- Close the dropdown.
- Navigate to `/tools/{slug}/?review=1` via `window.SpaRouter.navigate`,
  falling back to `location.href` (same fallback pattern already used for
  plain tool navigation in `selectAutocompleteItem`).

Clicking anywhere else on the row keeps today's behavior: plain navigation to
the tool page, no modal auto-opened.

### 3. Auto-open on the tool page (`js/tool-page.js`)

At the end of `initReviews`, after modals are injected and
`setupReviewFormHandlers()` / `setupAuthHandlers()` have run (this happens on
all three branches: tool not yet in DB, tool in DB with no reviews yet, tool
in DB with reviews): check
`new URLSearchParams(location.search).get('review') === '1'`. If set:

- Strip it from the URL via `history.replaceState` so a refresh or back
  navigation doesn't re-trigger it.
- Programmatically call `.click()` on `#leave-review-btn`.

`#leave-review-btn` exists in all three render branches and its existing click
handler already does everything needed: auth-gate (opens the sign-in modal and
sets `pendingReviewOpen` if the user isn't logged in), "already reviewed"
detection (shows the existing-review modal instead), and opening the review
form. No new modal code or duplicated Supabase lookups are introduced.

### Edge cases

- If the reviews section fails to load (`reviewsSection.hidden = true` early
  returns in `initReviews`), the `?review=1` param is simply never consumed —
  nothing breaks. It stays in the URL as a harmless no-op param in that rare
  failure case.
- The button is computed fresh on every `renderAutocomplete` call from
  `item.type`, so there's no stale state across repeated searches.

## Out of scope

- No changes to category/subcategory/tag rows.
- No new review modal or standalone review UI outside the tool page.
- No change to the existing auth-gate, existing-review, or submission logic
  in `tool-page.js` — it's reused as-is via the simulated button click.
