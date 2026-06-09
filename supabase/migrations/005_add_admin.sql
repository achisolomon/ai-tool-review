-- Add admin role and set up moderation trigger
-- Run this if tables already exist and you just need admin access
-- IDEMPOTENT: Safe to re-run multiple times

-- 1. Add admin role
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'achisolomon@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Create/update the trigger function for status changes
CREATE OR REPLACE FUNCTION prevent_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Allow if user is admin/moderator
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ) THEN
    RETURN NEW;
  END IF;

  -- Allow service_role
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Users cannot modify review status. Status changes require admin approval.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger (drop first for idempotency)
DROP TRIGGER IF EXISTS enforce_status_immutability ON reviews;
CREATE TRIGGER enforce_status_immutability
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION prevent_status_change();
