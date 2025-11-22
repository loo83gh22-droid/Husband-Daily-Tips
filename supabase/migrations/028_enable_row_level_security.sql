-- Enable Row Level Security (RLS) on all user-data tables
-- This ensures users can only access their own data at the database level
-- Even if API authorization is bypassed, RLS will protect user data
--
-- IMPORTANT NOTES:
-- 1. We use Auth0 (not Supabase Auth), so we can't use auth.uid() in policies
-- 2. RLS policies use current_setting('app.auth0_id') to get the current user's Auth0 ID
-- 3. The auth0_id must be set in the session context before queries (see migration 029)
-- 4. Application-level authorization is still the primary security mechanism
-- 5. Service role key bypasses RLS - only use for admin operations with explicit checks
--
-- For queries using the anon key, RLS will be enforced.
-- For queries using service role key, application must filter by user_id explicitly.
--
-- See RLS_IMPLEMENTATION_NOTES.md for more details.

-- ============================================================================
-- HELPER FUNCTION: Get current user's internal ID from auth0_id
-- ============================================================================
-- This function gets the user's internal UUID from their Auth0 ID
-- It's used by RLS policies to identify which user is making the request
-- Note: This requires the auth0_id to be set in the request context (see migration 029)

CREATE OR REPLACE FUNCTION get_user_id_from_auth0(auth0_id_param TEXT)
RETURNS UUID AS $$
  SELECT id FROM users WHERE users.auth0_id = auth0_id_param LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- ENABLE RLS ON ALL USER-DATA TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_thoughts_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_health_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_visits ENABLE ROW LEVEL SECURITY;

-- Also enable RLS on recurring_tip_completions if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recurring_tip_completions') THEN
    ALTER TABLE recurring_tip_completions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (
    auth0_id = current_setting('app.auth0_id', true)
  );

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (
    auth0_id = current_setting('app.auth0_id', true)
  );

-- Service role can insert (for user creation via API)
-- Note: In production, user creation happens via API with service role key
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- USER_TIPS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read own tips" ON user_tips
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own tips" ON user_tips
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can update own tips" ON user_tips
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can delete own tips" ON user_tips
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- USER_DAILY_ACTIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read own daily actions" ON user_daily_actions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own daily actions" ON user_daily_actions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can update own daily actions" ON user_daily_actions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can delete own daily actions" ON user_daily_actions
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- USER_BADGES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read own badges" ON user_badges
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: Badges are typically inserted by the system, not users directly

-- ============================================================================
-- USER_CHALLENGES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read own challenges" ON user_challenges
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own challenges" ON user_challenges
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can update own challenges" ON user_challenges
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- REFLECTIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read own reflections" ON reflections
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own reflections" ON reflections
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can update own reflections" ON reflections
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can delete own reflections" ON reflections
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- DEEP_THOUGHTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can read all deep thoughts (they're shared/public)
CREATE POLICY "Authenticated users can read all deep thoughts" ON deep_thoughts
  FOR SELECT USING (true);

-- Users can only insert their own deep thoughts
CREATE POLICY "Users can insert own deep thoughts" ON deep_thoughts
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can only update their own deep thoughts
CREATE POLICY "Users can update own deep thoughts" ON deep_thoughts
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can only delete their own deep thoughts
CREATE POLICY "Users can delete own deep thoughts" ON deep_thoughts
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- DEEP_THOUGHTS_COMMENTS TABLE POLICIES
-- ============================================================================

-- All authenticated users can read all comments
CREATE POLICY "Authenticated users can read all comments" ON deep_thoughts_comments
  FOR SELECT USING (true);

-- Users can only insert their own comments
CREATE POLICY "Users can insert own comments" ON deep_thoughts_comments
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can only update their own comments
CREATE POLICY "Users can update own comments" ON deep_thoughts_comments
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can only delete their own comments
CREATE POLICY "Users can delete own comments" ON deep_thoughts_comments
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- SURVEY_RESPONSES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read own survey responses" ON survey_responses
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own survey responses" ON survey_responses
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can update own survey responses" ON survey_responses
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- SURVEY_SUMMARY TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read own survey summary" ON survey_summary
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own survey summary" ON survey_summary
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can update own survey summary" ON survey_summary
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- DAILY_HEALTH_POINTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read own health points" ON daily_health_points
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own health points" ON daily_health_points
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can update own health points" ON daily_health_points
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- GUIDE_VISITS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can read own guide visits" ON guide_visits
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own guide visits" ON guide_visits
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- ============================================================================
-- RECURRING_TIP_COMPLETIONS TABLE POLICIES (if exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'recurring_tip_completions') THEN
    EXECUTE '
      CREATE POLICY "Users can read own recurring tip completions" ON recurring_tip_completions
        FOR SELECT USING (
          user_id IN (
            SELECT id FROM users WHERE auth0_id = current_setting(''app.auth0_id'', true)
          )
        );

      CREATE POLICY "Users can insert own recurring tip completions" ON recurring_tip_completions
        FOR INSERT WITH CHECK (
          user_id IN (
            SELECT id FROM users WHERE auth0_id = current_setting(''app.auth0_id'', true)
          )
        );

      CREATE POLICY "Users can update own recurring tip completions" ON recurring_tip_completions
        FOR UPDATE USING (
          user_id IN (
            SELECT id FROM users WHERE auth0_id = current_setting(''app.auth0_id'', true)
          )
        );
    ';
  END IF;
END $$;

-- ============================================================================
-- PUBLIC TABLES (No RLS or read-only for all)
-- ============================================================================
-- These tables don't contain user-specific data, so RLS is not needed:
-- - actions (public actions)
-- - tips (public tips)
-- - badges (public badge definitions)
-- - challenges (public challenge definitions)
-- - challenge_actions (public challenge-to-action mappings)
-- - survey_questions (public survey questions)

-- Optional: Enable read-only RLS on public tables if you want to ensure
-- only authenticated users can read them (currently not needed)

-- ============================================================================
-- VERIFY RLS IS ENABLED
-- ============================================================================

-- Query to verify RLS is enabled (uncomment to run manually):
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' 
--   AND tablename IN ('users', 'user_tips', 'user_daily_actions', 'user_badges', 'user_challenges', 'reflections', 'survey_responses');

