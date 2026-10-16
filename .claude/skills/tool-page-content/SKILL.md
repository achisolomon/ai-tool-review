---
name: tool-page-content
description: Use when creating or editing AI tool review pages in the ai-tool-review Jekyll site. Covers the fast path for adding tools (auto-named session worktree, one check script, single push confirmation) plus frontmatter, taxonomy, content structure, URL validation, and keeping the generated js/data.js in sync (required or CI fails).
---

# Tool Page Content Skill

Use this skill when creating or editing tool pages in the AI landscape site.

## Fast path (every tool add)

Goal: zero permission prompts, about 15s of scripted work, and exactly ONE
question to the user ("ship it?") with a localhost link. Every shell step
goes through ONE script, which the project settings pre-approve and exclude
from the sandbox:

```bash
bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" <subcommand> ...   # works from any directory
```

Hard rules for this path:
- Run every step below ONLY via `tool-page.sh`. Do not run raw `git`,
  `npm`, `curl`, `jekyll`, `find`/`grep` chains or `session_worktree.py`
  yourself: each raw command is a separate approval prompt. If you need
  something the script lacks, add a subcommand rather than improvising.
- Call it exactly as shown, by its absolute path (no `cd ... &&` prefix,
  no env-var prefix): that exact prefix is pre-approved and runs outside the
  sandbox. If it ever prints "running inside the sandbox", re-run it exactly
  as it says; do not debug node_modules or Playwright.
- Never use `dangerouslyDisableSandbox`; the script is already excluded
  from the sandbox.
- Ask the user nothing except the single "ship it?" in step 6. Pick the
  worktree name, category, tags and wording yourself.
- `<session_id>` is in the SessionStart message.
- Never use AskUserQuestion, and never ask about category, tags or naming:
  decide from the taxonomy below.
- Subagents are READ-ONLY helpers for speed: use `subagent_type: "Explore"`
  (it cannot edit files) with `model: "haiku"`, launched in parallel in ONE
  message, each with one research question (e.g. official site + pricing,
  reviews/G2 via WebSearch, GitHub README). They return facts and source
  URLs; only the main session writes the page, runs `tool-page.sh` and
  ships. Never poll them (no ScheduleWakeup/ListAgents/ReadNotifications
  loops): their results arrive automatically. Skip them for a lookup you
  can do in 1-2 tool calls yourself.

1. **Start** (creates worktree `tool-<slug>`, auto-suffixed on collision):
   `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" start <slug> <session_id>`
   Then check for an existing page:
   `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" exists <slug-or-name>`
   If it exists, edit that file instead of creating a new one.
2. **Research** with WebFetch (official site, pricing, docs, GitHub README)
   and WebSearch (reviews; G2 pages return 403 to WebFetch, so use
   WebSearch "<tool> G2 reviews pros cons" instead). Verify links and stars:
   `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" urls <url> <url> ...`
   `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" stars <owner/repo>`
   Watch for official vs. third-party sites (e.g. a site linking a fork).
   To go faster, run the research as 2-3 parallel read-only Explore
   subagents (see rules above) while you run `exists`/`urls`/`stars`.
3. **Write the page** with the Write tool into the worktree path printed by
   `start`, following the taxonomy, tags (`data/_tools/_tags.yaml` is the
   source of truth) and content structure below. Never edit `js/data.js`.
4. **Check** (validate, generate, build, star-figure lint, 14 data tests):
   `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" check <session_id>`
   Star-figure rule: no digit followed by "star(s)" anywhere in the body;
   only the key-stats badge shows the number. Fix and re-run until green.
5. **Serve** (background, prints the URL):
   `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" serve <session_id>`
   It only prints `SERVING` after the page answered 200. Do not curl
   localhost yourself: from the sandbox it always fails (exit 7) even though
   the server is up.
6. **Ask once:** give the user `http://localhost:<port>/tools/<slug>/`, a
   2-3 line summary (category, tags, anything surprising) and ask "ship it?".
