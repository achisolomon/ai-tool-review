# Search Test Plan

Covers the homepage search experience end-to-end: the autocomplete **dropdown**, the **results grid**, and the **URL state**, for every entity type (tags, categories, subcategories, tools).

All tests are implemented in Playwright and run automatically:

| Stage | What runs | Where |
|---|---|---|
| **pre-commit** (husky) | data validation + regenerate + data-integrity + search specs | `.husky/pre-commit` |
| **pre-push** (husky) | full Playwright suite against a fresh Jekyll build | `.husky/pre-push` |
| **CI** (GitHub Actions) | full validation + build + full Playwright suite, on every push & PR to `main` | `.github/workflows/test.yml` |

## Test files

| File | Scope | Browser? |
|---|---|---|
| `tests/data-integrity.spec.js` | data.js invariants the UI depends on | No (ms-fast) |
| `tests/search-consistency.spec.js` | dropdown ↔ results ↔ URL consistency | Yes |
| `tests/search.spec.js` | basic search UI behaviours (pre-existing) | Yes |
| `tests/autocomplete.spec.js` | dropdown UI behaviours (pre-existing) | Yes |
| `tests/shareable-links.spec.js` | deep-link behaviours (pre-existing) | Yes |

## Design principles

1. **Data-driven, not hardcoded.** Expectations are computed from `js/data.js` at test load time. Adding/removing tools never requires test edits; the suite checks whatever ships.
2. **Exhaustive where cheap, sampled where expensive.** Data invariants cover *all* tools/tags. Browser click-throughs cover **all 20 categories**, **all subcategories**, and a deterministic sample of tags and tools (plus named regression cases).
3. **Zero first-party page errors.** Every browser test fails on any uncaught page error (third-party AdSense/GTM noise is filtered). The original bug (`showSearchResults is not defined`) would have been caught by this guard alone.

## Coverage matrix

### 1. Data integrity (`data-integrity.spec.js` — exhaustive)
- users/developers tracks exist and are non-empty
- every tool has `name`, `slug`, `desc`, `type`, `url`
- no duplicate slugs within a subcategory
- no duplicate slugs across the dataset (cross-listings are a conscious decision — see note in the spec)
- category/subcategory ids unique, names present
- tags are lowercase, hyphen-separated, non-empty
- for every tag: occurrence count == unique-tool count (dropdown count == rendered count)

### 2. Tag flows (`search-consistency.spec.js`)
For each tested tag (regression tags + cross-listing-sensitive tags + deterministic sample of 12):
- typing the tag name shows the tag in the dropdown
- dropdown meta shows the **exact** tool count from data
- clicking the tag renders **exactly** those tools (names compared as sets)
- no duplicate cards
- URL becomes `?tag=<slug>` (shareable)
- zero page errors

Plus:
- `?tag=` deep link renders the same tools as clicking
- `?tag=a,b` multi-tag deep link applies AND logic

**Named regressions:** `skills-catalog` (tag click did nothing — `showSearchResults` undefined), `voice-ai` / `unified-communications` / `no-code` (counts were inflated by cross-listed tools).

### 3. Category flows (all 20 categories)
- dropdown shows the category with the exact deduped tool count
- clicking renders exactly that many cards, all belonging to the category
- URL becomes `?category=<id>`
- `?category=` deep link renders correct tools
- invalid `?category=` shows the empty state without crashing
- zero page errors

### 4. Subcategory flows (all subcategories)
- dropdown shows the subcategory with `<parent category> • <N> tools`
- disambiguates same-named subcategories by parent category in the meta line
- clicking renders exactly N cards, all in that subcategory
- URL becomes `?subcategory=<id>`
- `?subcategory=` deep link renders correct tools
- invalid `?subcategory=` shows the empty state without crashing
- zero page errors

### 5. Tool flows (deterministic sample of 10)
- typing the tool name shows it in the dropdown with correct subcategory meta
- clicking navigates to `/tools/<slug>/`
- free-text search shows the tool **exactly once** (dedupe guard)
- named regression: `ringcentral` cross-listing must never produce two cards

### 6. Keyboard navigation
- ArrowDown + Enter on a dropdown tag item applies the same filter as a click (results + URL)

## Bugs this plan was built around (fixed 2026-06-12)

1. **Tag click dead** — `showSearchResults()` was never defined (`js/app.js`); every tag click threw `ReferenceError` and left stale fuzzy results on screen.
2. **Duplicate cards / inflated counts** — tools cross-listed via `additional_categories` (RingCentral, Voiceflow) appeared twice in results and inflated 12 tags' dropdown counts; search paths now dedupe by slug.
3. **Homepage TypeError** — `admin-api.js` assumed `window.SupabaseClient` exists; pages that don't load `supabase-client.js` threw on every load.
4. **Debounce race** — clicking a dropdown item didn't cancel the pending 250 ms debounced text search, which could fire afterwards and overwrite the clicked filter's results and URL.

## Running locally

```bash
npm run test:search   # data-integrity + search/autocomplete/shareable-links specs
npm test              # full suite
npx playwright test tests/search-consistency.spec.js --headed   # watch it
```

Requires the Jekyll build to be current (`bundle exec jekyll build`, or keep `jekyll serve --port 8080` running — Playwright reuses it).
