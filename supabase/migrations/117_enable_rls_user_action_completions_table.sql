-- Enable Row Level Security on user_action_completions table
-- User action completions contain user-specific data (user_id)
-- Users should only see and manage their own action completions

-- Enable RLS
ALTER TABLE user_action_completions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER_ACTION_COMPLETIONS TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own action completions
CREATE POLICY "Users can read own action completions" ON user_action_completions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own action completions
-- (e.g., when completing an action via /api/actions/complete)
CREATE POLICY "Users can insert own action completions" ON user_action_completions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own action completions
-- (e.g., to add notes or update completion details)
CREATE POLICY "Users can update own action completions" ON user_action_completions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own action completions
-- (e.g., to uncomplete an action via DELETE /api/actions/complete)
CREATE POLICY "Users can delete own action completions" ON user_action_completions
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The indexes on user_id already exist (created in migration 008)
-- This ensures RLS policy checks are performant

