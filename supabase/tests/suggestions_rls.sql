-- suggestions_rls.sql — run in Supabase SQL Editor against the dev project.
-- These are manual checks; compare each result to its Expected comment.

-- Test 1: structural — status CHECK has all four states.
-- Expected: constraint def mentions pending, approved, rejected, applied
SELECT pg_get_constraintdef(oid) FROM pg_constraint
WHERE conrelid = 'public.suggestions'::regclass AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%status%';

-- Test 2: the two triggers exist.
-- Expected: 2 rows (enforce_suggestion_transition BEFORE UPDATE, enforce_suggestion_cap BEFORE INSERT)
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.suggestions'::regclass AND NOT tgisinternal;

-- Test 3: RLS is enabled.
-- Expected: relrowsecurity = true
SELECT relrowsecurity FROM pg_class WHERE oid = 'public.suggestions'::regclass;

-- Behavioral tests below use a throwaway row. They assume you run them as the
-- service role in the SQL Editor (which bypasses RLS), so they assert the
-- TRIGGER guarantees. RLS-policy assertions (Test 7) require a JWT-scoped
-- client and are covered by the Playwright RLS test in Phase 3.

-- Test 4: rejection without a note is blocked by the trigger.
-- Expected: NOTICE PASS with "A rejection requires a non-empty admin_note."
DO $$
DECLARE sid UUID; uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users LIMIT 1;
  INSERT INTO public.suggestions (user_id, kind, payload, status)
  VALUES (uid, 'new_tool', '{"name":"T"}'::jsonb, 'pending') RETURNING id INTO sid;
  BEGIN
    UPDATE public.suggestions SET status = 'rejected' WHERE id = sid;  -- no note
    RAISE NOTICE 'FAIL: rejection without note was allowed';
  EXCEPTION WHEN others THEN RAISE NOTICE 'PASS: %', SQLERRM;
  END;
  DELETE FROM public.suggestions WHERE id = sid;
END $$;

-- Test 5: illegal transition (pending -> applied) is blocked.
-- Expected: NOTICE PASS with "Illegal suggestion status transition"
DO $$
DECLARE sid UUID; uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users LIMIT 1;
  INSERT INTO public.suggestions (user_id, kind, payload, status)
  VALUES (uid, 'new_tool', '{"name":"T"}'::jsonb, 'pending') RETURNING id INTO sid;
  BEGIN
    UPDATE public.suggestions SET status = 'applied' WHERE id = sid;
    RAISE NOTICE 'FAIL: pending->applied was allowed';
  EXCEPTION WHEN others THEN RAISE NOTICE 'PASS: %', SQLERRM;
  END;
  DELETE FROM public.suggestions WHERE id = sid;
END $$;

-- Test 6: updated_at advances on update.
-- Expected: NOTICE PASS
DO $$
DECLARE sid UUID; uid UUID; t0 TIMESTAMPTZ; t1 TIMESTAMPTZ;
BEGIN
  SELECT id INTO uid FROM auth.users LIMIT 1;
  INSERT INTO public.suggestions (user_id, kind, payload, status)
  VALUES (uid, 'new_tool', '{"name":"T"}'::jsonb, 'pending') RETURNING id, updated_at INTO sid, t0;
  PERFORM pg_sleep(0.01);
  UPDATE public.suggestions SET rationale = 'x' WHERE id = sid;
  SELECT updated_at INTO t1 FROM public.suggestions WHERE id = sid;
  IF t1 > t0 THEN RAISE NOTICE 'PASS: updated_at advanced'; ELSE RAISE NOTICE 'FAIL'; END IF;
  DELETE FROM public.suggestions WHERE id = sid;
END $$;
