# Shareable Category Links Design

**Date:** 2026-06-07
**Status:** Approved

## Overview

Add the ability to share links to specific categories or subcategories on the AI Tool Review homepage. When a user finds a category like "Agent Frameworks", they can copy a shareable URL that, when opened, shows the same filtered view.

## Use Case

**Discovery sharing:** A user searches and finds a category/subcategory of tools, then shares the link with a colleague so they see the same filtered results immediately.

## Scope

- **Page:** Homepage (`index.html`) search results only
- **Share UI:** Copy Link button (no social network buttons)
- **Not in scope:** Landscape page sharing, custom tool collections, social meta tags

## URL Structure

### Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `category` | `?category=agent-frameworks` | Filters to a main category |
| `subcategory` | `?subcategory=rag` | Filters to a specific subcategory |

### Examples

```
https://aitoolreview.com/?category=foundation-models
https://aitoolreview.com/?subcategory=code-assistants
```

### Rules

- Only one filter active at a time
- If both parameters present, `subcategory` takes precedence (more specific)
- IDs come from the existing `id` field in `landscapeData`
- Invalid/unknown IDs show "No tools found" (existing empty state)

## UI Design

### Copy Link Button Placement

The Copy Link button appears in the **results header**, next to the tool count:

```
┌─────────────────────────────────────────────────────┐
│  12 tools found              [Copy Link]   [Clear]  │
└─────────────────────────────────────────────────────┘
```

- Button style: outlined, accent color (`#4a9eff`), with link icon
- Only visible when results are showing (category/subcategory selected or search performed)

### Copy Feedback

1. User clicks "Copy Link"
2. URL copied to clipboard via `navigator.clipboard.writeText()`
3. Button text changes to "Copied!" with checkmark icon
4. After 1.5 seconds, reverts to "Copy Link"

## Interaction Flow

### User Selects Category from Autocomplete

1. Results grid populates with tools (existing behavior)
2. URL updates via `history.pushState()` to include `?category=xxx` or `?subcategory=xxx`
3. Results header shows tool count + Copy Link button + Clear button

### User Opens Shared Link

1. Page loads
2. JavaScript reads `URLSearchParams` on `DOMContentLoaded`
3. If `category` or `subcategory` param exists:
   - Look up the display name from `landscapeData` (e.g., ID `agent-frameworks` → display name "Agent Frameworks")
   - Populate search input with the display name
   - Trigger filter to show matching tools
   - Update page title to "Agent Frameworks - AI Tool Review"
   - Display results with Copy Link button visible

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
  const category = params.get('category');
  const subcategory = params.get('subcategory');
  // Trigger appropriate filter...
}

// Update URL when filter changes
function updateURL(type, id) {
  const url = new URL(window.location);
  url.searchParams.delete('category');
  url.searchParams.delete('subcategory');
  if (id) {
    url.searchParams.set(type, id);
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
| Both params present | `subcategory` takes precedence |
| Direct navigation to `/?category=x` | Works — filter applied on load |
| Mobile browsers | Same behavior, clipboard API works |
| Very narrow screens | Copy Link button may wrap below count |

## Success Criteria

1. Selecting a category updates the URL without page reload
2. Shared URLs open directly to the filtered view
3. Copy Link button copies URL and shows feedback
4. Browser back/forward works correctly
5. Clear button removes filter and URL params
