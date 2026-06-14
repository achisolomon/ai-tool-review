# Suggestion Flow — "Keep It Simple" UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make community suggestions simple from the user's side — one obvious "Suggest an edit" button per tool, behind it a short form with populated dropdowns, no hand-typed slugs or taxonomy targets, and no clutter.

**Architecture:** Vanilla JS, no framework. **No inline pencils, no new affordances.** Keep the existing single entry points (the landscape "+ Suggest" button and the per-tool "Suggest an edit" button → the existing modal + mode chooser). All improvements are *inside* the existing forms: fix empty dropdowns, drop the slug field, make placement optional, turn the rename target into a dropdown, and remove the "No reviews yet" placeholder.

**Tech Stack:** Vanilla ES, Playwright (`tests/*.spec.js`), Node test runner (`scripts/*.test.mjs`), Ruby/`yaml` apply pipeline.

---

## Direction change (from the maintainer)

The earlier draft proposed per-field hover pencils + inline editors. **Rejected as too complex for users.** New direction:

- **One button per tool**, opening the existing modal/chooser. No pencils, no inline editors, no new `js/inline-edit.js`.
- Simplicity lives in the **form**, not in scattered UI.
- "Simple form" (not mobile-first), but keep single-column and don't break mobile.

**Scope kept (4 items):** #2 populate dropdowns, #6 rename dropdown, #5 drop slug + optional placement, #4 remove "No reviews yet". #1/#3 capability (move-retag, fix-details) stays, reached via the existing button — no inline UI.

**Scope dropped vs prior draft:** `js/inline-edit.js`, hover pencils on taxonomy/detail fields, the in-place inline editor, the preview-behind-gate task. Auth gate and rationale-required stay as-is.

---

## UX baseline (verified against live :8080)

15 screenshots captured of every surface. What's actually wrong, and the fix:

