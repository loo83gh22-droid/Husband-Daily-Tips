-- Update Health Algorithm
-- Implements new health scoring system based on action points, daily/weekly caps, decay, and repetition penalties

-- Step 1: Add health_point_value column to actions table
-- Each action can be worth 1, 2, or 3 points
ALTER TABLE actions ADD COLUMN IF NOT EXISTS health_point_value INTEGER DEFAULT 2 CHECK (health_point_value IN (1, 2, 3));

-- Set default point values based on action importance/display_order
-- Lower display_order = more important = higher points
-- We'll set these as defaults, but they can be adjusted per action
UPDATE actions 
SET health_point_value = CASE
  WHEN display_order <= 2 THEN 3  -- Most important actions (communication, intimacy)
  WHEN display_order <= 5 THEN 2  -- Moderate importance
  ELSE 1                           -- Other actions
END
WHERE health_point_value IS NULL OR health_point_value = 2;

-- Step 2: Update daily_health_points table to track points correctly
-- Add columns for tracking daily and weekly caps
ALTER TABLE daily_health_points 
ADD COLUMN IF NOT EXISTS action_points INTEGER DEFAULT 0,  -- Points from actions (max 3/day)
ADD COLUMN IF NOT EXISTS event_bonus INTEGER DEFAULT 0,     -- Points from 7-day event completion (+3)
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;   -- Total points for the day (action_points + event_bonus)

-- Update existing records
UPDATE daily_health_points 
SET action_points = points_earned,
    total_points = points_earned
WHERE action_points = 0 AND total_points = 0;

-- Step 3: Create table to track action completion history for repetition penalty
CREATE TABLE IF NOT EXISTS action_completion_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_earned INTEGER NOT NULL,  -- Points actually earned (after penalty)
  base_points INTEGER NOT NULL,    -- Base points before penalty (1, 2, or 3)
  penalty_applied INTEGER DEFAULT 0, -- How many points were deducted due to repetition
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_action_completion_history_user_action ON action_completion_history(user_id, action_id);
CREATE INDEX IF NOT EXISTS idx_action_completion_history_completed_at ON action_completion_history(completed_at);
CREATE INDEX IF NOT EXISTS idx_action_completion_history_user_date ON action_completion_history(user_id, completed_at);

-- Step 4: Create table to track weekly health points (for 15 point weekly cap)
CREATE TABLE IF NOT EXISTS weekly_health_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,  -- Monday of the week (YYYY-MM-DD)
  points_earned INTEGER DEFAULT 0,  -- Total points earned this week (capped at 15)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_health_points_user_week ON weekly_health_points(user_id, week_start);

-- Step 5: Create table to track missed days for decay calculation
CREATE TABLE IF NOT EXISTS health_decay_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  missed_date DATE NOT NULL,  -- Date that was missed (no action completed)
  decay_applied INTEGER DEFAULT 2,  -- Decay points applied (-2 per missed day)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, missed_date)
);

CREATE INDEX IF NOT EXISTS idx_health_decay_log_user_date ON health_decay_log(user_id, missed_date);

-- Step 6: Create table to track 7-day event completions (for +3 bonus)
CREATE TABLE IF NOT EXISTS event_completion_bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,  -- Date the 7-day event was completed
  bonus_points INTEGER DEFAULT 3,  -- Always +3 for event completion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_event_completion_bonuses_user_date ON event_completion_bonuses(user_id, completed_date);

-- Step 7: Update trigger for weekly_health_points
DROP TRIGGER IF EXISTS update_weekly_health_points_updated_at ON weekly_health_points;
CREATE TRIGGER update_weekly_health_points_updated_at BEFORE UPDATE ON weekly_health_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Add comment documenting the new health system
COMMENT ON TABLE actions IS 'Actions have health_point_value (1, 2, or 3). Health score is calculated from daily actions with daily (3) and weekly (15) caps, decay (-2 per missed day), and repetition penalties. Badges do NOT affect health.';
COMMENT ON TABLE action_completion_history IS 'Tracks action completion history for repetition penalty calculation. If same action completed within 30 days, points decrease by 1 each time.';
COMMENT ON TABLE daily_health_points IS 'Tracks daily health points earned. Max 3 points per day from actions, plus event bonuses.';
COMMENT ON TABLE weekly_health_points IS 'Tracks weekly health points. Max 15 points per rolling 7-day window.';
COMMENT ON TABLE health_decay_log IS 'Tracks missed days for decay calculation. -2 points per missed day.';
COMMENT ON TABLE event_completion_bonuses IS 'Tracks 7-day event completion bonuses. +3 points per completed event.';

