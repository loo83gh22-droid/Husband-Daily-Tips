-- Enable Row Level Security on action_completion_history table
-- Action completion history contains user-specific data (user_id)
-- Users should only see and manage their own action completion history

-- Enable RLS
ALTER TABLE action_completion_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ACTION_COMPLETION_HISTORY TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own action completion history
CREATE POLICY "Users can read own action completion history" ON action_completion_history
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own action completion history
-- (e.g., when completing an action via /api/actions/complete)
CREATE POLICY "Users can insert own action completion history" ON action_completion_history
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own action completion history
-- (e.g., to correct points or penalty calculations if needed)
CREATE POLICY "Users can update own action completion history" ON action_completion_history
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own action completion history
CREATE POLICY "Users can delete own action completion history" ON action_completion_history
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The indexes on user_id already exist (created in migration 045)
-- This ensures RLS policy checks are performant

