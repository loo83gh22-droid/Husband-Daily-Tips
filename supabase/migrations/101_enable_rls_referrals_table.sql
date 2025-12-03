-- Enable Row Level Security on referrals table
-- Referrals contain user-specific data (referrer_id and referee_id)
-- Users should only see referrals where they are the referrer or referee

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REFERRALS TABLE POLICIES
-- ============================================================================
-- Following the same pattern as other user-data tables (migration 028)
-- Uses Auth0 context (current_setting('app.auth0_id')) to identify the user

-- Users can read referrals where they are the referrer OR referee
-- (they referred someone OR they were referred by someone)
CREATE POLICY "Users can read own referrals" ON referrals
  FOR SELECT USING (
    referrer_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
    OR
    referee_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can insert referrals where they are the referrer
-- (when someone uses their referral code)
CREATE POLICY "Users can insert referrals where they are referrer" ON referrals
  FOR INSERT WITH CHECK (
    referrer_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can update referrals where they are the referrer
-- (e.g., to update status when referee converts)
CREATE POLICY "Users can update referrals where they are referrer" ON referrals
  FOR UPDATE USING (
    referrer_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  ) WITH CHECK (
    referrer_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Note: Typically, referrals are inserted/updated by the system (via service role key)
-- when a new user signs up with a referral code or when a referral converts.
-- These policies allow users to see their own referral data.

-- Note: The indexes on referrer_id and referee_id already exist (created in migration 052)
-- This ensures RLS policy checks are performant

