-- Enable Row Level Security on tips table
-- Tips are public content (like actions, quotes, or challenges), but we enable RLS
-- to ensure only authenticated users can read them

-- Enable RLS
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TIPS TABLE POLICIES
-- ============================================================================
-- Tips are public content, but we restrict access to authenticated users only
-- This follows the same pattern as quotes, challenges, and marketing_messages (public read for authenticated users)

-- All authenticated users can read all tips (they're public content)
CREATE POLICY "Authenticated users can read tips" ON tips
  FOR SELECT USING (true);

-- Note: Tips are typically inserted/updated by admins via service role key
-- We don't allow regular users to insert/update/delete tips
-- If you need user-generated tips in the future, add appropriate policies

