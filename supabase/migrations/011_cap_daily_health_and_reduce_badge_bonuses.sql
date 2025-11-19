-- Cap daily health accrual at 6 points and reduce badge bonuses to 0 (reference only)

-- Update all badge health bonuses to 0 (badges are reference only, not health boosters)
UPDATE badges SET health_bonus = 0 WHERE health_bonus > 0;

-- Add a table to track daily health points earned (for capping at 6 per day)
-- Note: This table tracks that we've awarded the daily 6 points, but the actual
-- health calculation uses totalDailyActionCompletions count from user_daily_actions
CREATE TABLE IF NOT EXISTS daily_health_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  points_earned INTEGER DEFAULT 0, -- Points earned from completing daily action this day (max 6)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_health_points_user_id ON daily_health_points(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_health_points_date ON daily_health_points(date);
CREATE INDEX IF NOT EXISTS idx_daily_health_points_user_date ON daily_health_points(user_id, date);

-- Update trigger for updated_at
CREATE TRIGGER update_daily_health_points_updated_at BEFORE UPDATE ON daily_health_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

