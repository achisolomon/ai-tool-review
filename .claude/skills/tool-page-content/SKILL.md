---
name: tool-page-content
description: Use when creating or editing AI tool review pages in the ai-tool-review Jekyll site. Covers the fast path for adding tools (auto-named session worktree, one check script, single push confirmation) plus frontmatter, taxonomy, content structure, URL validation, and keeping the generated js/data.js in sync (required or CI fails).
---

# Tool Page Content Skill

Use this skill when creating or editing tool pages in the AI landscape site.

## Fast path (default for 1-2 tools)

For the common case, 1-2 new or edited tool pages in one session, run this
sequence. No questions to the user except the single push confirmation at
the end.

1. **Create the session worktree, named automatically. Never ask the user
   for a name.** Name it `tool-<slug>` after the (first) tool and run, unsandboxed
   (it probes ports, about 0.5s):
   ```bash
   python3 "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/session_worktree.py" create tool-<slug> <session_id>
   ```
   (`<session_id>` is in the SessionStart message.) A taken name gets a
   `-2`, `-3` suffix automatically, so parallel sessions never collide. Do
   ALL work in the printed worktree path, never in the main checkout;
   `node_modules` and `vendor/` are already linked, so Jekyll works at once.
   Serve with `eval "$(rbenv init -)" && PORT=<printed port> npm run serve:jekyll`.
2. **Fetch sources directly with WebFetch.** Skip the parallel research
   subagent detour at this scale; it exists to parallelize 3+ tools, not to
   add overhead to one or two. For 3+ tools, keep using the research
   subagents as before, unaffected by this change.
3. **Check if the tool already exists** (Step 0 below) before researching
   further.
4. **Write the page**, following the taxonomy, frontmatter template, and
   content structure sections below. Keep the generated `js/data.js` in sync
   (see "Sync `js/data.js`" below).
5. **Run the check script:**
   ```bash
   npm run tool-page-check
   ```
   This runs, in order: `rbenv init`, `npm run validate`, `npm run generate`,
   `npm run build`, a lint for any new/changed tool `.md` file against the
   exact regex `tests/data-integrity.spec.js` uses for "no tool description
   prose hardcodes a GitHub star figure" (a bare digit followed by "star(s)"
   anywhere in the body, not just outside the key-stats badge), then
   `npx playwright test tests/data-integrity.spec.js --workers=1`. It fails
   fast with a one-line fix pointer at whichever step breaks. A clean run
   here means CI will not bounce the push back on this class of bug.

   This command and the git/gh steps below are listed in the parent repo's
   `permissions.allow` (see `docs/architecture/tasks.md` T-005), so they run
   without a separate approval prompt in the normal case.
6. **If it exits 0**, stage and commit the new/edited `.md` plus `js/data.js`
   in the same commit, on the worktree branch.
7. **Ask the user once, immediately before pushing, for push confirmation**
   (after they checked the page on localhost). "Ship it" counts. Never
   pre-approved; ask every time, right before the push step.
8. **Sync and push from the worktree:** `git fetch origin && git merge
   --no-ff origin/main` (if `js/data.js` conflicts, never hand-merge it:
   resolve the `.md` files, then `npm run generate`), re-run
   `npm run tool-page-check` if main had moved, then
   `git push origin HEAD:main`. Watch CI with `gh run watch` (or poll
   `gh run list --branch main --limit 1`). The worktree is removed
   automatically at session end once merged and clean.
9. **Report the live page URL** once the run is green, or the failure if it
   is red.

## Multi-tool / batch path (3+ tools, or on request)

Same worktree flow as above (one auto-named worktree, e.g.
`tool-<first-slug>`), with one difference: for 3+ tools, research sources
with parallel subagents (haiku model, per the global agent-model-selection
rule) instead of fetching each one inline. One `npm run tool-page-check`
covers all pages before the commit.

## Step 0: Check if Tool Already Exists (REQUIRED)

Before ANY research, check if the tool page already exists:

