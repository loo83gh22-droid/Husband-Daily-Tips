-- Enable Row Level Security on actions table
-- Actions are public content (like tips, quotes, or challenges), but we enable RLS
-- to ensure only authenticated users can read them

-- Enable RLS
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ACTIONS TABLE POLICIES
-- ============================================================================
-- Actions are public content, but we restrict access to authenticated users only
-- This follows the same pattern as tips, quotes, challenges, and marketing_messages (public read for authenticated users)

-- All authenticated users can read all actions (they're public content)
CREATE POLICY "Authenticated users can read actions" ON actions
  FOR SELECT USING (true);

-- Note: Actions are typically inserted/updated by admins via service role key
-- We don't allow regular users to insert/update/delete actions
-- If you need user-generated actions in the future, add appropriate policies

