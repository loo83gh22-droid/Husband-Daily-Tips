-- Enable Row Level Security on weekly_health_points table
-- Weekly health points contain user-specific data (user_id)
-- Users should only see their own weekly health points

-- Enable RLS
ALTER TABLE weekly_health_points ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- WEEKLY_HEALTH_POINTS TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own weekly health points
CREATE POLICY "Users can read own weekly health points" ON weekly_health_points
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own weekly health points
-- Note: Typically inserted by the system when calculating health scores, but policy allows user inserts
CREATE POLICY "Users can insert own weekly health points" ON weekly_health_points
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own weekly health points
-- Note: Typically updated by the system when calculating health scores, but policy allows user updates
CREATE POLICY "Users can update own weekly health points" ON weekly_health_points
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own weekly health points
CREATE POLICY "Users can delete own weekly health points" ON weekly_health_points
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The index on user_id already exists (created in migration 045)
-- This ensures RLS policy checks are performant

