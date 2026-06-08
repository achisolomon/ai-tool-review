-- =============================================
-- SCHEMA VALIDATION TESTS
-- Run these in Supabase SQL Editor to verify schema is correct
-- All queries should return expected results
-- =============================================

-- Test 1: problems_solved column should NOT exist
-- Expected: 0 rows
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'reviews' AND column_name = 'problems_solved';
-- If this returns any rows, the column needs to be dropped

-- Test 2: dislike column should be NULLABLE
-- Expected: 'YES'
SELECT is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews' AND column_name = 'dislike';

-- Test 3: time_used column should be NULLABLE
-- Expected: 'YES'
SELECT is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews' AND column_name = 'time_used';

-- Test 4: like_best constraint should allow 10+ chars
-- Expected: constraint with CHECK (char_length(like_best) >= 10)
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'reviews'::regclass
  AND conname = 'reviews_like_best_check';

-- Test 5: dislike constraint should allow NULL or 10+ chars
-- Expected: constraint with CHECK (dislike IS NULL OR char_length(dislike) >= 10)
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'reviews'::regclass
  AND conname = 'reviews_dislike_check';

-- Test 6: RLS should be enabled on reviews table
-- Expected: true
SELECT relrowsecurity
FROM pg_class
WHERE relname = 'reviews';

-- Test 7: INSERT policy should exist for authenticated users
-- Expected: 1 row with policyname containing 'create' or 'insert'
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'reviews' AND cmd = 'INSERT';

-- Test 8: Test INSERT with valid data (10+ chars)
-- This should succeed (run as authenticated user)
-- Note: Requires a valid tool_id and user_id
/*
INSERT INTO reviews (tool_id, user_id, author_name, author_initial, overall_rating, title, like_best, status)
VALUES (
  (SELECT id FROM tools LIMIT 1),
  auth.uid(),
  'Test User',
  'T',
  5,
  'Test Review',
  'This is a test review with enough characters',
  'pending'
);
*/

-- Test 9: Test INSERT with short like_best should FAIL
-- This should fail with constraint violation
/*
INSERT INTO reviews (tool_id, user_id, author_name, author_initial, overall_rating, title, like_best, status)
VALUES (
  (SELECT id FROM tools LIMIT 1),
  auth.uid(),
  'Test User',
  'T',
  5,
  'Test Review',
  'Short',  -- Less than 10 chars - should fail
  'pending'
);
*/

-- Test 10: Test INSERT with NULL dislike should succeed
-- This should succeed
/*
INSERT INTO reviews (tool_id, user_id, author_name, author_initial, overall_rating, title, like_best, dislike, status)
VALUES (
  (SELECT id FROM tools LIMIT 1),
  auth.uid(),
  'Test User',
  'T',
  5,
  'Test Review',
  'This is a test review with enough characters',
  NULL,  -- NULL dislike should be allowed
  'pending'
);
*/

-- Test 11: Test INSERT with short dislike should FAIL
-- This should fail with constraint violation
/*
INSERT INTO reviews (tool_id, user_id, author_name, author_initial, overall_rating, title, like_best, dislike, status)
VALUES (
  (SELECT id FROM tools LIMIT 1),
  auth.uid(),
  'Test User',
  'T',
  5,
  'Test Review',
  'This is a test review with enough characters',
  'Short',  -- Less than 10 chars when provided - should fail
  'pending'
);
*/

-- =============================================
-- SUMMARY: Expected Results
-- =============================================
-- Test 1: 0 rows (problems_solved does not exist)
-- Test 2: 'YES' (dislike is nullable)
-- Test 3: 'YES' (time_used is nullable)
-- Test 4: 1 row with >= 10 constraint
-- Test 5: 1 row with NULL OR >= 10 constraint
-- Test 6: true (RLS enabled)
-- Test 7: 1+ rows (INSERT policy exists)
-- Test 8: Success (valid insert)
-- Test 9: Failure (constraint violation)
-- Test 10: Success (NULL dislike allowed)
-- Test 11: Failure (constraint violation)