```bash
# Search by tool name (case-insensitive)
find data/_tools -iname "*toolname*" -type f

# Search by slug in frontmatter
grep -r "slug: \"tool-slug\"" data/_tools/

# Search by name in frontmatter
grep -ri "name: \"Tool Name\"" data/_tools/
```

**If tool exists:** Update the existing page instead of creating a duplicate.
**If tool doesn't exist:** Proceed with research and creation.

## Pre-Flight URL Checks (MANDATORY)

Before creating or updating any tool, verify all URLs are live:

### 1. GitHub URL Validation

For any tool with a `github_url`:

```bash
curl -s -o /dev/null -w "%{http_code}" https://github.com/{org}/{repo}
```

- **200**: Repo is live - proceed
- **404**: Repo is DEAD - DO NOT add this tool. Inform the user.
- **301/302**: Repo was renamed/moved - follow redirect, use the new URL

### 2. Website URL Validation

For the primary `website` URL:

```bash
curl -s -o /dev/null -w "%{http_code}" -L {website_url}
```

- **200**: Site is live - proceed
- **404/5xx**: Site is down - warn the user, consider marking as `status: deprecated`

### 3. For GitHub-based Tools

If `website` points to GitHub, use `gh` CLI to get accurate data:

```bash
gh repo view {org}/{repo} --json name,description,stargazerCount,isArchived,updatedAt
```

Check for:
- `isArchived: true` -> Mark as `status: deprecated`
- `updatedAt` older than 2 years -> Lower `confidence_score`, note in description

## File Location

Tools go in: `data/_tools/{track}/{category}/{subcategory}/{slug}.md`

- `track`: `users` or `developers`
- `category`: Primary category (e.g., `ai-coding`, `ai-chat-search`)
- `subcategory`: Subcategory (e.g., `coding-agents`, `code-intelligence`)
- `slug`: URL-safe lowercase identifier

## Category Taxonomy (MUST MATCH)

The file path determines category. Choose from existing folders.

### Developers Track (`track: "developers"`)

| Category | Subcategories |
|----------|---------------|
| `ai-coding` | `coding-agents`, `ai-ides`, `app-builders`, `code-review`, `code-intelligence`, `context-optimization`, `cost-reduction`, `dev-environment`, `llm-skills`, `spec-driven`, `testing-sensors` |
| `agent-frameworks` | `agent-communication`, `agent-identity`, `agent-memory`, `agent-payments`, `agent-search`, `browser-agents`, `code-first`, `durable-execution`, `protocols`, `tool-integrations` |
| `agent-platforms` | (direct, no subcategories) |
| `ai-infrastructure` | `gpu-providers`, `inference-apis`, `llm-gateway` |
| `data-training` | `data-ingestion`, `data-labeling`, `embeddings`, `experiment-tracking`, `fine-tuning`, `lakehouse-semantic`, `ml-frameworks`, `mlops` |
| `engineering-intelligence` | (direct, no subcategories) |
| `foundation-models` | `closed-frontier`, `model-hubs`, `open-source` |
| `llm-frameworks` | `app-frameworks`, `prompt-engineering` |
| `observability-safety` | `app-observability`, `evaluation`, `guardrails`, `llm-observability` |
| `security` | `red-teaming`, `security-scanning` |
| `vector-dbs` | `dedicated`, `extensions`, `rag-kg` |

### Users Track (`track: "users"`)

| Category | Subcategories |
|----------|---------------|
| `ai-chat-search` | `ai-search`, `chat-assistants` |
| `ai-contact-center` | `contact-center` |
| `enterprise-platforms` | (direct, no subcategories) |
| `generative-media` | `3d-other`, `image-generation`, `music-generation`, `video-generation`, `voice-speech` |
| `meeting-notetakers` | (direct, no subcategories) |
| `no-code-builders` | (direct, no subcategories) |
| `personal-assistants` | (direct, no subcategories) |
| `slide-creation` | (direct, no subcategories) |
| `vertical-ai` | `customer-support`, `design`, `education`, `finance`, `healthcare`, `legal`, `recruiting`, `sales-marketing` |
| `voice-ai-agents` | `voice-agents` |
| `writing-productivity` | (direct, no subcategories) |

