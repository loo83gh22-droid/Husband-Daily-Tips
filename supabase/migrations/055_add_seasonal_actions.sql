-- Add seasonal/holiday date range support to actions table
-- Seasonal actions can only be served during specific date ranges

-- Add columns for seasonal date ranges
ALTER TABLE actions ADD COLUMN IF NOT EXISTS seasonal_start_date DATE;
ALTER TABLE actions ADD COLUMN IF NOT EXISTS seasonal_end_date DATE;

-- Add comment explaining seasonal actions
COMMENT ON COLUMN actions.seasonal_start_date IS 'Start date for seasonal/holiday actions. Action can only be served on or after this date. NULL means action is available year-round.';
COMMENT ON COLUMN actions.seasonal_end_date IS 'End date for seasonal/holiday actions. Action can only be served on or before this date. NULL means action is available year-round.';

-- Create index for efficient seasonal action queries
CREATE INDEX IF NOT EXISTS idx_actions_seasonal_dates ON actions(seasonal_start_date, seasonal_end_date) WHERE seasonal_start_date IS NOT NULL OR seasonal_end_date IS NOT NULL;

-- Add seasonal/holiday actions
-- Christmas Tree Action (Nov 25 - Dec 14)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, seasonal_start_date, seasonal_end_date)
SELECT 
  'Go Get a Real Christmas Tree Together',
  'Make a date out of picking out your Christmas tree. Go to a tree farm or lot together, take your time choosing the perfect one, and enjoy the experience as a couple.',
  'Partnership',
  'partnership',
  'action_completed',
  '🎄',
  'Creates a shared memory and builds teamwork around a holiday tradition.',
  2,
  -- Use current year for Nov 25, but allow it to work for any year
  -- We'll use a function to calculate the date dynamically
  NULL, -- Will be set via UPDATE below
  NULL  -- Will be set via UPDATE below
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Go Get a Real Christmas Tree Together');

-- Note: Seasonal dates will be set via the cron job /api/cron/update-seasonal-dates
-- This runs annually to update dates for the current year (e.g., Easter varies by year)
-- For now, set initial dates for the current year (2025)
DO $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  easter_date DATE;
  one_week_before_easter DATE;
BEGIN
  -- Calculate Easter for current year (simplified - actual calculation is in application code)
  -- For 2025: Easter is April 20
  -- We'll use a simple approximation here, but the app will calculate it properly
  easter_date := TO_DATE(current_year || '-04-20', 'YYYY-MM-DD');
  one_week_before_easter := easter_date - INTERVAL '7 days';
  
  -- Update Christmas Tree (Nov 25 - Dec 14)
  UPDATE actions 
  SET seasonal_start_date = TO_DATE(current_year || '-11-25', 'YYYY-MM-DD'),
      seasonal_end_date = TO_DATE(current_year || '-12-14', 'YYYY-MM-DD')
  WHERE name = 'Go Get a Real Christmas Tree Together';
  
  -- Update Easter Egg Hunt (1 week before Easter - Easter Sunday)
  UPDATE actions 
  SET seasonal_start_date = one_week_before_easter,
      seasonal_end_date = easter_date
  WHERE name = 'Put Together an Easter Egg Hunt for Your Wife/Partner';
  
  -- Update Valentine's Day (Feb 1 - Feb 14)
  UPDATE actions 
  SET seasonal_start_date = TO_DATE(current_year || '-02-01', 'YYYY-MM-DD'),
      seasonal_end_date = TO_DATE(current_year || '-02-14', 'YYYY-MM-DD')
  WHERE name = 'Plan a Surprise Valentine''s Day Date';
  
  -- Update Thanksgiving (Nov 1 - Nov 25)
  UPDATE actions 
  SET seasonal_start_date = TO_DATE(current_year || '-11-01', 'YYYY-MM-DD'),
      seasonal_end_date = TO_DATE(current_year || '-11-25', 'YYYY-MM-DD')
  WHERE name = 'Write a Gratitude List for Your Partner';
  
  -- Update New Year's (Dec 26 - Jan 5 of next year)
  UPDATE actions 
  SET seasonal_start_date = TO_DATE(current_year || '-12-26', 'YYYY-MM-DD'),
      seasonal_end_date = TO_DATE((current_year + 1) || '-01-05', 'YYYY-MM-DD')
  WHERE name = 'Set Relationship Goals for the New Year Together';
END $$;

-- Easter Egg Hunt Action (1 week before Easter)
-- Easter date varies, so we'll calculate it dynamically in application code
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, seasonal_start_date, seasonal_end_date)
SELECT 
  'Put Together an Easter Egg Hunt for Your Wife/Partner',
  'Plan and set up a fun Easter egg hunt for your partner. Hide eggs with small treats or notes, create clues, and make it a special surprise.',
  'Romance',
  'romance',
  'action_completed',
  '🥚',
  'Shows thoughtfulness and creates a playful, romantic moment.',
  2,
  NULL, -- Will be calculated as 1 week before Easter (varies by year)
  NULL  -- Will be calculated as Easter Sunday
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Put Together an Easter Egg Hunt for Your Wife/Partner');

-- Add more seasonal actions examples:
-- Valentine's Day (Feb 1 - Feb 14)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Surprise Valentine''s Day Date',
  'Plan a special Valentine''s Day surprise for your partner. It doesn''t have to be expensive—thoughtful gestures matter most.',
  'Romance',
  'romance',
  'action_completed',
  '💝',
  'Shows you care about making special occasions meaningful.',
  2,
  NULL, -- Feb 1 of current year
  NULL  -- Feb 14 of current year
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Surprise Valentine''s Day Date');

-- Thanksgiving (Nov 1 - Nov 25)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, seasonal_start_date, seasonal_end_date)
SELECT 
  'Write a Gratitude List for Your Partner',
  'Take time before Thanksgiving to write down specific things you''re grateful for about your partner. Share it with them.',
  'Gratitude',
  'gratitude',
  'action_completed',
  '🦃',
  'Deepens appreciation and connection during the season of gratitude.',
  2,
  NULL, -- Nov 1 of current year
  NULL  -- Nov 25 of current year
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Write a Gratitude List for Your Partner');

-- New Year's (Dec 26 - Jan 5)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, seasonal_start_date, seasonal_end_date)
SELECT 
  'Set Relationship Goals for the New Year Together',
  'Sit down with your partner and discuss relationship goals for the upcoming year. What do you want to improve? What adventures do you want to have?',
  'Partnership',
  'partnership',
  'action_completed',
  '🎊',
  'Creates shared vision and commitment for the year ahead.',
  3,
  NULL, -- Dec 26 of current year
  NULL  -- Jan 5 of next year
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Set Relationship Goals for the New Year Together');

-- Add comment about seasonal date calculation
COMMENT ON TABLE actions IS 'Actions can have seasonal_start_date and seasonal_end_date. For actions with these dates, the application should calculate the current year''s dates dynamically (e.g., Nov 25 of current year for Christmas actions, or calculate Easter date for Easter actions).';

