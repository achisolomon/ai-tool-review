# Auto-generate tool pages on new_tool suggestion approval

**Date:** 2026-10-12
**Status:** Proposed (design), not yet reviewed or approved
**Scope:** When an admin approves a `new_tool` suggestion in `admin.html`, automatically run the `/tool-page-content` skill to generate the tool's page, and open a PR for human review, with no direct commit to `main` in phase 1.

## Problem

Today, approving a `new_tool` suggestion only updates `suggestions.status` to `approved` (`approveSuggestion` in `js/admin-api.js`). Nothing creates the actual tool page. The admin (or whoever) has to separately open a Claude Code session, invoke `/tool-page-content`, do the research, write the files, and commit, by hand, for every approved tool. This is real, repeated manual work that the approval step does not trigger.

## Goal

The moment an admin approves a `new_tool` suggestion, a background process:
1. Runs the `/tool-page-content` skill's workflow (URL validation, GitHub metadata lookup, content generation) for that suggestion's `payload` (name, website, category/subcategory placement already set by the admin during approval).
2. Writes the new tool's `.md` file and the matching `js/data.js` entry.
3. Opens a pull request with the result, not a direct commit to `main`.
4. Links back to the suggestion (e.g. in the PR description) so there's a paper trail from submission to page.

A human (the admin) still reviews and merges the PR before the tool goes live. This phase does not auto-merge.

### Non-goals (phase 1)

- Auto-merging the generated PR. A tool page makes factual claims (pricing, features, pros/cons); an ungated auto-commit risks shipping wrong or hallucinated content with no review step. This is categorically different from the existing `refresh-stars.yml` workflow, which only updates a star count, a single verifiable number, not prose claims.
- Handling `taxonomy_change`, `tool_placement`, or `tool_edit` suggestion kinds. Only `new_tool` creates a page from scratch; the other kinds are smaller, targeted edits better suited to a later phase (or to stay manual).
- Retrying/queueing failed generations automatically. A failure is surfaced (see Edge cases) and left for manual follow-up in phase 1.
- Building a UI for reviewing/editing the generated PR from inside `admin.html`. Review happens on GitHub, same as any other PR.

## Why this needs a real agent runner, not another Edge Function

`/tool-page-content` is not a deterministic transform. It does live `curl`/`gh` lookups, judgment calls (is this tool notable enough, is the description accurate, which category fits), and writes multi-section HTML content. That requires the Claude Agent SDK (or Claude Code in headless mode) with real tool access (bash, file read/write, web), which a Supabase Edge Function (Deno, no persistent filesystem, no SDK) cannot provide. This needs a separate runner with git and GitHub access.

## Design

### A. Trigger: Supabase Database Webhook

Use Supabase's built-in **Database Webhooks** (Database → Webhooks in the dashboard) on `public.suggestions`, firing on `UPDATE`, filtered to rows where `status` changed to `approved` and `kind = 'new_tool'`. This avoids adding a third `supabase.functions.invoke(...)` call to `js/admin-api.js`, the trigger is a DB-level hook, not a client-side call, so it fires regardless of which client (admin.html today, anything else later) performed the approval, and it can't be skipped by a client-side bug.

- Webhook target: a GitHub Actions `repository_dispatch` trigger (see B), via a thin relay, or directly if Supabase Webhooks can POST to GitHub's API with the right auth (needs a short-lived check: Supabase Webhooks send a plain POST with a configurable header/payload, GitHub's `repository_dispatch` endpoint needs a PAT in an `Authorization` header, this is compatible, no relay needed as long as the webhook config can set a static `Authorization: Bearer <PAT>` header, confirm this when implementing).
- Payload sent to GitHub: `{ event_type: "suggestion-approved", client_payload: { suggestion_id } }`.

### B. Runner: GitHub Actions workflow

New workflow, `.github/workflows/generate-tool-page.yml`, triggered on `repository_dispatch` with `types: [suggestion-approved]`.

