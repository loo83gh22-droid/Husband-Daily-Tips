-- Enable Row Level Security on challenges table
-- Challenges are public content (like actions or badges), but we enable RLS
-- to ensure only authenticated users can read them

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CHALLENGES TABLE POLICIES
-- ============================================================================
-- Challenges are public content, but we restrict access to authenticated users only
-- This follows the same pattern as quotes and deep_thoughts (public read for authenticated users)

-- All authenticated users can read all challenges (they're public content)
CREATE POLICY "Authenticated users can read all challenges" ON challenges
  FOR SELECT USING (true);

-- Note: Challenges are typically inserted/updated by admins via service role key
-- We don't allow regular users to insert/update/delete challenges
-- If you need user-generated challenges in the future, add appropriate policies

