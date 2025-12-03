-- Enable Row Level Security on event_completion_bonuses table
-- Event completion bonuses contain user-specific data (user_id)
-- Users should only see their own event completion bonuses

-- Enable RLS
ALTER TABLE event_completion_bonuses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- EVENT_COMPLETION_BONUSES TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own event completion bonuses
CREATE POLICY "Users can read own event completion bonuses" ON event_completion_bonuses
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own event completion bonuses
-- Note: Typically inserted by the system when an event is completed, but policy allows user inserts
CREATE POLICY "Users can insert own event completion bonuses" ON event_completion_bonuses
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own event completion bonuses
CREATE POLICY "Users can update own event completion bonuses" ON event_completion_bonuses
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own event completion bonuses
CREATE POLICY "Users can delete own event completion bonuses" ON event_completion_bonuses
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The index on user_id already exists (created in migration 045)
-- This ensures RLS policy checks are performant

