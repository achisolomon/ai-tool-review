# Auto-Generate Tool Page on Suggestion Approval

**Date:** 2026-10-12
**Status:** Design — open questions resolved, spike needed before implementation plan

## Problem

Today, approving a `new_tool` suggestion in the admin UI only flips a row's `status`
to `approved`. Turning that into a published tool page is still manual:

1. Someone runs `npm run apply-suggestions` by hand, which writes minimal frontmatter
   (name, slug, website, type, placement, tags) via `scripts/apply-suggestions.mjs`.
2. Someone then writes the rich page content by hand (key stats, overview prose,
   verdict, pros/cons with sources, pricing cards, comparison table) — the work the
   `/tool-page-content` skill guides interactively.

Both steps require a human to sit down and do them. The goal is to have both fire
automatically the moment a suggestion is approved, landing as a PR for review, not a
direct commit.

## Why a PR, not auto-merge

Tool pages contain factual claims (pricing, features, pros/cons). The existing
`refresh-stars.yml` workflow already auto-commits to `main`, but only for a single
verifiable number (star count) — a different risk class than AI-generated prose about
a product. Phase 1 stops at "PR opened," not "live."

## Decision: two apply steps, not one

There are two genuinely different jobs here, and they should stay split rather than
have headless Claude do both:

- **Structural/safe fields** — name, slug, website, type, placement, tags,
  `last_verified`. This is **already built**: `scripts/apply-suggestions.mjs` reads
  the approved `suggestions` row and writes this deterministically, with real
  validation (slug collision, safe-URL check via `isSafeHttpUrl`, taxonomy
  membership, path-traversal guards in `toolPath`/`safeComponent`) and adversarial
  test coverage (`apply-suggestions.test.mjs`). It is not AI, and should not become
  AI — rewriting already-hardened security validation inside a prompt is pure risk
  with no upside.
- **Narrative content** — key-stats, overview, verdict, pros/cons with sources,
  pricing cards, comparison table. This needs web lookups and real writing. This is
  the `/tool-page-content` skill's job, and the part headless Claude is for.

Rejected alternative: have headless Claude do both. Simpler pipeline, but it means
either re-implementing validation that already exists and is already tested, or
trusting an LLM prompt to reproduce it faithfully forever. Not worth it.

## Solution Overview

```
[admin approves suggestion in admin.html]
  UPDATE public.suggestions SET status = 'approved' ...
    ↓ (Postgres trigger fires enforce_suggestion_transition — already exists)
  Supabase Database Webhook (new) on suggestions UPDATE OF status
    ↓ HTTP POST, Supabase's native payload shape: {type, table, record, old_record}
  Supabase Edge Function "relay" (new, thin)
    - reshapes body into GitHub's repository_dispatch shape:
      { event_type: "suggestion-approved", client_payload: { suggestion_id, ... } }
    - sets Authorization: Bearer <GitHub PAT> (stored as an Edge Function secret)
    - POSTs to https://api.github.com/repos/{owner}/{repo}/dispatches
    ↓
  GitHub Actions workflow (new): tool-page-generate.yml
    on: repository_dispatch, types: [suggestion-approved]
    1. checkout, setup Node
    2. fetch the suggestion row from Supabase (service key) by client_payload.suggestion_id
    3. run `npm run apply-suggestions` for that one row
         → writes minimal frontmatter + js/data.js sync, on a new branch
         → if validateRow() fails (slug collision, bad URL, unknown taxonomy),
           stop here and open a PR-less issue/comment instead — do not proceed to
           step 4 against an invalid base
    4. run Claude Code headless: `claude -p "/tool-page-content ..."`
         → fills in narrative sections on top of the file apply-suggestions.mjs wrote
         → web lookups for pricing/features/sources, curl/gh validation per the skill
    5. commit both (frontmatter+content changes, js/data.js) to the branch
    6. open a PR against main (gh pr create), do not merge
```

## Open Questions — resolved

### 1. Can Supabase Database Webhooks set the `Authorization: Bearer <PAT>` header GitHub needs?

Yes, Database Webhooks support custom headers, so the auth piece is not the problem.
The actual blocker is **payload shape**: Supabase's webhook POST body is fixed —
`{type, table, record, old_record, schema}` — and GitHub's `repository_dispatch`
endpoint requires `{event_type, client_payload}`. Supabase gives no way to reshape
the body before it leaves the webhook config.

