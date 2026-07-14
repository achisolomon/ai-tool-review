# Search Dropdown Quick-Review Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small "write a review" button to tool rows (and only tool rows) in the search autocomplete dropdown that jumps straight to the tool's review flow.

**Architecture:** `js/app.js`'s `renderAutocomplete()` gains a per-row button rendered only when `item.type === 'tool'`; a delegated click handler intercepts clicks on that button before the existing row-select handler runs and navigates to `/tools/{slug}/?review=1`. `js/tool-page.js`'s `initReviews()` detects that query param after it finishes rendering the reviews UI and modals, strips it from the URL, and programmatically clicks the existing `#leave-review-btn`, which already handles the auth-gate / already-reviewed / open-form logic. No new modal system is introduced.

**Tech Stack:** Vanilla JS (no framework), Jekyll static site, Supabase (reviews/auth), Playwright for e2e tests.

---

## File Structure

- Modify: `js/app.js` — `renderAutocomplete()` markup, autocomplete click delegation
- Modify: `css/style.css` — layout for the new button inside `.autocomplete-item-name`
- Modify: `js/tool-page.js` — new `maybeAutoOpenReview()` helper + 3 call sites in `initReviews()`
- Modify: `tests/autocomplete.spec.js` — button visibility/scoping + click-navigates test
- Modify: `tests/reviews.spec.js` — auto-open-on-`?review=1` tests

No new files are needed; this is a small, single-subsystem change.

---

### Task 1: Render the review button on tool rows only

**Files:**
- Modify: `js/app.js:507-539` (the `items.forEach` loop inside `renderAutocomplete`)
- Modify: `css/style.css:1877-1895` (`.autocomplete-item-content` / `.autocomplete-item-name`)
- Test: `tests/autocomplete.spec.js`

- [ ] **Step 1: Write the failing test**

Add this to `tests/autocomplete.spec.js`, inside `test.describe('Category/Subcategory Selection', ...)` (right after the existing `'clicking a tool navigates to tool page'` test, before its closing `});` at line 194):

```javascript
        test('shows a review button on tool rows but not category/subcategory rows', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('cursor');
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            const toolItem = dropdown.locator('.autocomplete-item[data-type="tool"]').first();
            if (await toolItem.count() > 0) {
                await expect(toolItem.locator('.review-quick-btn')).toBeVisible();
            }

            const nonToolItem = dropdown.locator('.autocomplete-item:not([data-type="tool"])').first();
            if (await nonToolItem.count() > 0) {
                await expect(nonToolItem.locator('.review-quick-btn')).toHaveCount(0);
            }
        });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/autocomplete.spec.js -g "shows a review button"`
Expected: FAIL — `.review-quick-btn` not found (0 matches where 1 expected).

- [ ] **Step 3: Add the button markup in `renderAutocomplete`**

In `js/app.js`, replace the `items.forEach` body (currently lines 507-539):

```javascript
        items.forEach((item, index) => {
            // Add section headers (only when not in browse mode)
            if (!isBrowseMode && item.type !== currentSection) {
                currentSection = item.type;
                const sectionLabel = item.type === 'category' ? 'Categories' :
                                    item.type === 'subcategory' ? 'Subcategories' :
                                    item.type === 'tag' ? 'Tags' : 'Tools';
                html += `<div class="autocomplete-section-header">${sectionLabel}</div>`;
            }

            const icon = item.type === 'category' ? '📁' :
                        item.type === 'subcategory' ? '📂' :
                        item.type === 'tag' ? '🏷️' : '🔧';

            const meta = item.type === 'tool'
                ? `${item.subcategoryName} • ${item.categoryName}`
                : item.type === 'subcategory'
                    ? `${item.categoryName} • ${item.toolCount} tools`
                    : item.type === 'tag'
                        ? `${item.toolCount} tools with this tag`
                        : `${item.toolCount} tools`;

            const reviewButton = item.type === 'tool'
                ? `<button type="button" class="review-quick-btn" data-index="${index}" aria-label="Write a review for ${item.name}" title="Write a review">✍️</button>`
                : '';

            html += `
                <div class="autocomplete-item" data-index="${index}" data-type="${item.type}">
                    <span class="autocomplete-item-icon">${icon}</span>
                    <div class="autocomplete-item-content">
                        <div class="autocomplete-item-name-row">
                            <div class="autocomplete-item-name">${item.name}</div>
                            ${reviewButton}
                        </div>
                        <div class="autocomplete-item-meta">${meta}</div>
                    </div>
                    <span class="autocomplete-item-type ${item.type}">${item.type}</span>
                </div>
            `;
        });
```

- [ ] **Step 4: Add CSS for the button and its row wrapper**

In `css/style.css`, replace the existing `.autocomplete-item-name` rule (currently lines 1882-1889):