**File path format:** `data/_tools/{track}/{category}/{subcategory}/{slug}.md`

**Flat categories** (marked "direct, no subcategories" above) do NOT require
a `subcategory` field in frontmatter; the generator defaults to the category
id. For categories that DO have subcategories, the `subcategory` field is
required and must match a folder name, or the tool is silently dropped from
`js/data.js`.

## Valid Tags (Use Only These)

Common tags used across the site (pick 2-5 relevant ones). The source of
truth is `data/_tools/_tags.yaml`; `npm run validate` rejects anything not in
it, and also rejects a tag that matches a category/subcategory name (so
`open-source` is NOT a tag: use `type: "open-source"` instead).

| Tag | Use When |
|-----|----------|
| `agents` | Autonomous AI agents, multi-step task handling |
| `api-available` | Has public API for developers |
| `python` | Python-based or Python SDK |
| `typescript` | TypeScript/JavaScript based |
| `rag` | RAG pipelines or retrieval-augmented |
| `workflow-automation` | Automates workflows/processes |
| `self-hosted` | Can run on own infrastructure |
| `observability` | Monitoring, tracing, debugging |
| `reasoning` | Advanced reasoning capabilities |
| `no-code` | No-code/low-code interface |
| `serverless` | Serverless deployment option |
| `multimodal` | Handles multiple modalities (text, image, audio) |
| `browser-automation` | Browser/web automation |
| `mcp-server` | MCP protocol support |
| `real-time` | Real-time processing |
| `sandboxes` | Sandboxed execution environment |

Do not invent tags beyond this list; do not use a tag that matches a
category/subcategory name (categories are for navigation, tags are not).

## Required Frontmatter

```yaml
---
name: "Tool Name"
slug: "tool-name"
website: "https://tool.com"
type: oss | saas | commercial
track: users | developers
category: "category-slug"
subcategory: "subcategory-slug"  # omit for flat categories
status: active | beta | deprecated | removed
description: "50-160 char SEO description, [VERIFIED from official source]"
pricing_model: free | freemium | paid | enterprise
founded_year: 2024
headquarters: "Location or omit"
github_url: "https://github.com/org/repo"  # if applicable
github_stars: 1500  # if applicable, verified via API
tags:
  - relevant
  - tags
last_verified: "YYYY-MM-DD"
confidence_score: 0.95
---
```

## Content Structure (in order)

### 1. Key Stats Block

```html
<div class="key-stats">
  <div class="key-stat">
    <span class="number">1.5k+</span>
    <span class="label">GitHub Stars</span>
  </div>
  <div class="key-stat">
    <span class="number">Feature</span>
    <span class="label">Label</span>
  </div>
  <div class="key-stat">
    <span class="number">2024</span>
    <span class="label">Founded</span>
  </div>
</div>
```

The number and its label sit in separate `<span>` elements (a tag boundary
between them) so this is the ONLY place a star figure is exempt from the
star-figure prose lint below.

### 2. Overview Section

```html
## Overview

<div class="overview">
<p>[Verified description from official source]. 2-4 sentences covering what
the tool does, who it's for, and key differentiators.</p>
</div>
```

### 3. Verdict Section

```html
## The Verdict

<div class="verdict">
  <h3>Who Should Use {Tool}?</h3>
  <div class="verdict-grid">
    <div class="verdict-section">
      <h4>Best For</h4>
      <ul>
        <li>Target user type 1</li>
        <li>Use case 2</li>
      </ul>
    </div>
    <div class="verdict-section not-for">
      <h4>Not Ideal For</h4>
      <ul>
        <li>Anti-pattern 1</li>
        <li>Poor fit scenario</li>
      </ul>
    </div>
  </div>
</div>
```

### 4. Pros/Cons Section (WITH sources)

```html
<div class="pros-cons">
  <div class="pros-list">
    <h3>What's Great</h3>
    <ul>
      <li>Pro 1</li>
      <li>Pro 2</li>
    </ul>
    <div class="source"><a href="{source_url}" target="_blank">Source</a></div>
  </div>
  <div class="cons-list">
    <h3>Watch Out For</h3>
    <ul>
      <li>Con 1</li>
      <li>Con 2</li>
    </ul>
    <div class="source"><a href="{source_url}" target="_blank">Source</a></div>
  </div>
</div>
```

