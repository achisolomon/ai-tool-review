# Auto-Generate Tool Page on Suggestion Approval — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When an admin approves a `new_tool` suggestion, a GitHub Actions workflow
automatically runs the existing `apply-suggestions.mjs` script to write validated
frontmatter, then runs headless Claude Code to fill in the narrative page content,
and opens a PR — no human runs anything by hand.

**Architecture:** Supabase Database Webhook (on `suggestions` UPDATE) → a thin
Supabase Edge Function that reshapes the payload and calls GitHub's
`repository_dispatch` → a new `tool-page-generate.yml` workflow that runs
`apply-suggestions.mjs` (deterministic, already tested) then `claude -p` with the
`tool-page-content` skill (narrative content, new) → commits to a branch → opens a
PR against `main`. Never auto-merges.

**Tech Stack:** Supabase Database Webhooks, Supabase Edge Functions (Deno), GitHub
Actions, Claude Code CLI (headless `-p` mode), the existing Node.js
`apply-suggestions.mjs` / `tool-page-content` skill.

---

## Design decisions locked by the spec review

These come from `docs/superpowers/specs/2026-10-12-auto-generate-tool-page-design.md`
and a follow-up session. Re-read that file for full rationale; this plan does not
re-derive them.

1. **Two apply steps, not one.** `apply-suggestions.mjs` (existing) writes the
   validated structural frontmatter. Headless Claude only adds narrative content on
   top. Claude never re-implements the slug/URL/taxonomy validation that script
   already has tested.
2. **`apply-suggestions.mjs` needs no code changes.** It already batches all
   `status = 'approved'` rows in one run (see `run()` in the script) — the workflow
   does not need to look up a single row by id from the webhook payload. It just
   needs `--yes` passed so `confirmEnv()`'s interactive prompt doesn't block forever
   in CI (confirmed by hand: this exact failure mode — a process hanging on stdin
   with zero output — is what happened in the local headless-Claude spike before
   this plan was written).
3. **The repo's `auto-commit-push` Stop hook must not fire inside this workflow.**
   `.claude/hooks/auto-commit-push.sh` auto-commits and pushes to `origin` at the
   end of every Claude turn on any non-`main` branch. If it fires inside the new
   workflow's `claude -p` call, it pushes directly instead of waiting for the
   workflow's own controlled commit-and-PR step — defeating the entire "PR, not
   auto-merge" goal. Task 1 adds a guard so it no-ops under `GITHUB_ACTIONS=true`,
   which every GitHub Actions runner sets automatically.
4. **Phase 1 scope:** only `kind = 'new_tool'` suggestions. `tool_edit` and
   `tool_placement` are out of scope (per spec).
5. **No auto-merge, no auto-reviewer-assignment** in phase 1 (per spec).

---

## File Structure

| File | Responsibility |
|---|---|
| `.claude/hooks/auto-commit-push.sh` | Modify: add `GITHUB_ACTIONS` guard (Task 1) |
| `.github/workflows/tool-page-generate.yml` | Create: the new workflow (Task 2) |
| `supabase/functions/suggestion-approved-relay/index.ts` | Create: the relay Edge Function (Task 3) |
| `supabase/functions/suggestion-approved-relay/index.test.ts` | Create: unit tests for the relay's payload reshaping (Task 3) |
| `supabase/migrations/013_suggestion_approved_webhook.sql` | Create: the Database Webhook definition (Task 4) |
| `docs/superpowers/specs/2026-10-12-auto-generate-tool-page-design.md` | Reference only, not modified |

Task order is deliberately: **hook guard → workflow → relay → webhook**, inside-out.
Each task is independently testable without the one after it existing yet (e.g. you
can test the workflow with a manual `workflow_dispatch` trigger before the webhook
exists at all).

---

### Task 1: Guard the auto-commit-push hook against CI