```css
.autocomplete-item-name-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.autocomplete-item-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--vscode-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1;
}

.review-quick-btn {
    flex-shrink: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    line-height: 1;
    padding: 2px 4px;
    border-radius: 3px;
    opacity: 0.7;
    transition: opacity 0.15s ease, background 0.15s ease;
}

.review-quick-btn:hover,
.review-quick-btn:focus-visible {
    opacity: 1;
    background: var(--vscode-list-hover);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx playwright test tests/autocomplete.spec.js -g "shows a review button"`
Expected: PASS

- [ ] **Step 6: Run the full autocomplete suite to check for regressions**

Run: `npx playwright test tests/autocomplete.spec.js`
Expected: All PASS (the pre-existing tests don't reference `.autocomplete-item-name`'s exact DOM depth, so wrapping it in `.autocomplete-item-name-row` should not break them)

- [ ] **Step 7: Commit**

```bash
git add js/app.js css/style.css tests/autocomplete.spec.js
git commit -m "Add review button to tool rows in search dropdown"
```

---

### Task 2: Clicking the review button navigates to the tool page with `?review=1`

**Files:**
- Modify: `js/app.js:1089-1098` (the `autocompleteDropdown.addEventListener('click', ...)` handler)
- Test: `tests/autocomplete.spec.js`

- [ ] **Step 1: Write the failing test**

Add to `tests/autocomplete.spec.js`, right after the test added in Task 1:

```javascript
        test('clicking the review button navigates to the tool page with ?review=1', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('cursor');
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            const reviewBtn = dropdown.locator('.review-quick-btn').first();
            if (await reviewBtn.count() > 0) {
                await reviewBtn.click();
                await expect(page).toHaveURL(/\/tools\/.*\/\?review=1/);
            }
        });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/autocomplete.spec.js -g "clicking the review button"`
Expected: FAIL — clicking `.review-quick-btn` currently falls through to the row's own click handler (`selectAutocompleteItem`), which navigates to `/tools/{slug}/` with no `?review=1`, or the URL assertion times out.

- [ ] **Step 3: Add click interception for the review button**

In `js/app.js`, replace the autocomplete click handler (currently lines 1089-1098):

```javascript
        // Autocomplete item click
        autocompleteDropdown.addEventListener('click', (e) => {
            const reviewBtn = e.target.closest('.review-quick-btn');
            if (reviewBtn) {
                e.stopPropagation();
                const index = parseInt(reviewBtn.dataset.index, 10);
                const item = autocompleteItems[index];
                if (item && item.type === 'tool') {
                    autocompleteDropdown.classList.add('hidden');
                    const url = `/tools/${item.slug}/?review=1`;
                    if (window.SpaRouter) { window.SpaRouter.navigate(url); }
                    else { window.location.href = url; }
                }
                return;
            }

            const item = e.target.closest('.autocomplete-item');
            if (item) {
                const index = parseInt(item.dataset.index, 10);
                if (autocompleteItems[index]) {
                    selectAutocompleteItem(autocompleteItems[index]);
                }
            }
        });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/autocomplete.spec.js -g "clicking the review button"`
Expected: PASS

- [ ] **Step 5: Run the full autocomplete suite to check for regressions**

