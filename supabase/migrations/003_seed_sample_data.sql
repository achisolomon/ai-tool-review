-- =============================================
-- TASK 4 & 10: SEED SAMPLE TOOL AND REVIEW DATA
-- Run this in Supabase SQL Editor AFTER 002_row_level_security.sql
-- IDEMPOTENT: Safe to re-run multiple times
-- =============================================

-- Insert a sample tool (Claude Code) - skip if exists
INSERT INTO tools (
  slug, name, description, url, type,
  is_open_source, github_url, github_stars,
  average_rating, review_count, rating_distribution,
  ai_summary, pros_aggregated, cons_aggregated
) VALUES (
  'claude-code',
  'Claude Code',
  'Anthropic''s official CLI for Claude - an agentic coding assistant that lives in your terminal.',
  'https://claude.ai/claude-code',
  'oss',
  true,
  'https://github.com/anthropics/claude-code',
  45200,
  4.5,
  2,
  '{"5": 1, "4": 1, "3": 0, "2": 0, "1": 0}',
  'Users consistently praise the tool for its **exceptional code understanding** and **multi-file context awareness**. The agentic workflow is highlighted as a major productivity boost.',
  '[{"tag": "Code Understanding", "count": 2}, {"tag": "Multi-file Context", "count": 2}, {"tag": "Agentic Workflow", "count": 1}]',
  '[{"tag": "Token Costs", "count": 1}, {"tag": "Learning Curve", "count": 1}]'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample reviews (skip if tool doesn't exist or reviews already exist)
INSERT INTO reviews (
  tool_id, user_id, author_name, author_initial, company_size,
  overall_rating, title, like_best, dislike,
  time_used, would_recommend, source, is_validated, status
)
SELECT
  t.id,
  NULL,
  'Sarah M.',
  'S',
  'enterprise',
  5,
  'Game-Changer for Our Development Workflow',
  'The multi-file context awareness is exceptional. It understands our entire codebase structure and can make coordinated changes across dozens of files. The agentic workflow lets me describe what I want at a high level, and it figures out the implementation details. Saves me hours every day.',
  'Token costs can add up quickly on large refactoring tasks. Would love to see better cost estimation before starting a task. Also, occasionally it goes down a wrong path and you have to course-correct, which burns tokens.',
  'more_than_year',
  true,
  'organic',
  true,
  'approved'
FROM tools t
WHERE t.slug = 'claude-code'
AND NOT EXISTS (
  SELECT 1 FROM reviews r
  WHERE r.tool_id = t.id AND r.author_name = 'Sarah M.'
);

INSERT INTO reviews (
  tool_id, user_id, author_name, author_initial, company_size,
  overall_rating, title, like_best, dislike,
  time_used, would_recommend, source, is_validated, status
)
SELECT
  t.id,
  NULL,
  'Michael R.',
  'M',
  'mid',
  4,
  'Excellent for Complex Refactoring',
  'The ability to work across multiple files simultaneously is unmatched. I can describe a refactoring task in plain English and watch it execute changes across the entire codebase. The context retention is impressive and it remembers previous conversations.',
  'Sometimes struggles with very large files or complex nested logic. The learning curve was steeper than expected, but worth it. Occasionally needs guidance when dealing with unconventional project structures.',
  'six_to_twelve',
  true,
  'organic',
  true,
  'approved'
FROM tools t
WHERE t.slug = 'claude-code'
AND NOT EXISTS (
  SELECT 1 FROM reviews r
  WHERE r.tool_id = t.id AND r.author_name = 'Michael R.'
);

-- Add another sample tool (Cursor) - skip if exists
INSERT INTO tools (
  slug, name, description, url, type,
  is_open_source, github_url, github_stars,
  average_rating, review_count, rating_distribution
) VALUES (
  'cursor',
  'Cursor',
  'The AI-first code editor. Built on VS Code, enhanced with powerful AI capabilities.',
  'https://cursor.sh',
  'saas',
  false,
  NULL,
  NULL,
  4.3,
  0,
  '{"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}'
)
ON CONFLICT (slug) DO NOTHING;