**Files:**
- Modify: `.claude/hooks/auto-commit-push.sh:11` (right after `cat >/dev/null 2>&1 || true`)
- Test: manual (see Step 2)

- [ ] **Step 1: Add the guard**

Open `.claude/hooks/auto-commit-push.sh`. Immediately after the stdin-drain line
(`cat >/dev/null 2>&1 || true   # drain stdin`), add:

```bash
# Never auto-commit/push inside CI. Every GitHub Actions runner sets this.
# Automated workflows (e.g. tool-page-generate.yml) own their own commit/PR
# step; this hook pushing underneath them would bypass PR review entirely.
[ "${GITHUB_ACTIONS:-}" = "true" ] && exit 0
```

The file should now read, from the top:

```bash
#!/usr/bin/env bash
# Stop hook: commit any uncommitted changes and push to the current branch.
# - No-op when the tree is clean.
# - Never commits/pushes on main or master (safety).
# - Never runs in a detached HEAD.
# - Never runs inside GitHub Actions (automated workflows own their own commits).
# - Commits are authored/committed as Claude <noreply@anthropic.com> so they
#   show as Verified and satisfy the git-check stop hook.
# Reads the hook JSON on stdin but does not need any of it; stdin is drained
# so the writer never blocks.
set -uo pipefail
cat >/dev/null 2>&1 || true   # drain stdin

# Never auto-commit/push inside CI. Every GitHub Actions runner sets this.
# Automated workflows (e.g. tool-page-generate.yml) own their own commit/PR
# step; this hook pushing underneath them would bypass PR review entirely.
[ "${GITHUB_ACTIONS:-}" = "true" ] && exit 0

# Resolve repo root (prefer the harness-provided project dir).
repo="${CLAUDE_PROJECT_DIR:-}"
...
```

- [ ] **Step 2: Verify manually**

```bash
cd "ai-tool-review/.worktrees/tool-page-webhook-spike"
echo "test change" >> README.md
GITHUB_ACTIONS=true bash .claude/hooks/auto-commit-push.sh < /dev/null
git status --porcelain   # should still show README.md modified — hook no-op'd
git checkout README.md   # revert the test change
```

Expected: `git status --porcelain` shows `M README.md` (uncommitted), proving the
hook exited before staging/committing anything when `GITHUB_ACTIONS=true`.

- [ ] **Step 3: Commit**

```bash
git add .claude/hooks/auto-commit-push.sh
git commit -m "fix: never auto-commit/push inside GitHub Actions

The hook would otherwise push directly to the branch from inside
tool-page-generate.yml's headless Claude step, bypassing the PR it's
supposed to open."
```

---

### Task 2: `tool-page-generate.yml` workflow (manually triggerable first)

Build this to run via `workflow_dispatch` first — before the webhook or relay
exist — so it can be tested end-to-end in isolation. `repository_dispatch` is added
as a second trigger once Task 3/4 exist; the job body doesn't change.

