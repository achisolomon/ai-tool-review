-- =============================================
-- TASK 3: ROW LEVEL SECURITY POLICIES
-- Run this in Supabase SQL Editor AFTER 001_create_schema.sql
-- IDEMPOTENT: Safe to re-run multiple times
-- =============================================

-- Enable RLS on tables (idempotent - no error if already enabled)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TOOLS TABLE POLICIES
-- =============================================

-- Anyone can read tools (public catalog data)
DROP POLICY IF EXISTS "Public read access for tools" ON tools;
CREATE POLICY "Public read access for tools"
ON tools FOR SELECT
USING (true);

-- =============================================
-- TOOLS MANAGEMENT: Admin-only via service_role or admin policies
-- =============================================
-- SECURITY NOTE: No INSERT/UPDATE/DELETE policies exist for anon/authenticated
-- users in this migration. Tools are managed via:
--   1. Supabase Dashboard (uses service_role)
--   2. Server-side API with service_role key (NEVER expose to client)
--   3. Admin policies in 004_admin_moderation_policy.sql
--
-- The service_role key MUST be kept secret and only used server-side.
-- See: https://supabase.com/docs/guides/auth/row-level-security

-- =============================================
-- REVIEWS TABLE POLICIES
-- =============================================

-- Clean up any temporary/test policies
DROP POLICY IF EXISTS "Allow all inserts" ON reviews;

-- Anyone can read approved reviews
DROP POLICY IF EXISTS "Public read access for approved reviews" ON reviews;
CREATE POLICY "Public read access for approved reviews"
ON reviews FOR SELECT
USING (status = 'approved');

-- Users can see their own reviews (any status) to track submission status
DROP POLICY IF EXISTS "Users can view own reviews" ON reviews;
CREATE POLICY "Users can view own reviews"
ON reviews FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can create reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'  -- New reviews start as pending
);

-- Users can update their own pending reviews
DROP POLICY IF EXISTS "Users can update own pending reviews" ON reviews;
CREATE POLICY "Users can update own pending reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending reviews
DROP POLICY IF EXISTS "Users can delete own pending reviews" ON reviews;
CREATE POLICY "Users can delete own pending reviews"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');
