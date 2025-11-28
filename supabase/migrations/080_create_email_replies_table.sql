-- Create email_replies table to store user email replies
-- This allows you to track and respond to user replies to daily action emails

CREATE TABLE IF NOT EXISTS email_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'read', 'replied', 'archived', 'unknown_user')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_email_replies_user_id ON email_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_from_email ON email_replies(from_email);
CREATE INDEX IF NOT EXISTS idx_email_replies_status ON email_replies(status);
CREATE INDEX IF NOT EXISTS idx_email_replies_received_at ON email_replies(received_at DESC);

-- Enable RLS
ALTER TABLE email_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own replies
CREATE POLICY "Users can view own email replies"
  ON email_replies
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users 
      WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Policy: Service role can do everything (for webhook)
-- Note: Webhook uses service role, so it can insert
-- No explicit policy needed for service role (bypasses RLS)

-- Add comment
COMMENT ON TABLE email_replies IS 'Stores email replies from users to daily action emails, processed via Resend Inbound webhook';

