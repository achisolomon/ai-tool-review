-- 012_grant_service_role.sql
-- Hotfix: the email Edge Functions (notify-new-suggestion,
-- notify-suggestion-decision) read these tables with the service_role key.
-- Dev gets service_role access from Supabase's default privileges; prod does
-- not, so on prod every read failed with "permission denied for table ..."
-- and no notification email was ever sent. Same gap as 010/011, for a
-- different role. service_role bypasses RLS but still needs table GRANTs.
--
-- Read-only on purpose: the functions only SELECT.
-- IDEMPOTENT: GRANT on an existing privilege is a no-op. Safe to re-run,
-- including on dev where the privilege already exists.

GRANT SELECT ON public.suggestions TO service_role;
GRANT SELECT ON public.user_profiles TO service_role;
GRANT SELECT ON public.user_roles TO service_role;