7. **Ship** (only after the user says yes): commits, merges origin/main,
   always regenerates `js/data.js` and re-checks, pushes to main:
   `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" ship <session_id> "feat: add <Tool> tool page"`
8. **Wait for CI + deploy** with `run_in_background: true`, so the user is
   not blocked: `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" ci <session_id>`
   then report `https://aitoolreview.ai/tools/<slug>/`.
   **If CI is red**, `ci` already prints the failing tests and assertions
   (or run `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" cilog <session_id>`). Never run raw `gh`/`git` to
   investigate. A failing test is often brittle test data broken by the new
   page (e.g. a hardcoded count of tools on a domain): fix the test or page
   in the worktree, run `check`, then `ship` again (it commits every change
   in the worktree, tests included). Don't ask the user again for this
   follow-up push: it is part of the shipment they approved.
9. **Clean up:** `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" end <session_id>`
   (stops the server, removes the merged worktree).

If `ship` reports a merge conflict, run
`bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" maindiff <session_id> <file>`
for each file it names, edit the file in the worktree so it keeps main's
changes plus yours (if main already has an equivalent fix, take main's),
then run `ship` again.

## Step 0: Check if Tool Already Exists (REQUIRED)

Before ANY research: `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" exists <name-or-slug>`
(matches file names plus `name:`/`slug:` frontmatter, case-insensitive).

**If tool exists:** Update the existing page instead of creating a duplicate.
**If tool doesn't exist:** Proceed with research and creation.

## Pre-Flight URL Checks (MANDATORY)

Verify every URL you will cite or put in frontmatter, in one call:
`bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" urls <website> <github_url> <source urls...>`

- **200**: live, proceed
- **404 on the GitHub repo**: repo is dead, do NOT add the tool; tell the user
- **404/5xx on the website**: warn the user, consider `status: deprecated`

For any GitHub repo: `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" stars <org/repo>`
(prints stars, archived, fork, last push, license, homepage).
- `archived=True`: mark `status: deprecated`
- `fork=True`: find and cite the upstream repo instead
- last push older than 2 years: lower `confidence_score`, mention it

## File Location

Tools go in: `data/_tools/{track}/{category}/{subcategory}/{slug}.md`

- `track`: `users` or `developers`
- `category`: Primary category (e.g., `ai-coding`, `ai-chat-search`)
- `subcategory`: Subcategory (e.g., `coding-agents`, `code-intelligence`)
- `slug`: URL-safe lowercase identifier

## Category Taxonomy (MUST MATCH)

The file path determines category. `data/_tools/_categories.yaml` is the
source of truth; this table mirrors it. If they ever disagree, trust the yaml.
There is no `vertical-ai` category any more: industry tools go straight into
their industry category (e.g. `healthcare`, `legal`, `finance`).

### Developers Track (`track: "developers"`)

| Category | Subcategories |
|----------|---------------|
| `agent-frameworks` | `agent-communication`, `agent-identity`, `agent-memory`, `agent-payments`, `agent-platforms`, `agent-search`, `browser-agents`, `code-first`, `durable-execution`, `protocols`, `tool-integrations` |
| `ai-coding` | `ai-ides`, `app-builders`, `code-intelligence`, `code-review`, `coding-agents`, `dev-environment`, `llm-skills`, `spec-driven`, `testing-sensors` |
| `ai-cost` | `cost-offsets`, `token-optimization`, `usage-analytics` |
| `ai-infrastructure` | `gpu-providers`, `inference-apis`, `llm-gateway`, `networking` |
| `data-training` | `data-ingestion`, `data-labeling`, `embeddings`, `experiment-tracking`, `fine-tuning`, `lakehouse-semantic`, `ml-frameworks`, `mlops` |
| `engineering-intelligence` | `developer-portals`, `engineering-analytics` |
| `foundation-models` | `closed-frontier`, `model-hubs`, `open-source` |
| `llm-frameworks` | `app-frameworks`, `prompt-engineering` |
| `observability-safety` | `app-observability`, `evaluation`, `guardrails`, `llm-observability` |
| `security` | `preventing-prompt-injection`, `red-teaming`, `security-scanning` |
| `vector-dbs` | `dedicated`, `extensions`, `rag-kg` |

### Users Track (`track: "users"`)

| Category | Subcategories |
|----------|---------------|
| `ai-chat-search` | `ai-search`, `chat-assistants` |
| `customer-support` | `ai-support-agents`, `contact-center`, `helpdesk-platforms` |
| `design` | `diagrams-illustrations`, `ui-product-design` |
| `education` | `ai-tutors`, `language-learning`, `teacher-tools` |
| `enterprise-platforms` | `enterprise` |
| `finance` | `finance-automation`, `financial-research` |
| `generative-media` | `3d-other`, `image-generation`, `music-generation`, `video-generation`, `voice-speech` |
| `healthcare` | `clinical-documentation`, `clinical-reference`, `patient-facing-ai` |
| `legal` | `contract-management`, `legal-research-drafting` |
| `lifestyle` | `astrology` |
| `meeting-notetakers` | `notetakers` |
| `no-code-builders` | `workflow-builders` |
| `personal-assistants` | `browsers` |
| `recruiting` | `ai-recruiters`, `talent-intelligence` |
| `sales-marketing` | `ai-commerce`, `marketing-content`, `revenue-intelligence`, `sales-prospecting` |
| `slide-creation` | `ai-presentations` |
| `transcription` | `transcription-tools` |
| `voice-ai-agents` | `voice-agents` |
| `writing-productivity` | `writing-tools` |

**File path format:** `data/_tools/{track}/{category}/{subcategory}/{slug}.md`

Always put a new tool in a subcategory folder and set the `subcategory` field
to that folder name; a mismatch silently drops the tool from `js/data.js`. (A
few legacy files sit directly in a category folder with no `subcategory`, e.g.
`personal-assistants/dots.md`; the generator then uses the category id. Don't
copy that pattern.)

**New category or subcategory:** add it to `_categories.yaml` (with a unique
id). A new category also needs a unique `rank:` (popularity order on the
landscape grid; a test enforces this). Subcategories display in the order they
are listed in the yaml, most popular first.

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

**No public pricing (demo / contact-sales only):** use one featured card
linking to the demo or contact page; do not invent tiers or prices.

```html
<div class="pricing-grid">
  <a href="{demo-or-contact-url}" class="pricing-card featured" target="_blank" rel="noopener">
    <div class="plan-name">Enterprise</div>
    <div class="price">Custom</div>
    <div class="desc">No public pricing; book a demo for a quote</div>
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
4. **Pros** -> G2, Capterra, official announcements
5. **Cons** -> G2 cons, user reviews, Reddit

G2 (and often Capterra) return HTTP 403 to WebFetch. Don't fetch them
directly; use WebSearch ("<tool> G2 reviews pros cons") and cite the G2 URL
it returns (product slugs vary, e.g. `apriora-alex` vs `apriora-alex-ai`,
so never guess the URL).
6. **Stats** -> Press releases, official blog, funding announcements

## GitHub Stars Verification

Use `bash "/Users/achisolomon/Documents/Git-Achi-gmail/ai landscape/.claude/scripts/tool-page.sh" stars <owner/repo>` (GitHub API), never
web search or cached figures.

### The star-figure prose rule (why `check` has a lint step)

`tests/data-integrity.spec.js` bans any digit immediately followed by
"star(s)" anywhere in a tool page body, including `<span>` text and tables.
Only the key-stats badge is exempt (number and label sit in separate
`<span>`s). Write "strong, fast-growing adoption (see badge for count)"
instead of repeating the number. `check` lints this before you ship.

## `js/data.js` (generated, never edit)

The search UI reads `js/data.js`, generated from the tool `.md` files; CI
fails if a page is missing from it. `check` and `ship` always regenerate it
(with a UTF-8 locale) and `ship` commits it with the page. Never hand-edit or
hand-merge it; on a merge conflict `ship` takes main's copy and regenerates.

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
