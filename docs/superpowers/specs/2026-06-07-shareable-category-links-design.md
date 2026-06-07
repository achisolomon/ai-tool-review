# Shareable Search Links Design

**Date:** 2026-06-07
**Status:** Approved

## Overview

Add the ability to share links to search results, categories, or subcategories on the AI Tool Review homepage. When a user searches for "RAG tools" or selects the "Agent Frameworks" category, they can copy a shareable URL that, when opened, shows the same results.

## Use Case

**Discovery sharing:** A user searches or filters tools, then shares the link with a colleague so they see the same results immediately.

## Scope

- **Page:** Homepage (`index.html`) search results only
- **Share UI:** Copy Link button (no social network buttons)
- **Not in scope:** Landscape page sharing, custom tool collections, social meta tags

## URL Structure

### Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `q` | `?q=RAG+tools` | Free-text search query |
| `category` | `?category=agent-frameworks` | Filters to a main category |
| `subcategory` | `?subcategory=rag` | Filters to a specific subcategory |

### Examples

```
https://aitoolreview.com/?q=code+assistant
https://aitoolreview.com/?category=foundation-models
https://aitoolreview.com/?subcategory=code-assistants
```

### Rules

- Only one filter active at a time
- Precedence if multiple params present: `subcategory` > `category` > `q`
- Category/subcategory IDs come from the existing `id` field in `landscapeData`
- Invalid/unknown category IDs show "No tools found" (existing empty state)
- Search queries with no matches show "No tools found"

## UI Design

### Copy Link Button Placement

The Copy Link button appears in the **results header**, next to the tool count:

```
┌─────────────────────────────────────────────────────┐
│  12 tools found              [Copy Link]   [Clear]  │
└─────────────────────────────────────────────────────┘
```

- Button style: outlined, accent color (`#4a9eff`), with link icon
- Only visible when results are showing (search performed or category/subcategory selected)

### Copy Feedback

1. User clicks "Copy Link"
2. URL copied to clipboard via `navigator.clipboard.writeText()`
3. Button text changes to "Copied!" with checkmark icon
4. After 1.5 seconds, reverts to "Copy Link"

## Interaction Flow

### User Performs Free-Text Search

1. User types in search box and presses Enter (or pauses typing)
2. Results grid populates with matching tools (existing behavior)
3. URL updates via `history.pushState()` to include `?q=search+term`
4. Results header shows tool count + Copy Link button + Clear button

### User Selects Category from Autocomplete

1. Results grid populates with tools (existing behavior)
2. URL updates via `history.pushState()` to include `?category=xxx` or `?subcategory=xxx`
3. Results header shows tool count + Copy Link button + Clear button

### User Opens Shared Link

1. Page loads
2. JavaScript reads `URLSearchParams` on `DOMContentLoaded`
3. Check params in order of precedence (`subcategory` > `category` > `q`):
   - **For category/subcategory:** Look up display name from `landscapeData`, populate search input, trigger filter
   - **For search query (`q`):** Populate search input with the query string, trigger search
4. Update page title to "{Search Term} - AI Tool Review"
5. Display results with Copy Link button visible

### User Clears Filter

1. User clicks "Clear" button or presses Escape
2. Results hide, search input clears
3. URL reverts to `/` via `history.pushState()` (removes query params)

### Browser Navigation

- `popstate` event listener syncs UI with URL changes
- Back/forward buttons navigate through filter history

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `js/app.js` | URL param reading, `pushState` updates, Copy Link logic |
| `css/style.css` | Copy Link button styles, copied state |
| `index.html` | Add Copy Link button to results header markup |

### Key Functions

```javascript
// Read URL params on page load
function initFromURL() {
  const params = new URLSearchParams(window.location.search);
  const subcategory = params.get('subcategory');
  const category = params.get('category');
  const query = params.get('q');

  // Check in order of precedence
  if (subcategory) {
    // Trigger subcategory filter...
  } else if (category) {
    // Trigger category filter...
  } else if (query) {
    // Trigger search with query...
  }
}

// Update URL when filter/search changes
function updateURL(type, value) {
  const url = new URL(window.location);
  url.searchParams.delete('category');
  url.searchParams.delete('subcategory');
  url.searchParams.delete('q');
  if (value) {
    url.searchParams.set(type, value);
  }
  history.pushState({}, '', url);
}

// Copy current URL to clipboard
async function copyLink() {
  await navigator.clipboard.writeText(window.location.href);
  // Show "Copied!" feedback...
}
```

### Browser Support

- `navigator.clipboard.writeText()` — supported in all modern browsers
- Fallback for older browsers: create temporary textarea, `execCommand('copy')`

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Invalid category ID | Show "No tools found" empty state |
| Multiple params present | Precedence: `subcategory` > `category` > `q` |
| Direct navigation to `/?q=term` | Works — search applied on load |
| Empty search query `?q=` | Ignored, shows default homepage |
| Special characters in query | URL-encoded automatically (spaces become `+` or `%20`) |
| Very long search query | Truncated in page title if needed |
| Mobile browsers | Same behavior, clipboard API works |
| Very narrow screens | Copy Link button may wrap below count |

## Success Criteria

1. Searching updates the URL with `?q=` parameter without page reload
2. Selecting a category updates the URL with `?category=` or `?subcategory=`
3. Shared URLs open directly to the same search/filtered view
4. Copy Link button copies URL and shows feedback
5. Browser back/forward works correctly
6. Clear button removes filter and URL params
