-- Enable Row Level Security on follow_up_survey_questions table
-- Follow-up survey questions are public content (like actions or badges), but we enable RLS
-- to ensure only authenticated users can read them

-- Enable RLS
ALTER TABLE follow_up_survey_questions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FOLLOW_UP_SURVEY_QUESTIONS TABLE POLICIES
-- ============================================================================
-- Survey questions are public content, but we restrict access to authenticated users only
-- This follows the same pattern as quotes and challenges (public read for authenticated users)

-- All authenticated users can read all follow-up survey questions (they're public content)
CREATE POLICY "Authenticated users can read all follow-up survey questions" ON follow_up_survey_questions
  FOR SELECT USING (true);

-- Note: Survey questions are typically inserted/updated by admins via service role key
-- We don't allow regular users to insert/update/delete survey questions
-- If you need user-generated questions in the future, add appropriate policies