**Files:**
- Create: `.github/workflows/tool-page-generate.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Generate Tool Page on Approval

on:
  repository_dispatch:
    types: [suggestion-approved]
  workflow_dispatch:
    inputs:
      note:
        description: 'Manual test run (apply-suggestions.mjs picks up whatever is approved in Supabase right now)'
        required: false

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: tool-page-generate
  cancel-in-progress: false

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Create branch
        id: branch
        run: |
          branch="tool-page/auto-$(date +%Y%m%d-%H%M%S)"
          git checkout -b "$branch"
          echo "branch=$branch" >> "$GITHUB_OUTPUT"

      - name: Apply approved suggestions (structural fields)
        id: apply
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          set -o pipefail
          npm run apply-suggestions -- --yes | tee apply-output.txt
          if ! grep -q '^APPLIED ' apply-output.txt; then
            echo "No suggestions applied — nothing to generate content for."
            echo "applied=false" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          echo "applied=true" >> "$GITHUB_OUTPUT"

      - name: Stop here if nothing was applied
        if: steps.apply.outputs.applied != 'true'
        run: |
          git checkout main
          git branch -D "${{ steps.branch.outputs.branch }}"

      - name: List newly created tool files
        if: steps.apply.outputs.applied == 'true'
        id: files
        run: |
          files="$(git status --porcelain | awk '$1=="A" || $1=="??" {print $2}' | grep '^data/_tools/.*\.md$' || true)"
          echo "files<<EOF" >> "$GITHUB_OUTPUT"
          echo "$files" >> "$GITHUB_OUTPUT"
          echo "EOF" >> "$GITHUB_OUTPUT"

      - name: Commit structural changes
        if: steps.apply.outputs.applied == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add data/_tools data/_landscape_changelog.yaml
          git commit -m "chore(suggestions): apply approved tool suggestions"

      - name: Generate narrative content with Claude Code
        if: steps.apply.outputs.applied == 'true'
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_ACTIONS: 'true'
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          npm install -g @anthropic-ai/claude-code
          for f in ${{ steps.files.outputs.files }}; do
            claude -p "Use the tool-page-content skill to fill in the rich content sections (key stats, overview, verdict, pros/cons with sources, pricing, expandable details, comparison table if relevant) for the existing tool page at $f. Its frontmatter and description already exist and are correct — do not change website, slug, category, subcategory, or type. Research the tool's real website and GitHub repo (if any) per the skill's pre-flight checks before writing any claims. Then sync js/data.js per the skill's instructions. Only touch $f and js/data.js." \
              --output-format json \
              --allowedTools "Read,Edit,Bash(curl:*),Bash(gh:*),Bash(node:*),WebFetch,WebSearch" \
              --permission-mode bypassPermissions \
              | tee -a claude-output.jsonl
          done

      - name: Validate js/data.js sync
        if: steps.apply.outputs.applied == 'true'
        run: node scripts/validate-data-js.js

      - name: Commit content + push
        if: steps.apply.outputs.applied == 'true'
        run: |
          git add data/_tools js/data.js
          git commit -m "content: generate tool page content via Claude"
          git push -u origin "${{ steps.branch.outputs.branch }}"

      - name: Open PR
        if: steps.apply.outputs.applied == 'true'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh pr create \
            --title "Auto-generated tool page(s) from approved suggestions" \
            --body "Opened automatically by tool-page-generate.yml. Structural fields came from apply-suggestions.mjs (already validated); narrative content was generated by Claude Code and needs human review before merge — pricing, features, and pros/cons are claims, not verified facts." \
            --base main \
            --head "${{ steps.branch.outputs.branch }}"
```

- [ ] **Step 2: Add required repo secrets (manual, one-time, not committed)**

In GitHub repo settings → Secrets and variables → Actions, add:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (same values used locally per
  `.env.example`)
- `ANTHROPIC_API_KEY`

`GITHUB_TOKEN` is auto-provided; the default permissions block above
(`contents: write`, `pull-requests: write`) is enough for `gh pr create` and
`git push` against a non-default branch.

- [ ] **Step 3: Test via `workflow_dispatch` against a real approved suggestion**

Approve one real `new_tool` suggestion in the admin UI (or set one `status =
'approved'` directly in Supabase for a test row), then trigger the workflow:

```bash
gh workflow run tool-page-generate.yml
gh run watch
```

Expected: the run creates a branch, applies the suggestion, generates content, opens
a PR. Review the PR's diff by hand — this is the first real validation that headless
Claude's output is usable, not just that the pipeline runs.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/tool-page-generate.yml
git commit -m "feat: add tool-page-generate workflow (manual trigger)"
```

---

### Task 3: Relay Edge Function

**Files:**
- Create: `supabase/functions/suggestion-approved-relay/index.ts`
- Create: `supabase/functions/suggestion-approved-relay/index.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// supabase/functions/suggestion-approved-relay/index.test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { buildDispatchPayload, isApprovalTransition } from "./index.ts";

