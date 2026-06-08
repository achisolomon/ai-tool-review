-- =============================================
-- TASK 4: SECURITY HARDENING
-- Run this in Supabase SQL Editor AFTER 002_row_level_security.sql
-- IDEMPOTENT: Safe to re-run multiple times
-- =============================================

-- DEFENSE IN DEPTH: Trigger to prevent users from changing review status
-- The RLS policy WITH CHECK already prevents this, but this trigger adds
-- an extra layer of protection and clearer error messages.

CREATE OR REPLACE FUNCTION prevent_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Allow if user is admin/moderator (check user_roles table)
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ) THEN
    RETURN NEW;
  END IF;

  -- Allow if called by service_role (admin operations)
  -- service_role bypasses RLS entirely, so this trigger catches direct calls
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block status changes by regular users
  RAISE EXCEPTION 'Users cannot modify review status. Status changes require admin approval.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (drop first for idempotency)
DROP TRIGGER IF EXISTS enforce_status_immutability ON reviews;
CREATE TRIGGER enforce_status_immutability
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION prevent_status_change();

-- Add comment documenting security model
COMMENT ON TRIGGER enforce_status_immutability ON reviews IS
  'Prevents users from self-approving reviews. Status can only be changed via admin/moderator roles or service_role (admin dashboard or server-side API).';
