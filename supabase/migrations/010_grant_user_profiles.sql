-- 010_grant_user_profiles.sql
-- Hotfix: 008_user_profiles.sql created the user_profiles table and RLS policies
-- but never GRANTed table privileges. On a fresh Supabase project the default
-- schema grants masked this; after a pause/restore those defaults were stripped,
-- so every query started failing with "permission denied for table user_profiles"
-- (breaking sign-in, which reads/updates the profile on auth).
--
-- RLS decides WHICH rows a role may touch; GRANT decides whether the role may
-- touch the table at all. Both layers are required.
--
-- 008 has been backfilled with these same GRANTs for from-scratch rebuilds; this
-- migration applies them to databases where 008 already ran.
-- IDEMPOTENT: GRANT on an existing privilege is a no-op. Safe to re-run.

GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
