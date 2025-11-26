-- Add reporting and removal functionality for Team Wins posts

-- Add removed flag to deep_thoughts table
ALTER TABLE deep_thoughts 
ADD COLUMN IF NOT EXISTS is_removed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS removed_by UUID REFERENCES users(id);

-- Create reports table for tracking post reports
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES deep_thoughts(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  additional_details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, reported_by) -- Prevent duplicate reports from same user
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reported_by ON post_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);
CREATE INDEX IF NOT EXISTS idx_deep_thoughts_is_removed ON deep_thoughts(is_removed);

-- Enable RLS on post_reports
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_reports
-- Users can report posts (insert)
CREATE POLICY "Users can report posts" ON post_reports
  FOR INSERT
  WITH CHECK (
    reported_by IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Users can read their own reports
CREATE POLICY "Users can read own reports" ON post_reports
  FOR SELECT
  USING (
    reported_by IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Admin can read all reports (using service role key bypasses RLS)
-- Users can update their own reports (to add details)
CREATE POLICY "Users can update own reports" ON post_reports
  FOR UPDATE
  USING (
    reported_by IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Add comment for documentation
COMMENT ON TABLE post_reports IS 'Tracks reports of inappropriate content in Team Wins posts';
COMMENT ON COLUMN deep_thoughts.is_removed IS 'Flag indicating if post has been removed by admin or author';
COMMENT ON COLUMN deep_thoughts.removed_at IS 'Timestamp when post was removed';
COMMENT ON COLUMN deep_thoughts.removed_by IS 'User who removed the post (admin or author)';

