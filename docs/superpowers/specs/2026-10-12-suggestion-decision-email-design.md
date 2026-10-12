# Email notifications for suggestion submission and decisions

**Date:** 2026-10-12
**Status:** Proposed (design)
**Scope:** Phase 1 only, two email triggers around the existing suggestions
flow:
1. **On submission** (`createSuggestion`, before any admin has looked at it):
   notify the site owner immediately that a new suggestion came in.
2. **On decision** (admin clicks Approve/Reject in `admin.html`): email the
   submitter the outcome, and send the owner a separate confirmation copy.

Both triggers send the owner's copy to the same address,
`achisolomon+contactaitool@gmail.com`, and the submitter-facing decision
email's `reply_to` also points there, so a submitter's reply reaches the
owner too, all without building inbound parsing. No parsing of reply
*content* and no in-app notification center. Both are explicitly deferred
(see Non-goals and Future phases).

## Problem

Today, two gaps:

1. A new suggestion lands via `createSuggestion`
   ([js/supabase-client.js:272-278](../../../js/supabase-client.js#L272-L278))
   and sits `pending` until the owner happens to open `admin.html` and check
   the queue. There is no push when one arrives, the owner finds out only by
   polling the admin console (see `getSuggestionPendingCount`,
   [js/admin-api.js:311-319](../../../js/admin-api.js#L311-L319)).
2. Once a decision is made (`admin.html` lets an admin approve or reject a
   community suggestion via `js/admin-suggestions.js` →
   `window.AdminAPI.approveSuggestion` / `rejectSuggestion`, see
   [js/admin-api.js:327-362](../../../js/admin-api.js#L327-L362)), the
   decision, including the rejection note the admin types, is written to
   `suggestions.admin_note` in Supabase, but nothing tells the submitter.
   They only find out if they log back in and check `my-suggestions.html`.
   For a rejection with a specific, actionable note (e.g. "the website
   https://hotellobbyai.art/ is not accessible, are you sure it is
   online?"), that note is wasted unless the submitter happens to return.

## Goal

**On submission:** the moment `createSuggestion` successfully inserts a new
row ([js/supabase-client.js:272-278](../../../js/supabase-client.js#L272-L278),
the single insert path every submission kind goes through: new tool,
taxonomy change, placement, edit), send the site owner
(`achisolomon+contactaitool@gmail.com`) an email with the suggestion's
one-line summary and a direct link into `admin.html`, so review can start
without the owner having to remember to check.

**On decision:** when an admin clicks **Approve** or **Reject** in the
existing decision panel, automatically send the submitter an email
containing the decision and (for rejections) the admin's note, from
`contact@aitoolreview.ai`, with a link back to `my-suggestions.html`. At the
same time, send the site owner a copy so a decision made from any admin
session (including one the owner didn't make themselves, e.g. a moderator)
is always confirmed in the owner's inbox, not dependent on remembering to
check the admin console later. The submitter email's `reply_to` also points
at that same owner alias, so if the submitter replies, the owner is notified
of that too, through the same inbox and label, with no separate
reply-handling system to build.

### Non-goals (deferred to later phases, see bottom)

- Parsing/receiving email replies, or threading them into the admin console.
- An in-app notification bell/badge.
- Emailing on `markSuggestionApplied` (applied is a quiet, mechanical
  follow-up to an already-notified approval; not worth a second email in
  phase 1).
- A compose UI separate from the existing reject-note textarea / approve
  button, phase 1 reuses what's already in the decision panel verbatim.
- Any change to the `suggestions` table schema or RLS. `admin_note`,
  `reviewed_by`, `reviewed_at`, and the row itself already carry everything
  both emails need.
- Notifying the submitter on submission ("we received your suggestion"),
  only the owner is notified at submission time; the submitter's first email
  is still the decision email. (Easy to add later if wanted; kept out of
  phase 1 to match what was actually asked for.)

## Why an Edge Function (not a client-side fetch to Resend)

The Resend API key is a secret. `admin-suggestions.js` runs in the browser
with only the Supabase anon key ([js/supabase-client.js:8](../../../js/supabase-client.js#L8),
"NEVER commit or use service_role keys in client-side code"). The email send
must happen server-side. A Supabase Edge Function is the natural fit: it's
already the project's backend (no new hosting target), and it can read the
`RESEND_API_KEY` as a Supabase secret, never shipped to the browser.

## Design

Two independent flows share the same Resend/domain/owner-alias plumbing:
**A, on submission** (new, owner-only) and **B, on decision** (submitter +
owner, as already designed above). They are separate Edge Functions with
separate triggers; neither depends on the other.

### A. On-submission notification

#### A1. New Supabase Edge Function: `supabase/functions/notify-new-suggestion/index.ts`

Deno-based. Responsibilities:

- Accept a POST with `{ suggestion_id: string }`.
- No staff check needed here, unlike the decision function, this is invoked
  by the *submitter's own* authenticated request right after their own
  insert succeeds (RLS already allows a user to read their own suggestion
  row, see `"Users read own suggestions"` in
  [009_suggestions.sql:132-135](../../../supabase/migrations/009_suggestions.sql#L132-L135)).
  The function uses the service_role client only to read `user_profiles` for
  a display name/email if useful in the body; it does not need to assert
  who the submitter is beyond what RLS already scoped the row read to.
- Look up the suggestion by id to get `kind`, `payload`, `tool_slug`,
  `rationale`, `created_at`.
- Build subject + body (see Email content below) and POST to Resend:
  `from: "AI Tool Review <contact@aitoolreview.ai>"`,
  `to: Deno.env.get('OWNER_EMAIL')` (the
  `achisolomon+contactaitool@gmail.com` alias), `reply_to` omitted (owner
  emailing themselves is not a flow to support).
- Return `{ sent: boolean }`. On Resend failure, log and return `sent:
  false` with 200, the suggestion already exists in the DB regardless of
  whether this notification goes out; a submitter must never see their
  submission fail because the owner-notify email failed.

#### A2. Client-side trigger: `js/supabase-client.js`

Extend `createSuggestion` to invoke the Edge Function *after* the insert
succeeds, fire-and-forget:

```js
async function createSuggestion(row) {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: { message: 'Supabase not initialized' } };
    const user = await getCurrentUser();
    if (!user) return { data: null, error: { message: 'Sign in required' } };
    const result = await supabase.from('suggestions').insert({ ...row, user_id: user.id, status: 'pending' }).select().single();
    if (!result.error && result.data) {
        supabase.functions.invoke('notify-new-suggestion', { body: { suggestion_id: result.data.id } })
            .catch(err => console.error('[Supabase] new-suggestion email failed to send', err));
    }
    return result;
}
```

The submitter's own submit flow (`js/suggest.js`) is untouched, it already
calls `createSuggestion` and reacts only to `{ data, error }`; the new email
call is internal to `createSuggestion` and invisible to callers.

#### A3. Email content (on-submission, owner-only)

- Subject: `[AI Tool Review] New suggestion: <one-line summary>`
- Body: the suggestion's one-line summary (same `oneLiner(s)` logic, ported
  to Deno as in the decision function), `kind`, `tool_slug` if present,
  `rationale` if present, and a direct link into `admin.html`'s suggestions
  queue so the owner can act immediately.

### B. On-decision notification

#### B1. New Supabase Edge Function: `supabase/functions/notify-suggestion-decision/index.ts`

Deno-based (standard for Supabase Edge Functions). Responsibilities:

- Accept a POST with `{ suggestion_id: string }`.
- Verify the caller is staff: read the caller's JWT (passed through by
  Supabase's function gateway), check `user_roles` for `admin`/`moderator`,
  same check `checkIsAdmin()` already does client-side
  ([js/admin-api.js:21-50](../../../js/admin-api.js#L21-L50)), duplicated
  server-side since this function must not trust the client. Reject with 403
  otherwise.
- Look up the suggestion by id (service_role client, bypasses RLS, this is
  server code, not exposed to the browser) to get `status`, `admin_note`,
  `kind`, `payload`, `user_id`.
- Reject (400) if `status` is not `approved` or `rejected`, this function
  only fires on a terminal decision, not on `pending`/`applied`.
- Look up the submitter's email via `user_profiles.id = user_id` (same table
  the existing reviewer-email-admin feature already reads for admin display,
  see [reviewer-email-admin-design.md](2026-07-14-reviewer-email-admin-design.md)).
  If no `user_id` or no profile email, return success with
  `{ sent: false, reason: 'no account email' }` (same "degrade, don't block"
  posture as that earlier feature; a missing email must not surface as a
  failed approve/reject).
- Build subject + body (see Email content below).
- Call Resend's API (`POST https://api.resend.com/emails`) with
  `from: "AI Tool Review <contact@aitoolreview.ai>"`, `to`, `subject`, `html`,
  `reply_to: Deno.env.get('OWNER_EMAIL')` (the
  `achisolomon+contactaitool@gmail.com` alias) using `RESEND_API_KEY` from
  `Deno.env.get(...)`. Pointing `reply_to` at the owner's own alias (not
  `contact@`) is what makes a submitter's reply land directly in the owner's
  inbox, pre-filterable, see Reply routing below.
- Separately, send a second, distinct email to the site owner
  (`OWNER_EMAIL` env var, set to `achisolomon+contactaitool@gmail.com`, kept as a secret/env
  var rather than hardcoded so it isn't baked into source) confirming the
  decision. This is a **separate `to`, not a `bcc`** on the submitter's email:
  the owner copy carries different content (an admin.html deep link, the
  submitter's email address, which wouldn't belong in the submitter-facing
  email), and keeping it a distinct send means a Resend failure on one send
  doesn't silently swallow the other. Each is logged and reported
  independently in the function's return value.
- Both sends are attempted even if one fails; the function does not short
  circuit on the first error. Return
  `{ submitter_sent: boolean, owner_sent: boolean }` reflecting each
  independently.
- On any Resend failure, log and still return 200 with the relevant `*_sent:
  false` (the approve/reject itself already succeeded in the DB, email is
  best-effort and must not make the admin think the decision failed).

#### B2. Client-side trigger: `js/admin-api.js`

Extend `approveSuggestion` and `rejectSuggestion` to invoke the Edge Function
*after* the DB update succeeds, fire-and-forget style (don't block the UI on
email delivery):

```js
async function rejectSuggestion(id, note) {
    const supabase = await getSupabaseOrNull();
    if (!supabase) return { success: false, error: 'not initialized' };
    if (!note || !note.trim()) return { success: false, error: 'A note is required to reject.' };
    const user = await window.SupabaseClient.getCurrentUser();
    const { error } = await supabase
        .from('suggestions')
        .update({
            status: 'rejected',
            admin_note: note.trim(),
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
    if (!error) notifySuggestionDecision(supabase, id); // fire-and-forget
    return { success: !error, error: error?.message };
}

function notifySuggestionDecision(supabase, id) {
    supabase.functions.invoke('notify-suggestion-decision', { body: { suggestion_id: id } })
        .catch(err => console.error('[AdminAPI] decision email failed to send', err));
}
```

Same one-line addition in `approveSuggestion`. The admin's approve/reject
click resolves exactly as fast as it does today; email delivery happens
async and a failure there never surfaces as a failed decision (matches the
"supplementary, not blocking" rule the email-display feature already set).

#### B3. Email content

**Approved:**
- Subject: `Your suggestion was approved, AI Tool Review`
- Body: one line confirming approval, the suggestion's one-line summary
  (reuse the same `oneLiner(s)` logic already in
  [js/admin-suggestions.js:62-81](../../../js/admin-suggestions.js#L62-L81),
  ported to the Edge Function since it can't import browser JS; small
  duplicated switch, kind → summary, not worth sharing a module over Deno/browser
  boundary for four lines of string building), a link to `my-suggestions.html`.

**Rejected:**
- Subject: `Update on your suggestion, AI Tool Review`
- Body: the suggestion's one-line summary, then the admin's note verbatim
  (this is the whole point, "the website https://hotellobbyai.art/ is not
  accessible, are you sure it is online?" shows up in the email body, not
  just in a DB column nobody but the admin ever reads), a link to
  `my-suggestions.html` so they can revise and resubmit.

Both: plain, short, no marketing styling, this is a status update, not a
newsletter. `reply_to: achisolomon+contactaitool@gmail.com` so a submitter's
reply goes straight to the owner's inbox, pre-tagged by the `+contactaitool`
alias for filtering (phase 1 doesn't parse reply *content*, but the owner is
notified the normal Gmail way the instant a reply arrives, see Reply
routing below).

**Owner copy (new, sent separately to `achisolomon+contactaitool@gmail.com`):**
- Subject: `[AI Tool Review] Suggestion {approved|rejected}: <one-line summary>`
- Body: same one-line summary, the submitter's email (for context, this
  email is staff-only, unlike the submitter's copy), the admin note if
  present, and a direct link to the suggestion in `admin.html` (deep link via
  `admin.html?suggestion=<id>` if the admin UI supports opening a specific
  suggestion on load, otherwise a plain link to `admin.html` suggestions
  view; confirm which when implementing).
- `from: contact@aitoolreview.ai`, no `reply_to` override needed (default
  reply-to is fine since the owner replying to themselves isn't a flow this
  needs to support).

#### B4. Reply routing, straight to the owner's Gmail (new)

Goal: when a submitter hits "Reply" on the decision email, the owner is
notified the moment it arrives, distinctly from other mail, without
building any inbound parsing (that's phase 2, see Future phases) and without
a new Cloudflare Email Routing destination.

- Both the submitter email's `reply_to` (B3) and the owner-copy email's `to`
  (`OWNER_EMAIL`) point at `achisolomon+contactaitool@gmail.com`. Gmail's
  native `+alias` addressing delivers it straight into the owner's existing
  inbox, no forwarding rule needed, no separate mailbox to check.
- In Gmail, add a filter: `to:achisolomon+contactaitool@gmail.com` → apply a
  label (e.g. `AI Tool Review`), optionally also "Mark as important" / ensure
  mobile push is on for that label. This is what actually delivers the
  "notify me on every submission and every reply" outcome: the
  on-submission email (A3), the owner-copy decision email (B3), and any
  submitter reply all land under the same tag, triggering Gmail's normal
  new-mail notification, visually distinct from personal mail.
- This is pure mail addressing, no Edge Function logic beyond using the
  alias as a literal string, no Cloudflare Email Routing rule, no schema
  change. It costs nothing and needs no DNS change beyond what `contact@`
  already requires for sending (C, below).

## C. Domain / sending setup (one-time, outside the codebase, shared by A and B)

- Resend account, add domain `aitoolreview.ai`.
- Add Resend's SPF/DKIM TXT records to Cloudflare DNS for the zone (few
  minutes, standard Resend "Verify Domain" flow).
- Cloudflare Email Routing rule: `contact@aitoolreview.ai` → forward to the
  admin's working inbox (used by the `from` address on every email in both
  flows, and as a general project contact address).
- Gmail filter on `to:achisolomon+contactaitool@gmail.com` (B4), no
  Cloudflare rule needed for this part, since the alias already resolves to
  the owner's own Gmail account.
- Supabase secrets, shared by both Edge Functions:
  `supabase secrets set RESEND_API_KEY=...` and
  `supabase secrets set OWNER_EMAIL=achisolomon+contactaitool@gmail.com`
  (neither committed, neither sent to the browser).

## Data flow

```
Submitter completes the suggest form
  -> SupabaseClient.createSuggestion(row)  (unchanged insert, status: pending)
  -> on success: supabase.functions.invoke('notify-new-suggestion', { suggestion_id })
       -> Edge Function loads the suggestion (kind, payload, tool_slug, rationale)
       -> builds subject/body
       -> POST to Resend API, from contact@aitoolreview.ai, to OWNER_EMAIL
  -> owner receives "New suggestion" email with an admin.html link

Admin clicks Approve/Reject in admin.html decision panel
  -> AdminAPI.approveSuggestion/rejectSuggestion (unchanged DB update)
  -> on success: supabase.functions.invoke('notify-suggestion-decision', { suggestion_id })
       -> Edge Function verifies caller is staff
       -> loads suggestion (status, admin_note, kind, payload, user_id)
       -> loads user_profiles.email for user_id
       -> builds subject/body per status
       -> POST to Resend API (submitter email, from contact@aitoolreview.ai,
          reply_to OWNER_EMAIL) and a separate POST (owner copy, to OWNER_EMAIL)
  -> submitter receives decision email; owner receives confirmation copy;
     admin.html UI already moved on (toast + panel close)
```

## Edge cases

**Flow A (on submission):**
- `createSuggestion` is called for every kind (new_tool, taxonomy_change,
  tool_placement, tool_edit), the owner gets an email for all of them, same
  as the admin queue already shows all of them together.
- `enforce_suggestion_cap` ([009_suggestions.sql:106-121](../../../supabase/migrations/009_suggestions.sql#L106-L121))
  can reject the insert itself (20 pending cap), in that case `result.error`
  is set and the email trigger never fires, matching the function's `if
  (!result.error && result.data)` guard.
- Resend down at submission time → log, `sent: false`, the suggestion is
  already safely in the DB and visible next time the owner opens
  `admin.html` regardless, the email is a convenience push, not the only
  path to discovering it.

**Flow B (on decision):**
- Submitter has no account / `user_id` is null (shouldn't happen, suggestions
  require `auth.users`, see `009_suggestions.sql` NOT NULL, but defensive
  anyway) or profile row missing → skip submitter send, don't error; owner
  copy still sends regardless (independent `*_sent` flags).
- Resend API down or rate-limited → log, return `sent: false`, admin's
  approve/reject already committed; nothing retries automatically in phase 1
  (acceptable: low volume, visible in Edge Function logs if it ever matters).
  Not a public-facing error, matching other emailing done in this app.
- Admin double-clicks Approve before UI disables the button → existing button
  `disabled = true` on click already prevents a double DB update
  ([js/admin-suggestions.js:414-415](../../../js/admin-suggestions.js#L414-L415)),
  so this can't double-fire from the same click.
- `markSuggestionApplied` → intentionally does **not** call either function
  (non-goal above), no "applied" email in either flow.

## Testing

- Both Edge Functions: unit-testable with Deno's test runner.
  - `notify-new-suggestion`: assert correct `to`/`subject`/body built from a
    suggestion row, and `sent: false` (not a thrown error) on a mocked Resend
    failure.
  - `notify-suggestion-decision`: mock the staff check, mock Resend fetch,
    assert correct `from`/`to`/`subject`/body per status for both the
    submitter and owner sends, and assert `submitter_sent: false` (not a
    thrown error) when profile email is missing.
- `js/supabase-client.js`: extend/add a spec asserting `functions.invoke` is
  called with the new suggestion's id after a successful `createSuggestion`,
  and that a failed invoke doesn't change the returned `{ data, error }`.
- `js/admin-api.js`: extend existing Playwright specs
  (`tests/admin-suggestions.spec.js`) to assert `functions.invoke` is called
  with the right `suggestion_id` after a successful approve/reject, and that
  a failed invoke doesn't change the toast/UI outcome.

## Files touched

- `supabase/functions/notify-new-suggestion/index.ts`, new (flow A).
- `supabase/functions/notify-suggestion-decision/index.ts`, new (flow B).
- `js/supabase-client.js`, `createSuggestion`, one new call + helper (flow A).
- `js/admin-api.js`, two call sites (`approveSuggestion`, `rejectSuggestion`),
  one new helper (flow B).
- `tests/admin-suggestions.spec.js`, extend (flow B).
- A suggestions-creation spec (new or extended, wherever `createSuggestion`
  is currently covered), extend (flow A).
- (Outside repo) Resend domain verification, Cloudflare DNS records,
  Cloudflare Email Routing rule, Supabase secrets, Gmail filter.

## Future phases (not in this spec)

- **Phase 2, inbound replies into the console:** Cloudflare Email Worker on
  `contact@aitoolreview.ai` parses replies and writes them to a new
  `suggestion_messages` table, rendered as a thread under the suggestion in
  the decision panel. Turns this from "we emailed them" into the two-way
  conversation already discussed.
- **Phase 3, in-app notification:** a lightweight `notifications` row/badge
  so a logged-in submitter sees the decision even without checking email,
  independent of whether phase 2 ships.
