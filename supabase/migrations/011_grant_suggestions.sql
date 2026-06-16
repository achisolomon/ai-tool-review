-- 011_grant_suggestions.sql
-- Hotfix: 009_suggestions.sql granted SELECT on public.suggestions to `anon`
-- (so the unauthenticated existence-probe works) but never granted anything
-- to `authenticated`. RLS policies decide WHICH rows a role may touch; GRANT
-- decides whether the role may touch the table AT ALL. Without this grant,
-- every authenticated query (including staff/admin reads) fails at the ACL
-- layer with "permission denied for table suggestions" before RLS even runs
-- — this is what broke the admin Moderation > Suggestions tab.
--
-- IDEMPOTENT: GRANT on an existing privilege is a no-op. Safe to re-run.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.suggestions TO authenticated;
