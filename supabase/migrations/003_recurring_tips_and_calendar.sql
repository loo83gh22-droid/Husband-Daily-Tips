-- Add recurring tip fields to tips table
ALTER TABLE tips ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'monthly', 'yearly'));
ALTER TABLE tips ADD COLUMN IF NOT EXISTS recurrence_day INTEGER; -- Day of week (0=Sunday) or day of month
ALTER TABLE tips ADD COLUMN IF NOT EXISTS recurrence_time TIME; -- Optional time of day

-- Track recurring tip completions
CREATE TABLE IF NOT EXISTS recurring_tip_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tip_id, scheduled_date)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_recurring_tip_completions_user_id ON recurring_tip_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tip_completions_tip_id ON recurring_tip_completions(tip_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tip_completions_scheduled_date ON recurring_tip_completions(scheduled_date);

-- Update the Weekly Relationship Check-In tip to be recurring
UPDATE tips 
SET is_recurring = TRUE, 
    recurrence_type = 'weekly', 
    recurrence_day = 0 -- Sunday (can be changed)
WHERE title = 'Weekly Relationship Check-In';

-- User calendar preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS calendar_preferences JSONB DEFAULT '{}'::jsonb;
-- Example: {"weekly_check_in_day": 0, "weekly_check_in_time": "19:00", "timezone": "America/New_York"}

