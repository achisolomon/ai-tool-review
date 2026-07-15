# Auto-linked Competitor Names in Comparison Tables — Design Spec

**Date:** 2026-07-14
**Status:** Pre-implementation (awaiting user review)
**Track:** First of three related ideas (this one; then *interviews*; then *complementary products* — each gets its own spec → plan → build cycle).

## Goal

In every tool page's **"How It Compares"** table, turn competitor names that
exist as pages in our own catalog into **internal links** to those pages
(`/tools/{slug}/`). Competitors not in the catalog stay as plain text. No `.md`
files are edited; the linking happens automatically at page-render time from the
already-loaded `landscapeData`.

### Why

- 383 of 448 tool pages have a comparison table; **0** competitor names are
  currently linked. Readers comparing tools hit dead ends where a live internal
  page already exists.
- Internal cross-linking improves navigation and on-site engagement.
- Doing it automatically (vs. hand-editing ~1000+ cells across 383 files) means
  it is maintenance-free and **self-improving**: when a new tool is added to the
  catalog, links to it appear in every existing comparison table automatically.

## Non-Goals (YAGNI)

- **No** external-website links (internal-only was the chosen direction).
- **No** editing of tool `.md` files.
- **No** build-time Jekyll plugin (client-side approach chosen).
- **No** change to `js/data.js` — so no `data-integrity` impact.
- **No** touching the 62 placeholder tables (`Competitor 1/2`) — nothing to link.
- **No** linking of table **body** cells (feature values), only header cells.

## Chosen Approach

**Client-side auto-linker.** A small module runs on every tool-page render,
reads the `landscapeData` object already loaded via `spa-scripts.html`, and
rewrites matching competitor names in comparison-table header rows into internal
links. It hooks into the existing idempotent `toolPageInit()` entry point in
`js/tool-page.js` (the same function the SPA router calls after every content
swap), so it works identically on direct load and after SPA navigation, and
re-running is a safe no-op.

## Correctness Guarantees (links always correct, never broken)

Brokenness is made **structurally impossible**, then verified by tests:

1. **hrefs are built only from `landscapeData` slugs**, never from scraped
   competitor text, using a single URL-template constant `/tools/{slug}/`.
   Because `js/data.js` is generated from the `.md` files, every slug in it has
   a live page — so a generated link cannot 404.
2. **Skip self by slug.** The matched slug is compared to the current page's
   slug (from the `#tool-data` island); a tool never links to itself, even if it
   appears in its own table under a name variant.
3. **Only pure-text header cells are transformed.** A header cell containing any
   child element (e.g. `<span class="highlight">`) is skipped, so the transform
   can only ever wrap a lone text node and can never corrupt table DOM.
4. **Header row only, never body.** Tool names live in the header; body cells
   are feature values. This removes an entire class of false positives.
5. **Ambiguity drop.** If two different tools normalize to the same key, that
   key is removed from the index and never linked (precision over coverage).
6. **Exact-normalized matching.** `Feature`, placeholders, and superset names
   (`HuggingFace Inference` vs `Hugging Face`) simply don't match, so they stay
   plain for free.

---

## Architecture

Three source changes + one CSS rule + one test file:

1. `js/comparison-links.js` — new module (the linker).
2. `js/tool-page.js` — one line: call the linker from `toolPageInit()`.
3. `_includes/spa-scripts.html` — load the new module.
4. `css/tool.css` — one subtle `.comparison-competitor-link` rule.
5. `tests/comparison-links.spec.js` — the three test layers.

### Section 1 — `js/comparison-links.js`

An IIFE exposing functions on `window` (mirrors the existing `tool-page.js`
style). Pure functions are exported too so they can be unit-tested without a
browser.

```js
// Public surface
window.ComparisonLinks = {
  norm,                    // (string) -> normalized key   [pure, tested]
  buildIndex,              // (landscapeData) -> Map<key,{slug}> [pure, tested]
  linkComparisonCompetitors // () -> void  (DOM transform, idempotent)
};
```

