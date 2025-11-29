-- Create table to track weekly planning actions sent to users
-- These are planning_required actions sent on Monday for the week ahead
-- Users can complete them anytime during the week

CREATE TABLE IF NOT EXISTS user_weekly_planning_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Monday of the week (ISO week start)
  action_ids UUID[] NOT NULL, -- Array of action IDs sent for this week
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_weekly_planning_actions_user_id ON user_weekly_planning_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_weekly_planning_actions_week_start ON user_weekly_planning_actions(week_start_date);
CREATE INDEX IF NOT EXISTS idx_user_weekly_planning_actions_user_week ON user_weekly_planning_actions(user_id, week_start_date);

-- Add comment
COMMENT ON TABLE user_weekly_planning_actions IS 'Tracks planning_required actions sent to users each Monday for the week ahead';

