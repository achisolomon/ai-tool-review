-- =============================================
-- MIGRATION 007: User Review Management Policies
-- Allows users to read, update, and delete their own reviews
-- IDEMPOTENT: Safe to re-run multiple times
-- =============================================

-- Allow users to read their own reviews (regardless of status)
-- This is needed to check if user already has a review for a tool
DROP POLICY IF EXISTS "Users can read own reviews" ON reviews;
CREATE POLICY "Users can read own reviews"
ON reviews FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own reviews
-- Status will be reset to 'pending' by the application
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Grant UPDATE and DELETE permissions to authenticated role
GRANT UPDATE, DELETE ON public.reviews TO authenticated;
