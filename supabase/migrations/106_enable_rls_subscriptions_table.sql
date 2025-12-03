-- Enable Row Level Security on subscriptions table
-- Subscriptions contain user-specific data (user_id)
-- Users should only see their own subscription records

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert their own subscriptions
-- Note: Typically inserted by the system (Stripe webhook), but policy allows user inserts
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update their own subscriptions
-- Note: Typically updated by the system (Stripe webhook), but policy allows user updates
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can delete their own subscriptions
-- Note: Typically handled by Stripe webhooks, but policy allows user deletes
CREATE POLICY "Users can delete own subscriptions" ON subscriptions
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: The index on user_id already exists (created in migration 037)
-- This ensures RLS policy checks are performant

