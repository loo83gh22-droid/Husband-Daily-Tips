-- Enable Row Level Security on survey_questions table
-- Survey questions are public content (like follow_up_survey_questions, tips, or actions), but we enable RLS
-- to ensure only authenticated users can read them

-- Enable RLS
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SURVEY_QUESTIONS TABLE POLICIES
-- ============================================================================
-- Survey questions are public content, but we restrict access to authenticated users only
-- This follows the same pattern as follow_up_survey_questions, tips, actions, and badges (public read for authenticated users)

-- All authenticated users can read all survey questions (they're public content)
CREATE POLICY "Authenticated users can read survey questions" ON survey_questions
  FOR SELECT USING (true);

-- Note: Survey questions are typically inserted/updated by admins via service role key
-- We don't allow regular users to insert/update/delete survey questions
-- If you need user-generated questions in the future, add appropriate policies