| # | Friction (observed) | Fix | Task |
|---|---------------------|-----|------|
| F4 | Taxonomy dropdowns render **empty** off the landscape page (tool page never loads `data.js` → `window.landscapeData` undefined) | Load `data.js` where the modal lives (#2) | Task 1 |
| F3 | New-tool form asks for a regex-validated **slug** | Remove the field; derive at apply time (#5) | Task 2 |
| F7 | New-tool placement is a buried/collapsed afterthought | Surface category/subcat/tags as **optional** fields (#5) | Task 2 |
| F6 | Taxonomy rename uses a **free-text** "current name" | Populated **dropdown** of existing objects (#6) | Task 3 |
| F8 | "No reviews yet" placeholder clutter | Remove it (#4) | Task 4 |

That's the whole change set. Four tasks, all inside existing files.

---

## File Structure

| File | Responsibility | Action |
|------|---------------|--------|
| `_layouts/tool.html` | Load `data.js` so the modal's dropdowns populate; remove "No reviews yet" | Modify |
| `js/suggest.js` | Remove slug field + wiring; make placement always-visible & optional; rename target → dropdown + cascade | Modify |
| `js/suggest-logic.js` | `buildPayload('new_tool')` derives slug (already does); new `taxonomyObjects(taxonomy, kind)` helper for the rename dropdown | Modify |
| `scripts/apply-suggestions.mjs` | Defensive slug fallback in `applyNewTool` | Modify (1 line) |
| `js/review-components.js` | Remove "No reviews yet" list placeholder | Modify |
| `tests/suggest.spec.js`, `tests/suggest-logic.spec.js`, `tests/tool-page.spec.js`, `scripts/apply-suggestions.test.mjs` | Tests for each change | Modify |

No new files.

---

## Task 1: Fix empty taxonomy dropdowns (#2) — load data.js on the tool page

**Root cause (verified):** `_layouts/tool.html` never loads `js/data.js`, so `window.landscapeData` is undefined and every category/subcategory/tag select in the modal renders only its placeholder. `data.js` (since commit 3a0b62d) sets `window.landscapeData = landscapeData`.

**Files:**
- Modify: `_layouts/tool.html` (script includes block, ~line 233-245)
- Test: `tests/tool-page.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/tool-page.spec.js — add inside the existing describe
test('tool page exposes window.landscapeData with taxonomy (populates suggest dropdowns)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
  await page.goto('/tools/cursor', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.landscapeData !== 'undefined', { timeout: 8000 });
  const cats = await page.evaluate(() => Object.keys(window.landscapeData?.taxonomy?.categories || {}));
  expect(cats).toContain('developers');
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx playwright test tests/tool-page.spec.js -g "populates suggest dropdowns" --workers=1`
Expected: FAIL — `window.landscapeData` never defined (timeout).

- [ ] **Step 3: Add the data.js include to tool.html**

In `_layouts/tool.html`, immediately BEFORE the `suggest.js` include (`<script src="{{ '/js/suggest.js' | relative_url }}"></script>`), add:

```html
  <!-- Taxonomy data so the suggest modal's category/subcategory/tag dropdowns populate -->
  <script src="{{ '/js/data.js' | relative_url }}"></script>
```

- [ ] **Step 4: Rebuild and re-run**

Run: `npm run generate && bundle exec jekyll build && npx playwright test tests/tool-page.spec.js -g "populates suggest dropdowns" --workers=1`
Expected: PASS.

- [ ] **Step 5: Manual visual check (ux-review Iron Law)**

With the server on :8080, open a tool page, click "Suggest an edit" → "Move or re-tag", and confirm the "Proposed subcategory" dropdown is now populated (not just "Select a subcategory…"). Screenshot it.

- [ ] **Step 6: Commit**

```bash
git add _layouts/tool.html tests/tool-page.spec.js
git commit -m "fix(suggest): load data.js on tool page so taxonomy dropdowns populate (#2)"
```

---

## Task 2: New-tool form — drop the slug, make placement/tags optional (#5)

Slug input is `js/suggest.js:451-457` (`#suggest-slug`) with auto-derive/validate wiring at ~585-606. The apply script already derives the slug from name (commit 5823a41); `buildPayload('new_tool')` is already `slug: f.slug || slugify(f.name)`. So removing the field is safe — the slug still gets set from the name.

**Files:**
- Modify: `js/suggest.js` (remove slug field + wiring; placement always-visible & not required), `scripts/apply-suggestions.mjs` (defensive fallback)
- Test: `tests/suggest.spec.js`, `scripts/apply-suggestions.test.mjs`

- [ ] **Step 1: Write the failing form test**

```javascript
// tests/suggest.spec.js — in the mocked-auth describe (reuse existing openNewToolForm helper, or inline the open steps)
test('3f: new-tool form has no slug field; category/subcategory/tags are optional', async ({ page }) => {
  await openNewToolForm(page); // open modal → pick "Add a missing tool" → Next
  await expect(page.locator('#suggest-slug')).toHaveCount(0);
  await expect(page.locator('#suggest-category')).toBeVisible();
  await expect(page.locator('#suggest-category')).not.toHaveAttribute('required', /.*/);
  await expect(page.locator('#suggest-subcategory')).not.toHaveAttribute('required', /.*/);
});
```

If `openNewToolForm` does not exist in the spec, add this helper near the top of the file:

```javascript
async function openNewToolForm(page) {
  await page.locator('#suggest-open').click();
  await page.locator('.suggest-radio-card[data-mode="new-tool"]').click();
  await page.locator('#suggest-chooser-next').click();
}
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx playwright test tests/suggest.spec.js -g "no slug field" --workers=1`
Expected: FAIL — `#suggest-slug` count is 1.

- [ ] **Step 3: Remove the slug field in `js/suggest.js`**

Delete the entire slug form group (the `<div class="suggest-form-group">` containing `id="suggest-slug"`, ~lines 451-457).

- [ ] **Step 4: Remove slug wiring in `js/suggest.js`**

In the new-tool wiring (~585-606): keep the `nameInput` `input` listener but remove the lines that read/set `slugInput` (the `const derived = slugify(...)` assignment) and delete the entire slug-pattern-validation listener block (`if (slugInput) { slugInput.addEventListener('input', ...) }`). In `wireNewToolSubmit`, remove the line that reads `#suggest-slug`; do not pass `slug` to `buildPayload` (it derives it).

- [ ] **Step 5: Make placement always-visible and optional in `renderPlacementSection`**

In `js/suggest.js` `renderPlacementSection` (~322-385): remove the `hidden` attribute on the `#suggest-subcategory-group` wrapper so category/subcategory show by default. Confirm none of `#suggest-track` / `#suggest-category` / `#suggest-subcategory` carry a `required` attribute. Add a hint line under the placement heading: `<div class="suggest-hint">Optional — leave blank and a reviewer will place it.</div>`

- [ ] **Step 6: Defensive slug fallback in `scripts/apply-suggestions.mjs`**

Change the first line of `applyNewTool`:

```javascript
export function applyNewTool(row, root, tax) {
  const baseSlug = row.payload.slug || slugify(row.payload.name);
  const finalSlug = slugWithSuffix(root, baseSlug);
  const renamed = finalSlug !== baseSlug;
  const fm = buildFrontmatter({ ...row, payload: { ...row.payload, slug: finalSlug } });
```

(Adjust the `renamed` comparison to `baseSlug` as shown.)

- [ ] **Step 7: Unit-test the apply fallback in `scripts/apply-suggestions.test.mjs`**

```javascript
test('applyNewTool derives slug from name when payload.slug is absent', () => {
  const root = mkTmpToolsTree();   // existing helper in this file
  const row = { kind: 'new_tool', public_credit: false, payload: {
    name: 'Brand New Tool', website: 'https://x.com', description: 'd',
    placement: { track: 'developers', category: 'ai-coding', subcategory: 'ai-ides' } } };
  const msg = applyNewTool(row, root, loadTaxonomy(root));
  assert.match(msg, /brand-new-tool/);
});
```

- [ ] **Step 8: Run the tests**

Run: `npm run test:apply && npm run generate && bundle exec jekyll build && npx playwright test tests/suggest.spec.js -g "no slug field" --workers=1`
Expected: PASS (both the unit test and the form test).

- [ ] **Step 9: Manual visual check**

On :8080, open the new-tool form. Confirm: no slug field, category/subcategory/tags visible and submittable when left blank. Screenshot.

- [ ] **Step 10: Commit**

```bash
git add js/suggest.js scripts/apply-suggestions.mjs scripts/apply-suggestions.test.mjs tests/suggest.spec.js
git commit -m "feat(suggest): drop user-facing slug; placement & tags optional on new-tool (#5)"
```

---

## Task 3: Taxonomy rename — populated dropdown of existing objects (#6)

The rename op (`js/suggest.js:951-972`) uses a free-text `#taxop-target`. Replace it with a `<select>` populated from the taxonomy, cascading off `#taxop-target-kind` (category | subcategory | tag).

**Files:**
- Modify: `js/suggest-logic.js` (`taxonomyObjects` helper), `js/suggest.js` (rename field + cascade wiring)
- Test: `tests/suggest-logic.spec.js`, `tests/suggest.spec.js`

- [ ] **Step 1: Write the failing unit test for the helper**

```javascript
// tests/suggest-logic.spec.js
test('taxonomyObjects lists categories/subcategories/tags as {slug,label}', () => {
  const tax = { categories: { developers: { 'ai-coding': { name: 'AI Coding', subcategories: { 'ai-ides': { name: 'AI IDEs' } } } } },
                tags: { capabilities: [{ slug: 'reasoning', name: 'Reasoning' }] } };
  expect(window.SuggestLogic.taxonomyObjects(tax, 'category')).toContainEqual({ slug: 'ai-coding', label: 'AI Coding' });
  expect(window.SuggestLogic.taxonomyObjects(tax, 'subcategory')).toContainEqual({ slug: 'ai-ides', label: 'AI Coding › AI IDEs' });
  expect(window.SuggestLogic.taxonomyObjects(tax, 'tag')).toContainEqual({ slug: 'reasoning', label: 'Reasoning (capabilities)' });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx playwright test tests/suggest-logic.spec.js -g "taxonomyObjects" --workers=1`
Expected: FAIL — `taxonomyObjects` undefined.

- [ ] **Step 3: Add `taxonomyObjects` to `js/suggest-logic.js`**

```javascript
  function taxonomyObjects(taxonomy, kind) {
    const out = [];
    if (!taxonomy) return out;
    if (kind === 'category') {
      for (const cats of Object.values(taxonomy.categories || {}))
        for (const [slug, c] of Object.entries(cats || {})) out.push({ slug, label: c.name });
    } else if (kind === 'subcategory') {
      for (const cats of Object.values(taxonomy.categories || {}))
        for (const c of Object.values(cats || {}))
          for (const [slug, s] of Object.entries(c.subcategories || {})) out.push({ slug, label: `${c.name} › ${s.name}` });
    } else if (kind === 'tag') {
      for (const [family, tags] of Object.entries(taxonomy.tags || {}))
        if (Array.isArray(tags)) for (const t of tags) out.push({ slug: t.slug, label: `${t.name} (${family})` });
    }
    return out;
  }
```

Add `taxonomyObjects` to the `window.SuggestLogic = {...}` export object.

- [ ] **Step 4: Replace the rename free-text input with a dropdown in `js/suggest.js`**

In `renderTaxonomyOpForm`, the `op === 'rename'` branch — replace the `#taxop-target` text-input group with:

```html
        <div class="suggest-form-group">
          <label for="taxop-target">Which one? <span class="required">*</span></label>
          <select class="suggest-select" id="taxop-target" name="target" required disabled>
            <option value="">Select what to rename first…</option>
          </select>
          <div class="suggest-hint">Pick the existing item to rename.</div>
        </div>
```

(Keep the `#taxop-target-kind` select above it and the `#taxop-new-name` input below it unchanged.)

- [ ] **Step 5: Wire the cascade in `wireTaxonomyOpForm`**

Inside `js/suggest.js` `wireTaxonomyOpForm`, after `const form = modal.querySelector('#suggest-taxonomy-form')` and the early `if (!form) return;`, add:

```javascript
    const kindSel = form.querySelector('#taxop-target-kind');
    const targetSel = form.querySelector('#taxop-target');
    if (kindSel && targetSel && targetSel.tagName === 'SELECT') {
      kindSel.addEventListener('change', () => {
        const objs = window.SuggestLogic.taxonomyObjects(window.landscapeData && window.landscapeData.taxonomy, kindSel.value);
        targetSel.innerHTML = objs.length
          ? '<option value="">Select…</option>' + objs.map(o => `<option value="${o.slug}">${escapeHtml(o.label)} (${escapeHtml(o.slug)})</option>`).join('')
          : '<option value="">Select what to rename first…</option>';
        targetSel.disabled = !objs.length;
      });
    }
```

The submit handler already reads `#taxop-target`'s value into `payload.target` (line ~1059); it now receives a slug, which is exactly what `applyRename` expects.

- [ ] **Step 6: Write the form test**

```javascript
// tests/suggest.spec.js
test('3g: taxonomy rename target is a populated dropdown that cascades on kind', async ({ page }) => {
  await page.locator('#suggest-open').click();
  await page.locator('.suggest-radio-card[data-mode="taxonomy"]').click();
  await page.locator('#suggest-chooser-next').click();
  await page.locator('.suggest-radio-card[data-taxop="rename"]').click();
  await page.locator('#suggest-chooser-next').click();
  await page.selectOption('#taxop-target-kind', 'subcategory');
  const opts = await page.locator('#taxop-target option').count();
  expect(opts).toBeGreaterThan(1); // placeholder + real subcategories
  await expect(page.locator('#taxop-target')).toBeEnabled();
});
```

(If the rename sub-chooser uses a Next button with a different id, inspect and adjust the selector; the chooser uses `#suggest-chooser-next` per suggest.js.)

- [ ] **Step 7: Run tests, verify pass**

Run: `npm run generate && bundle exec jekyll build && npx playwright test tests/suggest-logic.spec.js tests/suggest.spec.js -g "taxonomyObjects|rename target" --workers=1`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add js/suggest.js js/suggest-logic.js tests/suggest.spec.js tests/suggest-logic.spec.js
git commit -m "feat(suggest): taxonomy rename picks target from a populated dropdown (#6)"
```

---

## Task 4: Remove "No reviews yet" (#4)

Three sites: `_layouts/tool.html:310-319`, `_layouts/tool.html:409-418`, `js/review-components.js:327-333`. Decision: remove the placeholder text only.

**Files:**
- Modify: `_layouts/tool.html`, `js/review-components.js`
- Test: `tests/tool-page.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
test('a tool with no reviews shows no "No reviews yet" text', async ({ page }) => {
  await page.goto('/tools/cursor', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await expect(page.getByText('No reviews yet')).toHaveCount(0);
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx playwright test tests/tool-page.spec.js -g "No reviews yet" --workers=1`
Expected: FAIL — text present.

- [ ] **Step 3: Remove the placeholder in `_layouts/tool.html` (both blocks)**

In both empty-state blocks (~310-319 and ~409-418), replace the `<h3>No reviews yet</h3>` + the "Be the first…" `<p>` with just the CTA:

```javascript
  summaryContainer.innerHTML = `
    <div class="review-summary-empty">
      <button class="btn-cta" id="leave-review-btn">Leave a Review</button>
    </div>
  `;
```

- [ ] **Step 4: Remove it in `js/review-components.js`**

Replace the empty branch (lines 327-333):

```javascript
function renderReviewList(reviews, toolName) {
    if (reviews.length === 0) {
        return '';
    }
```

- [ ] **Step 5: Run the test, verify it passes**

Run: `npm run generate && bundle exec jekyll build && npx playwright test tests/tool-page.spec.js -g "No reviews yet" --workers=1`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add _layouts/tool.html js/review-components.js tests/tool-page.spec.js
git commit -m "fix(reviews): remove 'No reviews yet' placeholder (#4)"
```

---

## Task 5: Full regression + report

- [ ] **Step 1: Run the suite (serially to avoid the known local parallel-worker contention)**

Run: `npm run test:apply && npm run validate && npm run validate:data && npx playwright test --workers=2`
Expected: suggestion + tool-page + suggest-logic specs pass; the 8 pre-existing `admin-suggestions` harness failures persist (documented in `docs/community-suggestions-merge-review.md` §6.3 — NOT regressions).

- [ ] **Step 2: Visual verification on :8080 (ux-review Iron Law)**

Screenshot: new-tool form (no slug, placement visible & optional), move/re-tag with a populated subcategory dropdown, taxonomy rename with a populated target dropdown, a tool page with no "No reviews yet". Confirm each.

- [ ] **Step 3: Append a UX section to the review report**

In `docs/community-suggestions-merge-review.md`, add "§7 UX simplification pass" documenting the 4 changes and the simpler decision (one button + simple form, no pencils). Note the friction win: new-tool form drops from 7 fields to 6 with the scariest (slug) gone; rename and placement are now click-to-pick instead of type-from-memory.

- [ ] **Step 4: Final commit**

```bash
git add docs/community-suggestions-merge-review.md
git commit -m "docs: UX simplification pass — populated dropdowns, no slug, no clutter"
```

---

## Self-Review

**Spec coverage:** #2 → Task 1; #5 → Task 2; #6 → Task 3; #4 → Task 4. #1/#3 capability retained via the existing "Suggest an edit" button + chooser (no code change needed — move-retag and fix-details forms already exist and work once Task 1 populates their dropdowns). The "keep it simple / no pencils" directive is satisfied by *not* building the inline-edit apparatus.

**Placeholder scan:** Every code step has concrete code; every run-command has an expected result. No TBD/TODO.

**Type/name consistency:** `window.SuggestLogic.taxonomyObjects(taxonomy, kind)` and `slugify` used consistently; `buildPayload('new_tool', {...})` already derives slug; `applyNewTool` fallback uses the same `slugify` already imported in apply-suggestions.mjs. `escapeHtml` is available in suggest.js scope (used throughout the file).

**Open risk:** Task 2 Step 4 — confirm the exact variable name of the slug input in the new-tool wiring (`slugInput` per recon) before deleting its listener, so the `nameInput` listener isn't broken. Task 3 Step 6 — confirm the rename sub-chooser advances via `#suggest-chooser-next` (it does per suggest.js:208).