Steps:
1. Checkout `main`.
2. Set up Claude Code (headless mode, `claude -p "..."` or the Claude Agent SDK's CLI equivalent) with `ANTHROPIC_API_KEY` as a repo secret (new secret, does not exist yet, confirmed by checking `.github/workflows/*.yml` for existing Anthropic usage, there is none).
3. Fetch the suggestion's row from Supabase (reuse `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`, both already exist as repo secrets per `refresh-stars.yml`) to get `payload` (name, website, category, subcategory, slug) and `rationale`.
4. Invoke the `/tool-page-content` skill's workflow against that payload: validate URLs, look up GitHub metadata, write the `.md` file and the `js/data.js` surgical edit, per the skill's existing checklist.
5. Create a new branch (e.g. `auto/tool-page-<slug>`), commit both files together (the skill's existing MANDATORY rule: `.md` and `js/data.js` in the same commit).
6. Open a PR against `main` via `gh pr create`, title `Add tool page: <name>`, body including a link back to the suggestion id and the submitter's rationale/credit fields (`credit_name`, `public_credit`) if present, so attribution isn't lost.
7. On any failure (URL validation fails, tool looks dead, generation throws), the workflow does not open a PR; instead it should still surface the failure somewhere a human sees it (see Edge cases).

### C. Suggestion record stays the source of truth

No schema change needed. `suggestions.payload` already carries `name`, `website`, `slug`, and `placement` (category/subcategory) once the admin fills them in during approval (`approveSuggestion(id, payloadPatch)` already supports admin-completed payloads). `credit_name` / `public_credit` already exist for attribution in the generated PR body.

## Data flow

```
Admin approves new_tool suggestion in admin.html
  -> AdminAPI.approveSuggestion (unchanged DB update, status: approved)
  -> Supabase Database Webhook fires on suggestions UPDATE (status=approved, kind=new_tool)
       -> POST to GitHub repository_dispatch (suggestion-approved, { suggestion_id })
  -> GitHub Actions workflow (generate-tool-page.yml) runs
       -> fetches suggestion row from Supabase (service key)
       -> runs /tool-page-content workflow via Claude Code headless
            -> validates GitHub/website URLs
            -> looks up GitHub metadata (stars, archived status)
            -> writes data/_tools/.../<slug>.md
            -> updates js/data.js (surgical edit)
       -> commits both files to a new branch
       -> opens a PR linking back to the suggestion
  -> admin reviews and merges the PR manually (phase 1: no auto-merge)
```

## Edge cases

- **URL validation fails (dead GitHub repo, dead website).** Per the skill's own Red Flags section, no page should be created. The workflow should fail loudly (exit non-zero, visible in the Actions tab) rather than silently doing nothing, the admin already approved this suggestion expecting a page; silent failure would be confusing. Phase 1: a failed run is visible in GitHub Actions; a follow-up notification (email, matching the pattern from the suggestion-decision spec) is a reasonable phase 2 add but out of scope here.
- **Tool turns out to be a duplicate or miscategorized.** The skill's own duplicate-detection logic (if any, mirrors `SuggestLogic.findDuplicates` used client-side) should still apply; if it finds a clash, same as above, fail loudly rather than create a bad page.
- **Concurrent approvals.** Two `new_tool` approvals in quick succession fire two independent workflow runs; no shared state between them (each operates on its own branch/suggestion), so no special locking needed.
- **`js/data.js` full-regenerate footgun.** The skill's own docs warn that a full regenerate reorders the entire file (filesystem-dependent `Dir.glob` order) and produces a huge unrelated diff. The automated workflow must use the surgical-edit path (Option A in the skill), never the full regenerate (Option B), to keep generated PRs reviewable. This should be an explicit instruction to the agent, not left to its judgment.
- **PR review burden.** If approvals happen in bursts, multiple open PRs could pile up awaiting review. Not handled specially in phase 1; the admin processes them as they would any PR backlog.
- **Webhook delivery failure (GitHub API down, auth expired).** The suggestion stays `approved` with no page ever generated and no visible signal. Same as the "failed generation" case above: acceptable gap for phase 1, worth monitoring once this ships for real, candidate for a phase 2 email alert tying into the existing owner-notification pattern.

## Testing

- The `/tool-page-content` skill's own workflow is manually driven today; this spec does not change the skill itself, only automates its invocation. No new unit tests for the skill's content-generation logic.
- The GitHub Actions workflow itself: test via `workflow_dispatch` with a manually-supplied `suggestion_id` input (in addition to the `repository_dispatch` trigger) so it can be run and verified without needing to actually approve a suggestion end-to-end.
- Supabase Database Webhook: verify by manually flipping a test suggestion's status to `approved` via the Supabase dashboard's table editor and confirming the GitHub Actions run fires within a few seconds.
- End-to-end: approve a real (test) `new_tool` suggestion in `admin.html` on the dev environment, confirm a PR appears with correct content and a correct `js/data.js` diff (small, surgical, not a reorder).

## Files touched

- `.github/workflows/generate-tool-page.yml`, new.
- (Outside repo) Supabase Database Webhook configuration on `public.suggestions` (dashboard, no migration needed).
- (Outside repo) `ANTHROPIC_API_KEY` and a GitHub PAT (for `repository_dispatch` auth, scoped minimally, e.g. `repo` scope only) added as repo secrets.
- No changes to `js/admin-api.js`, `js/supabase-client.js`, or the `/tool-page-content` skill itself, this spec only adds an automated caller.

## Open questions (resolve before implementing)

1. Can a Supabase Database Webhook set a static `Authorization: Bearer <PAT>` header to call GitHub's `repository_dispatch` endpoint directly, or does it need a thin relay (e.g. another small Edge Function that receives the Supabase webhook and re-POSTs to GitHub with the PAT, keeping the PAT out of Supabase's webhook config UI if that's a concern)? Confirm Supabase's webhook header support before building.
2. Does "Claude Code headless mode" in GitHub Actions need anything beyond `ANTHROPIC_API_KEY`, e.g. a specific CLI install step, that isn't already captured here? Needs a quick spike before writing the real workflow YAML.
3. Should the generated PR request a specific reviewer (e.g. auto-assign the admin who approved it, via `reviewed_by`) rather than leaving it unassigned?
4. Cost: each approval now also costs one Claude Code agent run (web lookups, content generation) on top of the existing email-notification cost. Worth estimating expected approval volume to sanity-check this stays cheap at current scale, same framing as the email-notification cost discussion.

## Follow-up: approval email content (deferred here, depends on this spec)

Decided 2026-10-12, during the email-notification work: once a `new_tool` suggestion's page actually exists (the signal this spec produces, a merged PR, or some other "published" marker), the submitter's approval email (`notify-suggestion-decision`, see `2026-10-12-suggestion-decision-email-design.md`) should be rewritten to be more engaging and to include the live tool page link, specifically:

- A direct link to the new tool's page (only valid once the page is actually live, which is why this depends on this spec rather than being buildable today).
- An explicit invite to leave a review on that tool now that it's live.
- An invite to submit more tools.
- A broader invite to browse and review other tools on the site.

This was explicitly scoped out of the initial email-notification work because, without this spec's "page now exists" signal, the approval email fires before the page exists (today, pages are created manually, well after approval), so an immediate link would 404. Revisit `notify-suggestion-decision`'s approved-path content once this spec (or an equivalent "page published" signal) ships.
