-- Enable Row Level Security on health_decay_log table
-- Health decay log contains user-specific data (user_id)
-- Users should only see their own health decay log entries

-- Enable RLS
ALTER TABLE health_decay_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HEALTH_DECAY_LOG TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own health decay log entries
CREATE POLICY "Users can read own health decay log" ON health_decay_log
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own health decay log entries
-- Note: Typically inserted by the system when a day is missed, but policy allows user inserts
CREATE POLICY "Users can insert own health decay log" ON health_decay_log
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own health decay log entries
CREATE POLICY "Users can update own health decay log" ON health_decay_log
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own health decay log entries
CREATE POLICY "Users can delete own health decay log" ON health_decay_log
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The index on user_id already exists (created in migration 045)
-- This ensures RLS policy checks are performant

