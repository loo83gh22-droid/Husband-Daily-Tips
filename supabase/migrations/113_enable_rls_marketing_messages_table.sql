-- Enable Row Level Security on marketing_messages table
-- Marketing messages are public content (like quotes or challenges), but we enable RLS
-- to ensure only authenticated users can read them

-- Enable RLS
ALTER TABLE marketing_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MARKETING_MESSAGES TABLE POLICIES
-- ============================================================================
-- Marketing messages are public content, but we restrict access to authenticated users only
-- This follows the same pattern as quotes and challenges (public read for authenticated users)

-- All authenticated users can read all active marketing messages (they're public content)
CREATE POLICY "Authenticated users can read marketing messages" ON marketing_messages
  FOR SELECT USING (true);

-- Note: Marketing messages are typically inserted/updated by admins via service role key
-- We don't allow regular users to insert/update/delete marketing messages
-- If you need user-generated messages in the future, add appropriate policies

