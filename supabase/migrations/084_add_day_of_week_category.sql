-- Add day_of_week_category column to actions table
-- This categorizes actions as either:
-- 'weekly_routine': Simple actions that can be done at home any day (e.g., "Tell her something you appreciate")
-- 'planning_required': Actions that need planning/going out (e.g., "Go camping", "Plan a date night")
ALTER TABLE actions ADD COLUMN IF NOT EXISTS day_of_week_category TEXT CHECK (day_of_week_category IN ('weekly_routine', 'planning_required'));

-- Add comment explaining the field
COMMENT ON COLUMN actions.day_of_week_category IS 'Categorizes actions by feasibility: weekly_routine (can do at home any day) vs planning_required (needs planning/going out, better for weekends)';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_actions_day_of_week_category ON actions(day_of_week_category);

