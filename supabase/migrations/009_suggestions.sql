-- 009_suggestions.sql
-- Community suggestions queue. Run in Supabase SQL Editor AFTER 008_user_profiles.sql.
-- IDEMPOTENT: safe to re-run.

CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('new_tool','taxonomy_change','tool_placement','tool_edit')),
  tool_slug TEXT,
  payload JSONB NOT NULL,
  rationale TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','applied')),
  admin_note TEXT,
  credit_name TEXT,
  public_credit BOOLEAN NOT NULL DEFAULT true,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  applied_commit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT suggestions_tool_scope_check
    CHECK (kind NOT IN ('tool_placement','tool_edit') OR tool_slug IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS suggestions_status_idx ON public.suggestions (status, created_at);
CREATE INDEX IF NOT EXISTS suggestions_user_idx ON public.suggestions (user_id, status);

-- Enforces the lifecycle transition table, the note-on-reject guarantee,
-- and keeps updated_at fresh. Mirrors 005_security_hardening's actor checks.
CREATE OR REPLACE FUNCTION public.enforce_suggestion_transition()
RETURNS TRIGGER AS $$
DECLARE
  is_staff BOOLEAN;
  is_service BOOLEAN;
BEGIN
  NEW.updated_at := now();  -- maintained on every update

  is_staff := EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin','moderator')
  );
  is_service := current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';

  IF OLD.status = NEW.status THEN
    RETURN NEW;  -- non-status edits (owner editing payload, staff editing payload)
  END IF;

  -- A status change is happening. Only staff or the service role may ever do it.
  IF NOT (is_staff OR is_service) THEN
    RAISE EXCEPTION 'Only admins/moderators can change suggestion status.';
  END IF;

  -- Validate the specific arc.
  IF (OLD.status, NEW.status) IN (('pending','approved'), ('approved','applied'),
                                  ('rejected','pending')) THEN
    NULL;  -- allowed for staff or service
  ELSIF (OLD.status, NEW.status) IN (('pending','rejected'), ('approved','rejected')) THEN
    IF NEW.admin_note IS NULL OR length(trim(NEW.admin_note)) = 0 THEN
      RAISE EXCEPTION 'A rejection requires a non-empty admin_note.';
    END IF;
  ELSIF (OLD.status, NEW.status) = ('applied','approved') THEN
    IF NOT is_service THEN
      RAISE EXCEPTION 'Only the apply script (service_role) can un-apply a suggestion.';
    END IF;
  ELSE
    RAISE EXCEPTION 'Illegal suggestion status transition: % -> %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_suggestion_transition ON public.suggestions;
CREATE TRIGGER enforce_suggestion_transition
  BEFORE UPDATE ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_suggestion_transition();

-- Cap: a user may hold at most 20 pending suggestions.
CREATE OR REPLACE FUNCTION public.enforce_suggestion_cap()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM public.suggestions
      WHERE user_id = NEW.user_id AND status = 'pending') >= 20 THEN
    RAISE EXCEPTION 'You have 20 pending suggestions. Resolve or withdraw some before adding more.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_suggestion_cap ON public.suggestions;
CREATE TRIGGER enforce_suggestion_cap
  BEFORE INSERT ON public.suggestions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_suggestion_cap();

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- INSERT: signed-in users create their own, always born pending.
DROP POLICY IF EXISTS "Users insert own pending suggestions" ON public.suggestions;
CREATE POLICY "Users insert own pending suggestions"
ON public.suggestions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- SELECT: own rows.
DROP POLICY IF EXISTS "Users read own suggestions" ON public.suggestions;
CREATE POLICY "Users read own suggestions"
ON public.suggestions FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- SELECT: staff read all.
DROP POLICY IF EXISTS "Staff read all suggestions" ON public.suggestions;
CREATE POLICY "Staff read all suggestions"
ON public.suggestions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles
               WHERE user_id = auth.uid() AND role IN ('admin','moderator')));

-- UPDATE (own): only while pending, status guarded in BOTH clauses (defense-in-depth).
DROP POLICY IF EXISTS "Users update own pending suggestions" ON public.suggestions;
CREATE POLICY "Users update own pending suggestions"
ON public.suggestions FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND status = 'pending')
WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- UPDATE (staff): any row.
DROP POLICY IF EXISTS "Staff update any suggestion" ON public.suggestions;
CREATE POLICY "Staff update any suggestion"
ON public.suggestions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles
               WHERE user_id = auth.uid() AND role IN ('admin','moderator')));

-- DELETE: own while pending; staff any.
DROP POLICY IF EXISTS "Users delete own pending suggestions" ON public.suggestions;
CREATE POLICY "Users delete own pending suggestions"
ON public.suggestions FOR DELETE TO authenticated
USING (user_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Staff delete any suggestion" ON public.suggestions;
CREATE POLICY "Staff delete any suggestion"
ON public.suggestions FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles
               WHERE user_id = auth.uid() AND role IN ('admin','moderator')));
