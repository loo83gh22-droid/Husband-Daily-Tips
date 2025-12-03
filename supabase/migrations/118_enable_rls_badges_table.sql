-- Enable Row Level Security on badges table
-- Badges are public content (like actions, tips, or challenges), but we enable RLS
-- to ensure only authenticated users can read them

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BADGES TABLE POLICIES
-- ============================================================================
-- Badges are public content, but we restrict access to authenticated users only
-- This follows the same pattern as actions, tips, quotes, and challenges (public read for authenticated users)

-- All authenticated users can read all badges (they're public content)
CREATE POLICY "Authenticated users can read badges" ON badges
  FOR SELECT USING (true);

-- Note: Badges are typically inserted/updated by admins via service role key
-- We don't allow regular users to insert/update/delete badges
-- If you need user-generated badges in the future, add appropriate policies

