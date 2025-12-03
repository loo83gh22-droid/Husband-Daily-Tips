-- Enable Row Level Security on follow_up_survey_responses table
-- Follow-up survey responses contain user-specific data (user_id)
-- Users should only see and manage their own survey responses

-- Enable RLS
ALTER TABLE follow_up_survey_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FOLLOW_UP_SURVEY_RESPONSES TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own survey responses
CREATE POLICY "Users can read own survey responses" ON follow_up_survey_responses
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own survey responses
-- (e.g., when submitting a follow-up survey)
CREATE POLICY "Users can insert own survey responses" ON follow_up_survey_responses
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own survey responses
-- (e.g., to modify a response before final submission)
CREATE POLICY "Users can update own survey responses" ON follow_up_survey_responses
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own survey responses
CREATE POLICY "Users can delete own survey responses" ON follow_up_survey_responses
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The index on user_id already exists (created in migration 039)
-- This ensures RLS policy checks are performant

