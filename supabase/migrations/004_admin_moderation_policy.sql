-- =============================================
-- TASK: ADMIN MODERATION POLICY
-- Run this in Supabase SQL Editor AFTER 002_row_level_security.sql
-- IDEMPOTENT: Safe to re-run multiple times
-- =============================================
-- SECURITY: This migration adds admin capabilities for review moderation
-- Without this, reviews cannot be approved/rejected via the API

-- Create admin roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'moderator')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Index for fast role lookups (used in every RLS policy check)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON public.user_roles TO authenticated;

-- =============================================
-- USER ROLES POLICIES
-- =============================================

-- Users can check their own roles (simple, non-recursive check)
DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;
CREATE POLICY "Users can read own roles"
ON user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- NOTE: We removed "Admins can read all roles" policy because it caused
-- infinite recursion (querying user_roles from within user_roles RLS policy).
-- Admins can still see their own role via the "Users can read own roles" policy.

-- Only service_role can modify roles (admin management via dashboard only)
-- No INSERT/UPDATE/DELETE policies for authenticated users

-- =============================================
-- REVIEW MODERATION POLICIES
-- =============================================

-- Admins and moderators can view ALL reviews (including pending/rejected)
DROP POLICY IF EXISTS "Moderators can view all reviews" ON reviews;
CREATE POLICY "Moderators can view all reviews"
ON reviews FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- Admins and moderators can update any review (for moderation)
DROP POLICY IF EXISTS "Moderators can update any review" ON reviews;
CREATE POLICY "Moderators can update any review"
ON reviews FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- Admins can delete any review (spam removal)
DROP POLICY IF EXISTS "Admins can delete any review" ON reviews;
CREATE POLICY "Admins can delete any review"
ON reviews FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- =============================================
-- TOOLS MANAGEMENT POLICIES (for admins)
-- =============================================

-- Admins can insert new tools
DROP POLICY IF EXISTS "Admins can insert tools" ON tools;
CREATE POLICY "Admins can insert tools"
ON tools FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update tools
DROP POLICY IF EXISTS "Admins can update tools" ON tools;
CREATE POLICY "Admins can update tools"
ON tools FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete tools
DROP POLICY IF EXISTS "Admins can delete tools" ON tools;
CREATE POLICY "Admins can delete tools"
ON tools FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
