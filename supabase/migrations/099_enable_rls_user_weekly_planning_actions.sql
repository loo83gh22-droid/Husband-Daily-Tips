-- Enable Row Level Security on user_weekly_planning_actions table
-- This ensures users can only access their own weekly planning actions

-- Enable RLS
ALTER TABLE user_weekly_planning_actions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER_WEEKLY_PLANNING_ACTIONS TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own weekly planning actions
CREATE POLICY "Users can read own weekly planning actions" ON user_weekly_planning_actions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own weekly planning actions
-- Note: Typically inserted by the cron job using service role key, but policy allows user inserts
CREATE POLICY "Users can insert own weekly planning actions" ON user_weekly_planning_actions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own weekly planning actions
CREATE POLICY "Users can update own weekly planning actions" ON user_weekly_planning_actions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own weekly planning actions
CREATE POLICY "Users can delete own weekly planning actions" ON user_weekly_planning_actions
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The index on user_id already exists (created in migration 087)
-- This ensures RLS policy checks are performant