Run: `npx playwright test tests/autocomplete.spec.js`
Expected: All PASS, including `'clicking a tool navigates to tool page'` (that test clicks the row itself, not the button, so it's unaffected)

- [ ] **Step 6: Commit**

```bash
git add js/app.js tests/autocomplete.spec.js
git commit -m "Navigate with ?review=1 when the dropdown review button is clicked"
```

---

### Task 3: Auto-open the review flow on the tool page when `?review=1` is present

**Files:**
- Modify: `js/tool-page.js:1-43` (add `maybeAutoOpenReview` helper near the other module-level helpers)
- Modify: `js/tool-page.js:145-148`, `:223-225`, `:246-249` (call the helper at the end of each of the 3 `initReviews` branches)
- Test: `tests/reviews.spec.js`

- [ ] **Step 1: Write the failing test**

Add to `tests/reviews.spec.js`, inside `test.describe('Authentication Flow', ...)` (right after the `'Leave a Review button opens auth modal when not logged in'` test, i.e. after line 233):

```javascript
    test('?review=1 auto-opens the auth modal when not logged in, and cleans up the URL', async ({ page }) => {
      await page.goto('/tools/claude-code/?review=1');
      await page.waitForSelector('#leave-review-btn', { timeout: 10000 }).catch(() => null);

      const leaveReviewBtn = page.locator('#leave-review-btn');
      const authModal = page.locator('#auth-modal');

      if (await leaveReviewBtn.count() > 0) {
        // Auth modal should auto-open without any click from the test
        await expect(authModal).toHaveClass(/active/, { timeout: 10000 });

        // The ?review=1 param should be stripped so refresh/back doesn't retrigger it
        await expect(page).not.toHaveURL(/review=1/);
      }
    });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/reviews.spec.js -g "auto-opens the auth modal"`
Expected: FAIL — `#auth-modal` never gets the `active` class because nothing reads `?review=1` yet.

- [ ] **Step 3: Add the `maybeAutoOpenReview` helper**

In `js/tool-page.js`, add this function after `resetReviewModals` (i.e. right after the closing `}` at line 43, before the `initReviews` comment block):

```javascript
  // If the page was reached via a "?review=1" deep link (e.g. the search
  // dropdown's quick-review button), auto-click the Leave a Review button
  // once it exists, then strip the param so refresh/back doesn't re-fire it.
  // Reuses #leave-review-btn's own click handler for auth-gating / existing-
  // review detection — no separate open-modal code path.
  function maybeAutoOpenReview() {
    var params = new URLSearchParams(location.search);
    if (params.get('review') !== '1') return;

    params.delete('review');
    var qs = params.toString();
    var newUrl = location.pathname + (qs ? '?' + qs : '') + location.hash;
    history.replaceState(history.state, '', newUrl);

    var btn = document.getElementById('leave-review-btn');
    if (btn) btn.click();
  }
```

- [ ] **Step 4: Call the helper at the end of each `initReviews` branch**

In `js/tool-page.js`, in the "tool not in DB yet" branch, change (currently around line 145-148):

```javascript
        // Setup all handlers
        setupReviewFormHandlers();
        setupAuthHandlers();
        return;
```

to:

```javascript
        // Setup all handlers
        setupReviewFormHandlers();
        setupAuthHandlers();
        maybeAutoOpenReview();
        return;
```

In the "tool has reviews" branch, change (currently around line 223-225):

```javascript
        // Setup all handlers
        setupReviewFormHandlers();
        setupAuthHandlers();
      } else {
```

to:

```javascript
        // Setup all handlers
        setupReviewFormHandlers();
        setupAuthHandlers();
        maybeAutoOpenReview();
      } else {
```

In the "tool exists, no reviews yet" branch, change (currently around line 246-249):

```javascript
        // Setup all handlers
        setupReviewFormHandlers();
        setupAuthHandlers();
      }
    } catch (err) {
```

to:

```javascript
        // Setup all handlers
        setupReviewFormHandlers();
        setupAuthHandlers();
        maybeAutoOpenReview();
      }
    } catch (err) {
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx playwright test tests/reviews.spec.js -g "auto-opens the auth modal"`
Expected: PASS

- [ ] **Step 6: Run the full reviews suite to check for regressions**

Run: `npx playwright test tests/reviews.spec.js`
Expected: All PASS (existing tests never set `?review=1`, so `maybeAutoOpenReview` is a no-op for them)

- [ ] **Step 7: Commit**

```bash
git add js/tool-page.js tests/reviews.spec.js
git commit -m "Auto-open review flow on tool page when ?review=1 is present"
```

---

### Task 4: End-to-end integration test (search → click → review flow opens)

**Files:**
- Test: `tests/autocomplete.spec.js`

This closes the loop: verify the full path from typing in the search box to the review flow opening on the destination tool page, not just the two halves in isolation.

- [ ] **Step 1: Write the test**

Add to `tests/autocomplete.spec.js`, right after the test added in Task 2:

```javascript
        test('full flow: search, click review button, lands on tool page with review flow open', async ({ page }) => {
            const searchInput = page.locator('#action-input');
            const dropdown = page.locator('#autocomplete-dropdown');

            await searchInput.fill('claude code');
            await expect(dropdown).not.toHaveClass(/hidden/, { timeout: 10000 });

            const toolItem = dropdown.locator('.autocomplete-item[data-type="tool"]').first();
            if (await toolItem.count() > 0) {
                await toolItem.locator('.review-quick-btn').click();

                await expect(page).toHaveURL(/\/tools\/claude-code\//);

                const authModal = page.locator('#auth-modal');
                await expect(authModal).toHaveClass(/active/, { timeout: 10000 });
            }
        });
```

- [ ] **Step 2: Run the test**

Run: `npx playwright test tests/autocomplete.spec.js -g "full flow"`
Expected: PASS. This exercises Tasks 1-3 together; if it fails, re-check that `item.slug` on the `tool` search result matches the `claude-code` route (see `js/app.js`'s `searchByIntent`, which sets `slug: tool.slug || generateSlug(tool.name)`).

- [ ] **Step 3: Run the entire search test suite**

Run: `npm run test:search`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add tests/autocomplete.spec.js
git commit -m "Add end-to-end test for search dropdown quick-review flow"
```

---

## Final Verification

- [ ] Run `npx playwright test tests/autocomplete.spec.js tests/reviews.spec.js tests/tool-page.spec.js` — all PASS
- [ ] Manually verify in a browser: open `/`, type a tool name (e.g. "cursor"), confirm the ✍️ button appears only on tool rows (not on category/subcategory/tag rows in browse mode or filtered results), click it, and confirm you land on the tool's page with either the review form (if signed in) or the sign-in modal (if not) already open.