**Resolution:** a thin Supabase Edge Function sits between the webhook and GitHub,
solely to reshape the body (and hold the PAT as a function secret, which is cleaner
than putting it in the webhook's header config anyway). This repo has no
`supabase/functions/` directory yet — it's new infrastructure, not a config tweak.

### 2. Exact setup for running Claude Code headless inside GitHub Actions

`claude -p "<prompt>" --output-format stream-json`, authenticated via
`ANTHROPIC_API_KEY` as a repo secret, same pattern as `anthropics/claude-code-action`.
Needs network egress for web lookups (`WebFetch`/`WebSearch` or the skill's own
`curl`/`gh` calls) — this is a real agentic run with latency in the minutes, not a
fast deterministic CI step like `refresh-stars.yml`'s Ruby script. The
`/tool-page-content` skill is actually well-suited to this: it's a self-contained
checklist with explicit shell-level verification steps, not one that depends on
interactive back-and-forth clarification.

Needs a spike to confirm: skill invocation syntax when driven by `-p` instead of an
interactive session, and how `gh`/git auth get into that container alongside the
Anthropic key.

### 3. Should the generated PR auto-assign a reviewer?

No strong technical reason either way — this is a workflow preference, not a
constraint. Deferred to the user; default to **no auto-assignment** for phase 1 (the
PR author — the bot — has no reviewer to suggest with better information than the
human who already gets a GitHub notification on new PRs).

### 4. Cost

Two components:
- The relay (Edge Function + `apply-suggestions.mjs`) is cheap — no LLM calls.
- The Claude run is scoped to *narrative content only* (step 4 above), not the full
  page from scratch, because the structural/validated fields are already on disk by
  the time it runs. Bounded by: one skill invocation, a handful of web lookups per
  tool (website, GitHub repo, pricing page), one PR creation. Real but bounded —
  roughly comparable to one interactive `/tool-page-content` session today, just
  unattended.

## Components

### 1. Supabase Database Webhook (new)

- Table: `public.suggestions`
- Event: `UPDATE`, filtered to rows where `status` transitions to `approved`
  (Supabase webhooks fire on any UPDATE; filter in the Edge Function by checking
  `record.status === 'approved' && old_record.status !== 'approved'`, and
  `record.kind === 'new_tool'` for phase 1 — `tool_edit`/`tool_placement` are out of
  scope until this is proven out).
- Target: the relay Edge Function's URL.

### 2. Relay Edge Function (new)

- Validates the webhook's own signed secret (Supabase sends a shared secret header;
  reject anything that doesn't match before touching GitHub).
- Reshapes `{record}` → `{event_type: "suggestion-approved", client_payload: {suggestion_id: record.id}}`.
- Holds the GitHub PAT as a function secret; never exposed to the browser or logged.
- POSTs to `repos/{owner}/{repo}/dispatches`.

### 3. `tool-page-generate.yml` (new workflow)

- Trigger: `repository_dispatch`, type `suggestion-approved`.
- Re-fetches the suggestion row itself (by id, via service key) rather than trusting
  the dispatch payload's contents beyond the id — the row may have changed between
  dispatch and run, and the id is the only thing that needs to survive the relay hop.
- Runs `apply-suggestions.mjs` for that row on a new branch.
- On `validateRow()` failure: stop, do not invoke Claude, surface the failure
  somewhere visible (e.g. comment on... there's no suggestion-tracking issue today,
  so this needs a decision during implementation — likely just a failed-workflow
  email, same as `refresh-stars.yml`'s failure path).
- On success: invoke headless Claude with `/tool-page-content` scoped to the one new
  file, commit, open PR.

### 4. `apply-suggestions.mjs` (existing, unchanged)

No changes needed — it already does exactly the job this design wants from it. The
only gap is that nothing calls it from CI yet; this design is what finally wires it
in.

## Out of Scope (phase 1)

- Auto-merge of the generated PR.
- `tool_edit` and `tool_placement` suggestion kinds (only `new_tool`).
- Auto-assigning a PR reviewer.
- Retrying a failed Claude run automatically (re-running the workflow manually via
  `workflow_dispatch` with the suggestion id is the phase-1 recovery path).

## Spike needed before writing the implementation plan

- Confirm Supabase Database Webhooks can target an Edge Function URL directly (vs.
  only arbitrary HTTP endpoints) and what the shared-secret verification looks like
  in practice.
- Confirm headless Claude Code's exact CLI invocation and auth setup inside a GitHub
  Actions runner, and get one real `/tool-page-content` run completing end-to-end in
  that environment before wiring it to production approvals.
