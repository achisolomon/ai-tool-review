-- reconcile-approved-suggestions.sql
--
-- ONE-OFF DATA RECONCILIATION SCRIPT, not a schema migration. Run manually,
-- by hand, in the Supabase SQL Editor. Not picked up by `supabase db push`
-- (that only runs numbered files in supabase/migrations/).
--
-- Run once per project (dev, then prod) the first time apply-suggestions.mjs /
-- the tool-page-generate.yml workflow is introduced into a project that
-- already has `suggestions` rows sitting at status = 'approved' from manual
-- testing or from tool pages that were built and committed by hand (bypassing
-- the script). apply-suggestions.mjs blindly pulls every 'approved' row and
-- tries to apply it, so stale approved rows need to be reconciled first, or
-- it will try to recreate pages that already exist and fail or duplicate.
--
-- This does NOT blindly flip every 'approved' row to 'applied'. It only marks
-- a row 'applied' when a matching tool already exists in public.tools (by
-- case-insensitive name match for new_tool suggestions, or by tool_slug for
-- tool_edit/tool_placement/taxonomy_change). Anything that doesn't match is
-- left untouched and listed in the final SELECT so it can be decided by hand
-- (reject it, or let it flow through the real pipeline).

-- Step 1: PREVIEW ONLY. Shows what WOULD be marked applied, and what would be
-- left alone. Run this first and read it before running Step 2.
select
  s.id,
  s.kind,
  s.tool_slug,
  s.payload ->> 'name'  as payload_name,
  s.payload ->> 'slug'  as payload_slug,
  s.status,
  t.id   as matched_tool_id,
  t.slug as matched_tool_slug,
  case
    when t.id is not null then 'WOULD MARK APPLIED (matching tool found)'
    else 'LEFT AS-IS (no matching tool found, needs manual review)'
  end as plan
from public.suggestions s
left join public.tools t
  on (
    -- new_tool: match by name, case-insensitive
    (s.kind = 'new_tool' and lower(t.name) = lower(s.payload ->> 'name'))
    or
    -- tool_edit / tool_placement / taxonomy_change: match by tool_slug
    (s.kind != 'new_tool' and s.tool_slug is not null and t.slug = s.tool_slug)
  )
where s.status = 'approved'
order by s.created_at;

-- Step 2: ACTUAL UPDATE. Only run this after reading Step 1's output and
-- agreeing with its plan. This marks 'applied' ONLY the rows that matched an
-- existing tool above. Everything else stays 'approved' untouched.
--
-- Uncomment to run:
--
-- update public.suggestions s
-- set status = 'applied',
--     applied_at = now()
-- from public.tools t
-- where s.status = 'approved'
--   and (
--     (s.kind = 'new_tool' and lower(t.name) = lower(s.payload ->> 'name'))
--     or
--     (s.kind != 'new_tool' and s.tool_slug is not null and t.slug = s.tool_slug)
--   );

-- Step 3: after running Step 2, re-run this to see what's left — these are
-- the suggestions with NO matching tool page. Decide by hand: reject them,
-- or leave them 'approved' so the real apply-suggestions.mjs / workflow
-- picks them up for real next run.
select id, kind, tool_slug, payload ->> 'name' as payload_name, status, created_at
from public.suggestions
where status = 'approved'
order by created_at;
