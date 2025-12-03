-- Enable Row Level Security on feedback table
-- Feedback contains user-specific data (user_id)
-- Users should only see their own feedback entries

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FEEDBACK TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback" ON feedback
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own feedback (if they want to edit it)
CREATE POLICY "Users can update own feedback" ON feedback
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own feedback (if they want to remove it)
CREATE POLICY "Users can delete own feedback" ON feedback
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The index on user_id already exists (created in migration 032)
-- This ensures RLS policy checks are performant

