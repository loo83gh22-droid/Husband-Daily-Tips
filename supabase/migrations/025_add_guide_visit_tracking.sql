-- Create table to track how-to guide visits
CREATE TABLE IF NOT EXISTS guide_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_slug TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_guide_visits_slug ON guide_visits(guide_slug);
CREATE INDEX IF NOT EXISTS idx_guide_visits_user_id ON guide_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_visits_visited_at ON guide_visits(visited_at);

-- Add comment
COMMENT ON TABLE guide_visits IS 'Tracks visits to how-to guides for analytics and popular content display';

