-- Add 'automated_email' status to email_replies table
-- This allows filtering out DMARC reports, bounces, and other automated emails

-- First, drop the existing check constraint
ALTER TABLE email_replies DROP CONSTRAINT IF EXISTS email_replies_status_check;

-- Add the new constraint with 'automated_email' status
ALTER TABLE email_replies 
  ADD CONSTRAINT email_replies_status_check 
  CHECK (status IN ('received', 'read', 'replied', 'archived', 'unknown_user', 'automated_email'));

-- Add comment explaining the new status
COMMENT ON COLUMN email_replies.status IS 'Status: received, read, replied, archived, unknown_user, or automated_email (for DMARC reports, bounces, etc.)';