### 5. Pricing Section (linked cards, not a markdown table)

```html
## Pricing

<div class="pricing-grid">
  <a href="{url}" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Plan Name</div>
    <div class="price">$0</div>
    <div class="desc">Plan description</div>
  </a>
</div>
```

### 6. Expandable Details

```html
<details class="more-details">
<summary>View all features & details</summary>

<div class="detail-grid">
  <div class="detail-section">
    <h4>Key Features</h4>
    <ul>
      <li>Feature 1</li>
    </ul>
  </div>
  <div class="detail-section">
    <h4>Use Cases</h4>
    <ul>
      <li>Use case 1</li>
    </ul>
  </div>
</div>

</details>
```

### 7. Comparison Table

```html
## How It Compares

<div class="comparison" markdown="1">

| Feature | This Tool | Competitor 1 | Competitor 2 |
|---------|-----------|--------------|--------------|
| Row 1   | Value     | Value        | Value        |

</div>
```

## Source Verification Checklist

Before writing ANY content:

1. **Description** -> Fetch from official website/GitHub README
2. **Pricing** -> Fetch from official pricing page
3. **Features** -> Fetch from official docs
4. **Pros** -> Search G2, Capterra, official announcements
5. **Cons** -> Search G2 cons, user reviews, Reddit
6. **Stats** -> Press releases, official blog, funding announcements

## GitHub Stars Verification

For open-source tools, verify GitHub stars directly via the API, not web
search and not cached figures:

```bash
curl -s https://api.github.com/repos/OWNER/REPO | jq '.stargazers_count'
```

### The star-figure prose rule (why the check script has this step)

`tests/data-integrity.spec.js`'s "no tool description prose hardcodes a
GitHub star figure" test bans any digit immediately followed by the word
"star(s)" anywhere in a tool page's body, not just outside the key-stats
badge, including inside `<span>` text and markdown tables. Only the
key-stats badge is exempt (its number and label are in separate `<span>`
elements with no adjacent text). Write star-count color commentary as
"strong, fast-growing adoption, see badge for count" rather than spelling
out the number a second time in a pros/cons bullet or comparison table.
`npm run tool-page-check` (fast path step 5) runs this exact check locally
before you ever push, so CI does not bounce the push back on it.

## Sync `js/data.js` (MANDATORY)

The search UI reads a **generated** file, `js/data.js`, built from the tool
`.md` files. `js/data.js` is generated only; never hand-edit or hand-merge
it outside the two options below. Creating or editing a `.md` file is **not
enough**: if `js/data.js` is not updated to match, the CI test
`tests/data-integrity.spec.js › every tool .md file appears in data.js`
**fails** the PR. Every add/edit/remove of a tool MUST update `js/data.js`
in the same commit.

`npm run tool-page-check` (fast path step 5) runs `npm run generate`
(Option B below) as its canonical path. The surgical edit (Option A) stays
documented for the case a full regenerate's reshuffle diff is the problem,
not as routine practice.

### Option A: Surgical edit (when a full regenerate's diff is too noisy)

Insert/update just your tool's object in `js/data.js`, keeping the exact
existing format (2-space indentation, key order). Place it in the array for
its `{track} -> {category} -> {subcategory}`, next to sibling tools. The
object shape:

```json
{
  "name": "Tool Name",
  "slug": "tool-slug",
  "url": "https://tool.com",
  "desc": "The frontmatter description, verbatim",
  "type": "commercial",
  "github_stars": null,
  "pricing_model": "freemium",
  "pricing_starting": null,
  "user_count": null,
  "tags": [ "tag1" ],
  "all_tags": [ "tag1" ],
  "category_id": "category-slug",
  "category_name": "Category Display Name",
  "subcategory_id": "subcategory-slug",
  "subcategory_name": "Subcategory Display Name",
  "additional_categories": [

  ]
}
```

