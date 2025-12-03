-- Enable Row Level Security on user_follow_up_surveys table
-- User follow-up surveys contain user-specific data (user_id)
-- Users should only see their own follow-up survey records

-- Enable RLS
ALTER TABLE user_follow_up_surveys ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER_FOLLOW_UP_SURVEYS TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own follow-up survey records
CREATE POLICY "Users can read own follow-up surveys" ON user_follow_up_surveys
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own follow-up survey records
-- Note: Typically inserted by the system (trigger on user creation), but policy allows user inserts
CREATE POLICY "Users can insert own follow-up surveys" ON user_follow_up_surveys
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own follow-up survey records
-- (e.g., to mark as completed or dismissed)
CREATE POLICY "Users can update own follow-up surveys" ON user_follow_up_surveys
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own follow-up survey records
CREATE POLICY "Users can delete own follow-up surveys" ON user_follow_up_surveys
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The index on user_id already exists (created in migration 039)
-- This ensures RLS policy checks are performant