Deno.test("isApprovalTransition: true only when status becomes approved on a new_tool row", () => {
  assertEquals(isApprovalTransition({
    record: { kind: "new_tool", status: "approved" },
    old_record: { status: "pending" },
  }), true);
});

Deno.test("isApprovalTransition: false when kind is not new_tool", () => {
  assertEquals(isApprovalTransition({
    record: { kind: "tool_edit", status: "approved" },
    old_record: { status: "pending" },
  }), false);
});

Deno.test("isApprovalTransition: false when status was already approved", () => {
  assertEquals(isApprovalTransition({
    record: { kind: "new_tool", status: "approved" },
    old_record: { status: "approved" },
  }), false);
});

Deno.test("isApprovalTransition: false when new status is not approved", () => {
  assertEquals(isApprovalTransition({
    record: { kind: "new_tool", status: "applied" },
    old_record: { status: "approved" },
  }), false);
});

Deno.test("buildDispatchPayload: reshapes into GitHub repository_dispatch shape", () => {
  const out = buildDispatchPayload({ record: { id: "abc-123", kind: "new_tool", status: "approved" } });
  assertEquals(out, {
    event_type: "suggestion-approved",
    client_payload: { suggestion_id: "abc-123" },
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ai-tool-review/.worktrees/tool-page-webhook-spike
deno test supabase/functions/suggestion-approved-relay/index.test.ts
```

Expected: FAIL — `index.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```typescript
// supabase/functions/suggestion-approved-relay/index.ts
// Reshapes a Supabase Database Webhook payload into GitHub's repository_dispatch
// shape and forwards it. Supabase cannot send client_payload directly from a
// webhook config, and the payload shapes don't match, so this exists purely to
// translate between the two — it holds no business logic of its own.

export interface WebhookPayload {
  record: { id?: string; kind?: string; status?: string };
  old_record?: { status?: string };
}

export function isApprovalTransition(payload: WebhookPayload): boolean {
  const { record, old_record } = payload;
  return (
    record.kind === "new_tool" &&
    record.status === "approved" &&
    old_record?.status !== "approved"
  );
}

export function buildDispatchPayload(payload: WebhookPayload) {
  return {
    event_type: "suggestion-approved",
    client_payload: { suggestion_id: payload.record.id },
  };
}

const GITHUB_OWNER = "achisolomon";
const GITHUB_REPO = "ai-tool-review";

Deno.serve(async (req: Request) => {
  const expectedSecret = Deno.env.get("WEBHOOK_SHARED_SECRET");
  const gotSecret = req.headers.get("x-webhook-secret");
  if (!expectedSecret || gotSecret !== expectedSecret) {
    return new Response("unauthorized", { status: 401 });
  }

  const payload: WebhookPayload = await req.json();
  if (!isApprovalTransition(payload)) {
    return new Response("ignored: not an approval transition", { status: 200 });
  }

  const pat = Deno.env.get("GITHUB_PAT");
  if (!pat) {
    console.error("GITHUB_PAT secret is not configured");
    return new Response("server misconfigured", { status: 500 });
  }

  const dispatchRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(buildDispatchPayload(payload)),
    },
  );

  if (!dispatchRes.ok) {
    const body = await dispatchRes.text();
    console.error(`GitHub dispatch failed: ${dispatchRes.status} ${body}`);
    return new Response("dispatch failed", { status: 502 });
  }

  return new Response("dispatched", { status: 200 });
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
deno test supabase/functions/suggestion-approved-relay/index.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Set Edge Function secrets (manual, one-time, not committed)**

```bash
supabase secrets set WEBHOOK_SHARED_SECRET=<generate a random 32+ char string>
supabase secrets set GITHUB_PAT=<a fine-grained PAT scoped to this repo, contents:write + metadata:read only>
```

Record the shared secret value somewhere safe (e.g. a password manager) — it is
also needed in Task 4's webhook config.

- [ ] **Step 6: Deploy and smoke-test**

```bash
supabase functions deploy suggestion-approved-relay --no-verify-jwt
curl -i -X POST "https://<project-ref>.supabase.co/functions/v1/suggestion-approved-relay" \
  -H "x-webhook-secret: <the secret from Step 5>" \
  -H "Content-Type: application/json" \
  -d '{"record":{"id":"00000000-0000-0000-0000-000000000000","kind":"new_tool","status":"approved"},"old_record":{"status":"pending"}}'
```

Expected: `200 dispatched`, and a `repository_dispatch` event fires — confirm via
`gh run list --workflow=tool-page-generate.yml` showing a new run. That run will
fail at the "Apply approved suggestions" step (the UUID in this test payload is
fake), which is fine — this step is only testing that the relay successfully
reaches GitHub, not that an end-to-end approval succeeds.

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/suggestion-approved-relay/
git commit -m "feat: add Supabase Edge Function to relay suggestion approvals to GitHub"
```

---

### Task 4: Supabase Database Webhook

**Files:**
- Create: `supabase/migrations/013_suggestion_approved_webhook.sql`

- [ ] **Step 1: Write the migration**

Database Webhooks created via `supabase_functions.http_request` are the
SQL-expressible form, so this can live in a migration like the rest of the schema
rather than only existing as unversioned dashboard config.

```sql
-- 013_suggestion_approved_webhook.sql
-- Fires the suggestion-approved-relay Edge Function whenever a suggestion row's
-- status transitions to 'approved'. The Edge Function re-checks kind/old status
-- itself (see supabase/functions/suggestion-approved-relay/index.ts) — this
-- trigger fires on every UPDATE and lets the function decide relevance, matching
-- how Supabase Database Webhooks already behave (no column-level filtering on
-- the Postgres side).
-- IDEMPOTENT: safe to re-run.

CREATE OR REPLACE FUNCTION public.notify_suggestion_approved()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.settings.suggestion_relay_url', true),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', current_setting('app.settings.suggestion_relay_secret', true)
    ),
    body := jsonb_build_object(
      'record', to_jsonb(NEW),
      'old_record', to_jsonb(OLD)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_catalog, net;

DROP TRIGGER IF EXISTS notify_suggestion_approved ON public.suggestions;
CREATE TRIGGER notify_suggestion_approved
  AFTER UPDATE ON public.suggestions
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION public.notify_suggestion_approved();
```

- [ ] **Step 2: Set the two Postgres settings this references (manual, one-time)**

Run in the Supabase SQL editor (these are project-level GUCs, not something a
migration file should hardcode since the secret shouldn't live in version control):

```sql
ALTER DATABASE postgres SET app.settings.suggestion_relay_url =
  'https://<project-ref>.supabase.co/functions/v1/suggestion-approved-relay';
ALTER DATABASE postgres SET app.settings.suggestion_relay_secret =
  '<the same WEBHOOK_SHARED_SECRET value from Task 3, Step 5>';
```

- [ ] **Step 3: Apply the migration**

```bash
supabase db push
```

- [ ] **Step 4: End-to-end test with a real suggestion**

Submit a test `new_tool` suggestion through the site's suggestion form (using a
clearly fake tool name, e.g. "ZZZ Spike Test Tool", so it's unambiguous if it
leaks), then approve it in the admin UI.

Expected: within ~1 minute, `gh run list --workflow=tool-page-generate.yml` shows a
new run triggered by `repository_dispatch`, which completes by opening a PR. Review
the PR, then close it without merging (it was a test submission) and reject/delete
the test suggestion row in Supabase.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/013_suggestion_approved_webhook.sql
git commit -m "feat: add Database Webhook firing on suggestion approval"
```

---

## Self-Review

**Spec coverage:**
- Webhook → GitHub auth/payload shape (open question 1) → Task 3 + Task 4, resolved
  via the Edge Function relay.
- Headless Claude in Actions (open question 2) → Task 2, with the `--yes` /
  `bypassPermissions` / `GITHUB_ACTIONS` lessons baked in from the spike.
- Reviewer auto-assignment (open question 3) → explicitly not implemented (Task 2's
  `gh pr create` has no `--reviewer` flag), matching the spec's phase-1 decision.
- Cost (open question 4) → addressed structurally: Claude only runs on files
  `apply-suggestions.mjs` already created, not from scratch.
- Two-apply-steps decision → Task 2's job runs `apply-suggestions.mjs` before the
  Claude step, and the Claude prompt explicitly forbids touching the fields that
  script already wrote.
- Auto-commit-push hook conflict (follow-up decision) → Task 1, done first so Task
  2's testing isn't contaminated by it.

**Placeholder scan:** no TBD/TODO; every step has literal file contents or commands.

**Type/interface consistency:** `isApprovalTransition` and `buildDispatchPayload`
are used identically in the test file and the implementation; the workflow's env
var names (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) match `.env.example`'s
existing names exactly, so `apply-suggestions.mjs` needs no changes to run under
Actions.

---

## Before going live (not required to merge this as phase-1/manual-testing code)

Found by the final cross-cutting review after all four tasks were implemented and
individually approved. Neither item blocks merging this branch, since the explicit
scope is manual `workflow_dispatch` testing with a human watching for the PR — but
both must be addressed before flipping this on for real, unattended admin
approvals, or a failure becomes invisible.

### 1. The chain has zero retry and zero failure notification

`net.http_post` (pg_net) is fire-and-forget: if the Edge Function is down,
misconfigured, or the GitHub dispatch call fails, the Postgres trigger still
returns success and the admin's approval UPDATE commits normally. Nothing
anywhere (Postgres, pg_net, the Edge Function, GitHub) retries a dropped
`repository_dispatch`, and no error surfaces to anyone. Net effect: an admin
approves a tool, sees success, and the page may simply never get generated with
no indication why. Before production use, add at minimum a monitoring signal —
e.g. a scheduled check for "any `approved` suggestion older than N minutes with
no corresponding branch/PR" — so a silent failure doesn't go unnoticed
indefinitely.

### 2. Consolidated manual-setup checklist

The steps below are scattered across this document by task, plus one
prerequisite that was never written down anywhere until now.

- [ ] **Enable the `pg_net` extension** on the target Supabase project (via the
  Supabase dashboard, or `CREATE EXTENSION IF NOT EXISTS pg_net;`). No migration
  in this repo does this — migration 012 assumes `net.http_post` already exists.
  Hosted Supabase projects commonly have it enabled by default, but this is not
  guaranteed and was never an explicit checklist item before this section existed.
- [ ] **GitHub repo secrets** (Settings → Secrets and variables → Actions):
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` (Task 2, Step 2).
- [ ] **Supabase Edge Function secrets**: `WEBHOOK_SHARED_SECRET` (generate a
  random 32+ char string), `GITHUB_PAT` (fine-grained, scoped to this repo,
  `contents:write` + `metadata:read` only) (Task 3, Step 5).
- [ ] **Postgres GUCs** (via the Supabase SQL editor):
  `app.settings.suggestion_relay_url`, `app.settings.suggestion_relay_secret` —
  the latter must match the Edge Function's `WEBHOOK_SHARED_SECRET` value exactly
  (Task 4, Step 2).
- [ ] **Deploy the Edge Function**: `supabase functions deploy
  suggestion-approved-relay --no-verify-jwt` (Task 3, Step 6).
- [ ] **Apply the migration**: `supabase db push` (Task 4, Step 3).
- [ ] Run one real end-to-end test (a clearly-fake test suggestion, per Task 4
  Step 4) and confirm a PR actually opens before trusting this for real
  approvals.
