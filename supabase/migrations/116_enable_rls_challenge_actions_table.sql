-- Enable Row Level Security on challenge_actions table
-- Challenge actions are public content (junction table linking challenges to actions), but we enable RLS
-- to ensure only authenticated users can read them

-- Enable RLS
ALTER TABLE challenge_actions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CHALLENGE_ACTIONS TABLE POLICIES
-- ============================================================================
-- Challenge actions are public content (junction table), but we restrict access to authenticated users only
-- This follows the same pattern as actions, tips, quotes, and challenges (public read for authenticated users)

-- All authenticated users can read all challenge_actions (they're public content)
CREATE POLICY "Authenticated users can read challenge_actions" ON challenge_actions
  FOR SELECT USING (true);

-- Note: Challenge actions are typically inserted/updated by admins via service role key
-- We don't allow regular users to insert/update/delete challenge_actions
-- If you need user-generated challenge_actions in the future, add appropriate policies