- `tags` is `all_tags` capped at the first 3. `category_name`/
  `subcategory_name` come from `_categories.yaml`.
- Find the sibling tools first (e.g. `grep -n '"id": "app-builders"'
  js/data.js`) and copy their formatting exactly.

### Option B: Full regenerate (the fast path's default) - use with care if run by hand

```bash
# The Ruby generator crashes on non-ASCII (curly quotes, middot) unless the
# locale is UTF-8. LANG/LC_ALL are often unset in this environment.
LANG=C.UTF-8 LC_ALL=C.UTF-8 npm run generate
```

**Regeneration reorders the ENTIRE file.** Category/tool order comes from
`Dir.glob`, whose enumeration order is filesystem-dependent, so re-running
the generator produces a large reshuffle diff even though only one tool
changed. If you ran this by hand outside `npm run tool-page-check`, check
the diff before committing:

```bash
git diff --stat js/data.js   # should be a small insertion, NOT thousands of lines
```

If the diff is huge, `git checkout js/data.js` and use Option A instead.

### Verify before committing

```bash
node scripts/validate-data-js.js          # must report "format is valid"
grep -c '"slug": "your-slug"' js/data.js  # must be >= 1
```

Confirm the total tool count increased by exactly one (for an add).

## DO NOT Include

**NEVER add these sections:**
- Quick Start / Getting Started code examples
- Installation instructions
- Code snippets showing how to use the tool
- API examples

Users will go to the tool's official site for usage instructions. Our pages
are for **evaluation and comparison**, not tutorials.

## Red Flags - DO NOT ADD / STOP

- GitHub repo returns 404 -> Tool is dead, do not add
- Website returns 404 for 3+ days -> Tool may be abandoned
- `isArchived: true` on GitHub -> Mark as deprecated, not active
- No commits in 2+ years -> Lower confidence, note staleness
- Stars < 50 and no website -> May not be notable enough
- Writing description without fetching the official site
- Using `| table |` syntax for pricing (use HTML `.pricing-card` links)
- Pros/cons without source citations
- Stats without source URLs
- Adding "Quick Start" or code examples
- Using GitHub stars from web search instead of the API
- Claiming "done" without running `npm run tool-page-check`

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Creating duplicate tool page | ALWAYS search first: `find data/_tools -iname "*toolname*"` |
| Wrong category/subcategory | Use ONLY values from the taxonomy table above |
| Adding subcategory to a flat category | Flat categories (slide-creation, meeting-notetakers, etc.) don't need subcategory, omit the field |
| Omitting subcategory from a nested category | Categories with subcategories listed in the taxonomy DO require the field, or the tool is silently dropped from data.js |
| Inventing new tags | Use ONLY tags from the valid tags table |
| Category doesn't match folder | File path and frontmatter MUST align |
| Using markdown tables for pricing | Use `<a class="pricing-card">` HTML |
| Missing source citations | Add `<div class="source">` after pros/cons |
| Inventing stats | Fetch and cite official sources |
| Missing verdict section | Always include Best For / Not Ideal For |
| Star figure in prose | Rephrase; only the key-stats badge may show the number (see star-figure prose rule above) |
| Forgetting to sync js/data.js | Run `npm run tool-page-check`, which runs `npm run generate` for you |
| Skipping the check script | Run `npm run tool-page-check` before every commit |

## Updating Existing Tools

When updating, always:

1. Re-validate all URLs
2. Update `last_verified` to today
3. Update `github_stars` with a fresh count
4. Check for any status changes (deprecated, renamed, etc.)
5. **Sync `js/data.js`** if you changed any field mirrored there (`name`,
   `slug`, `website`, `description`, `type`, `github_stars`,
   `pricing_model`, `tags`, category/subcategory). Removing a tool's `.md`
   means removing its `js/data.js` object too. See "Sync `js/data.js`" above.

## Reference Examples

When in doubt, read existing tool pages for patterns:
- `data/_tools/developers/ai-coding/coding-agents/claude-code.md`
- `data/_tools/users/writing-productivity/notion-ai.md`
