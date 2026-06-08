-- =============================================
-- TASK 2: AI LANDSCAPE REVIEWS - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- IDEMPOTENT: Safe to re-run multiple times
-- =============================================

-- Tools table (mirrors existing tools.json + review aggregates)
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  logo_url TEXT,
  type TEXT CHECK (type IN ('oss', 'saas', 'commercial')) DEFAULT 'saas',

  -- Open Source specific fields
  github_url TEXT,
  github_stars INTEGER,
  github_stars_updated_at TIMESTAMPTZ,
  is_open_source BOOLEAN DEFAULT FALSE,

  -- Aggregated review data (denormalized for fast reads)
  average_rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  rating_distribution JSONB DEFAULT '{"5":0,"4":0,"3":0,"2":0,"1":0}',

  -- AI Summary (generated periodically)
  ai_summary TEXT,
  ai_summary_generated_at TIMESTAMPTZ,
  pros_aggregated JSONB DEFAULT '[]',
  cons_aggregated JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookups (idempotent)
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Author info (denormalized for display without joins)
  author_name TEXT NOT NULL,
  author_initial TEXT NOT NULL,
  company_size TEXT CHECK (company_size IN ('solo', 'small', 'mid', 'enterprise')),

  -- Ratings
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5) NOT NULL,
  ease_of_use_rating INTEGER CHECK (ease_of_use_rating BETWEEN 1 AND 5),
  features_rating INTEGER CHECK (features_rating BETWEEN 1 AND 5),
  value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
  support_rating INTEGER CHECK (support_rating BETWEEN 1 AND 5),

  -- Content (structured Q&A)
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  like_best TEXT NOT NULL,  -- Constraint added below
  dislike TEXT,  -- Optional, constraint added below

  -- Context
  time_used TEXT CHECK (time_used IN ('less_than_month', 'one_to_six', 'six_to_twelve', 'more_than_year')),
  would_recommend BOOLEAN DEFAULT TRUE,

  -- Source & Validation
  source TEXT CHECK (source IN ('organic', 'invited', 'imported')) DEFAULT 'organic',
  is_validated BOOLEAN DEFAULT FALSE,
  validation_method TEXT CHECK (validation_method IN ('email_domain', 'linkedin', 'manual')),

  -- Moderation
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',

  -- Extracted tags (for aggregation)
  extracted_pros TEXT[] DEFAULT '{}',
  extracted_cons TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_reviews_tool_id ON reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_tool_status_created ON reviews(tool_id, status, created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tools_updated_at ON tools;
CREATE TRIGGER tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS reviews_updated_at ON reviews;
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- AGGREGATE STATS TRIGGER
-- Automatically update tool stats when reviews change status
-- =============================================
CREATE OR REPLACE FUNCTION update_tool_review_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_tool_id UUID;
BEGIN
  -- Determine which tool_id to update
  IF TG_OP = 'DELETE' THEN
    target_tool_id := OLD.tool_id;
  ELSE
    target_tool_id := NEW.tool_id;
  END IF;

  -- Recalculate all aggregates for this tool from approved reviews only
  UPDATE tools SET
    review_count = COALESCE((
      SELECT COUNT(*) FROM reviews
      WHERE tool_id = target_tool_id AND status = 'approved'
    ), 0),
    average_rating = COALESCE((
      SELECT ROUND(AVG(overall_rating)::numeric, 1) FROM reviews
      WHERE tool_id = target_tool_id AND status = 'approved'
    ), 0),
    rating_distribution = COALESCE((
      SELECT jsonb_object_agg(rating::text, cnt)
      FROM (
        SELECT overall_rating as rating, COUNT(*) as cnt
        FROM reviews
        WHERE tool_id = target_tool_id AND status = 'approved'
        GROUP BY overall_rating
      ) counts
    ), '{"5":0,"4":0,"3":0,"2":0,"1":0}'::jsonb)
  WHERE id = target_tool_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_tool_stats_on_review_change ON reviews;
CREATE TRIGGER update_tool_stats_on_review_change
  AFTER INSERT OR UPDATE OF status OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_tool_review_stats();

-- =============================================
-- API ACCESS GRANTS
-- Required for Supabase Data API to access tables
-- =============================================

-- Grant SELECT to anonymous users (public read access)
GRANT SELECT ON public.tools TO anon;
GRANT SELECT ON public.reviews TO anon;

-- Grant permissions to authenticated users
GRANT SELECT ON public.tools TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

-- =============================================
-- SCHEMA MIGRATIONS (idempotent fixes)
-- Run these to fix/update existing schemas
-- =============================================

-- Drop problems_solved column if it exists (removed from schema)
ALTER TABLE reviews DROP COLUMN IF EXISTS problems_solved;

-- Make optional columns nullable
DO $$
BEGIN
  -- Make dislike nullable if not already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'dislike' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE reviews ALTER COLUMN dislike DROP NOT NULL;
  END IF;

  -- Make time_used nullable if not already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'time_used' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE reviews ALTER COLUMN time_used DROP NOT NULL;
  END IF;

  -- Make would_recommend have a default
  ALTER TABLE reviews ALTER COLUMN would_recommend SET DEFAULT TRUE;
END $$;

-- Fix like_best constraint (minimum 10 chars)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_like_best_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_like_best_check CHECK (char_length(like_best) >= 10);

-- Fix dislike constraint (optional, but if provided must be 10+ chars)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_dislike_check;
ALTER TABLE reviews ADD CONSTRAINT reviews_dislike_check CHECK (dislike IS NULL OR char_length(dislike) >= 10);