- **`norm(text)`** — `String(text)` → lowercase → strip parenthetical
  qualifiers `(...)` → remove all non-alphanumeric characters → result. Examples:
  - `"LangChain (Python)"` → `"langchain"`
  - `"Hugging Face"` / `"HuggingFace"` → `"huggingface"`
  - `"HuggingFace Inference"` → `"huggingfaceinference"` (won't match `huggingface`)
  - `"llama.cpp"` → `"llamacpp"`
  - `"Competitor 1"` → `"competitor1"` (won't match any tool)
- **`buildIndex(data)`** — walk `users`+`developers` → subcategories → tools;
  build `Map<norm(name) → {slug}>`. On key collision between **different** slugs,
  delete the key (ambiguous). Cached on `window.__comparisonIndex` after first
  build; `linkComparisonCompetitors` rebuilds lazily if absent.
- **`linkComparisonCompetitors()`** —
  1. Bail gracefully if `window.landscapeData` is missing (no throw).
  2. Read current slug from `#tool-data`.
  3. For each `div.comparison table`, select header cells: `thead th`, falling
     back to the first `<tr>`'s cells if no `<thead>`.
  4. For each header cell: skip if it already contains an `<a>` (idempotency);
     skip if it has any element child (pure-text only); look up `norm(textContent)`
     in the index; if found **and** matched slug ≠ current slug, replace the text
     node with `<a href="/tools/{slug}/" class="comparison-competitor-link" data-spa-link>{original text}</a>`.

The link carries `data-spa-link` — **required** for the SPA router to intercept
the click and navigate in-place. `js/router.js` only intercepts clicks on
`[data-spa-link]` anchors (the convention every internal link on the site uses);
a plain anchor would trigger a full page reload instead of an SPA content swap.

### Section 2 — `js/tool-page.js` hook

In `toolPageInit()`, after `wireSuggestEdit(tool)`:

```js
if (window.ComparisonLinks) window.ComparisonLinks.linkComparisonCompetitors();
```

No other change. The function is already idempotent and router-invoked.

### Section 3 — `_includes/spa-scripts.html`

Add `<script src="{{ '/js/comparison-links.js' | relative_url }}"></script>`
before `tool-page.js` so the module is defined when `toolPageInit` runs.

### Section 4 — `css/tool.css`

```css
.comparison-competitor-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dotted currentColor;
}
.comparison-competitor-link:hover {
  text-decoration: underline;
}
```

Subtle: signals "clickable" without turning the header row into a wall of blue.
(Exact treatment can be tuned during implementation to match the site palette.)

---

## Test Strategy

One runner (Playwright, via `npm test`). Layers 1–2 are **browser-less** specs
(no `page` fixture) reusing the `vm`-load + `forEachTool` pattern from
`tests/data-integrity.spec.js`. All in `tests/comparison-links.spec.js`.

### Cases the suite pins down

| # | Case | Expected | Layer |
|---|------|----------|-------|
| 1 | Competitor in catalog | linked to correct `/tools/{slug}/` | 3 |
| 2 | Competitor not in catalog | plain text | 3 |
| 3 | Placeholder `Competitor 1/2` | plain text | 1, 3 |
| 4 | Current tool's own column (incl. name variant) | never linked | 3 |
| 5 | `Feature` header cell | plain text | 3 |
| 6 | Name variant — case/spacing/punctuation/`(Python)` | matched | 1 |
| 7 | Superset name (`HuggingFace Inference`) | not mislinked | 1 |
| 8 | Ambiguous normalized collision | not linked | 1 |
| 9 | Body / feature cells | never touched | 3 |
| 10 | Multiple comparison tables on one page | all handled | 3 |
| 11 | Re-run after SPA nav | idempotent, no double-wrap | 3 |
| 12 | `landscapeData` missing/late | graceful no-op, no throw | 3 |
| 13 | Header cell with nested markup | skipped, DOM intact | 3 |
| 14 | Every generated href | resolves to a real page (never 404) | 2 |
| 15 | Clicking a generated link | router lands on correct page | 3 |
| 16 | Trailing-slash / permalink format | matches `_config.yml` | 2 |

### Layer 1 — Pure-function unit tests (fixture-driven, no browser)

Load `norm`/`buildIndex` (via `vm`, like `data-integrity.spec.js`) and test
against a **synthetic** `landscapeData` fixture so edge cases are deterministic:

- `norm` normalization variants (case 6) and superset non-match (case 7).
- `buildIndex` collision → key dropped (case 8).
- Placeholder strings normalize to non-matching keys (case 3).

### Layer 2 — CI invariant test (Node, no browser) — the "never broken" guarantee

After the Jekyll build, walk **every** tool in `data.js` (all 448, exhaustive —
it's just file-existence checks, runs in ms), construct its URL from the single
template constant, and assert the built page exists
(`_site/tools/{slug}/index.html`). Proves no slug the linker could ever emit can
404 (case 14) and fails loudly if the permalink format drifts from the constant
(case 16).

> Note: this layer needs the site built (`_site/`). It follows the same
> precondition as existing E2E specs (Playwright `webServer`/`global-setup`
> serves the built site). If `_site` is absent the test skips with a clear
> message rather than failing spuriously.

### Layer 3 — Browser E2E (Playwright) — transform correctness on real pages

The suite **recomputes the expected result independently from `data.js`**
instead of hardcoding competitor names, so it stays valid as the catalog grows.
For a few representative real pages (e.g. **Orq.ai** — header
`Humanloop | PromptLayer | LangSmith`; a page with placeholders; a page whose own
name has a variant):

- Read the page's comparison header cells; compute
  `expectedLinked = { names whose norm ∈ data.js index } − self`.
- Assert the DOM's set of linked header cells **equals** `expectedLinked`
  exactly — no missing links, no extra links (cases 1, 2, 4, 5, 6, 7, 10).
- Assert every table-body cell is unlinked (case 9).
- Assert each link's `href` equals `/tools/{expectedSlug}/` (case 1).
- **Click-through:** click a generated link; assert the router navigates and the
  destination `<h1>` matches the target tool (case 15).
- **Idempotency:** call `window.toolPageInit()` again; assert still exactly one
  `<a>` per linked cell, no nesting (case 11).
- **Graceful degradation:** set `window.landscapeData = undefined`, re-run the
  linker; assert the table is untouched and no error is thrown (cases 12, 13).

---

## Rollout / Risk

- **Reversible & isolated:** a new JS file + one call + one CSS rule. Removing the
  script tag fully disables the feature; no data or content is mutated.
- **No SEO regression risk to existing content:** static HTML is unchanged; links
  are additive at runtime.
- **Coverage is partial but self-improving:** only competitors that already have
  catalog pages get linked today; coverage grows automatically as the catalog does.

## Open Questions

None blocking. Link styling is the only detail expected to be tuned during
implementation to match the site palette.
