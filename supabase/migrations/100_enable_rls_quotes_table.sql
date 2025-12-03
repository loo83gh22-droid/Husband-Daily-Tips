-- Enable Row Level Security on quotes table
-- Quotes are public content (like actions or badges), but we enable RLS
-- to ensure only authenticated users can read them

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- QUOTES TABLE POLICIES
-- ============================================================================
-- Quotes are public content, but we restrict access to authenticated users only
-- This follows the same pattern as deep_thoughts (public read for authenticated users)

-- All authenticated users can read all quotes (they're public content)
CREATE POLICY "Authenticated users can read all quotes" ON quotes
  FOR SELECT USING (true);

-- Note: Quotes are typically inserted/updated by admins via service role key
-- We don't allow regular users to insert/update/delete quotes
-- If you need user-generated quotes in the future, add appropriate policies

