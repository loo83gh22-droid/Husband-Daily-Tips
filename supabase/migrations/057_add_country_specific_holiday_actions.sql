-- Add country-specific holiday actions for US and Canada
-- These actions will only be served to users in the specified country

-- US-Specific Holiday Actions

-- US Thanksgiving (1 week before - Thanksgiving Day, 4th Thursday in November)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Special US Thanksgiving Together',
  'Work together to plan your Thanksgiving celebration. Whether you''re hosting or attending, coordinate the menu, traditions, and make it a team effort.',
  'Partnership',
  'partnership',
  'action_completed',
  '🦃',
  'Builds teamwork and creates shared memories around a major holiday.',
  2,
  'US',
  NULL, -- Will be calculated dynamically (1 week before 4th Thursday in Nov)
  NULL  -- Will be calculated dynamically (4th Thursday in Nov)
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Special US Thanksgiving Together' AND country = 'US');

-- US Independence Day (July 1 - July 4)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, seasonal_start_date, seasonal_end_date)
SELECT 
  'Celebrate Independence Day Together',
  'Plan a special 4th of July celebration together. Whether it''s a BBQ, fireworks viewing, or a day trip, make it a memorable experience as a couple.',
  'Quality Time',
  'quality_time',
  'action_completed',
  '🇺🇸',
  'Creates shared memories and celebrates together.',
  2,
  'US',
  NULL, -- Will be set to July 1
  NULL  -- Will be set to July 4
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Celebrate Independence Day Together' AND country = 'US');

-- US Memorial Day (1 week before - Memorial Day, last Monday in May)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, seasonal_start_date, seasonal_end_date)
SELECT 
  'Honor Memorial Day Together',
  'Take time together to honor those who served. Visit a memorial, attend a ceremony, or simply reflect together on the meaning of the day.',
  'Gratitude',
  'gratitude',
  'action_completed',
  '🇺🇸',
  'Builds shared values and appreciation for service.',
  2,
  'US',
  NULL, -- Will be calculated dynamically (1 week before last Monday in May)
  NULL  -- Will be calculated dynamically (last Monday in May)
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Honor Memorial Day Together' AND country = 'US');

-- US Labor Day (1 week before - Labor Day, 1st Monday in September)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, seasonal_start_date, seasonal_end_date)
SELECT 
  'Enjoy a Labor Day Weekend Together',
  'Make the most of the long weekend. Plan a getaway, host a gathering, or simply enjoy quality time together without the usual weekday rush.',
  'Quality Time',
  'quality_time',
  'action_completed',
  '🏖️',
  'Creates space for connection and relaxation.',
  2,
  'US',
  NULL, -- Will be calculated dynamically (1 week before 1st Monday in Sept)
  NULL  -- Will be calculated dynamically (1st Monday in Sept)
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Enjoy a Labor Day Weekend Together' AND country = 'US');

-- Canada-Specific Holiday Actions

-- Canadian Thanksgiving (1 week before - Thanksgiving Day, 2nd Monday in October)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, seasonal_start_date, seasonal_end_date)
SELECT 
  'Plan a Special Canadian Thanksgiving Together',
  'Work together to plan your Canadian Thanksgiving celebration. Coordinate the menu, traditions, and make it a team effort.',
  'Partnership',
  'partnership',
  'action_completed',
  '🍁',
  'Builds teamwork and creates shared memories around a major holiday.',
  2,
  'CA',
  NULL, -- Will be calculated dynamically (1 week before 2nd Monday in Oct)
  NULL  -- Will be calculated dynamically (2nd Monday in Oct)
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Plan a Special Canadian Thanksgiving Together' AND country = 'CA');

-- Canada Day (June 25 - July 1)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, seasonal_start_date, seasonal_end_date)
SELECT 
  'Celebrate Canada Day Together',
  'Plan a special Canada Day celebration together. Whether it''s attending festivities, a BBQ, or a day trip, make it a memorable experience as a couple.',
  'Quality Time',
  'quality_time',
  'action_completed',
  '🇨🇦',
  'Creates shared memories and celebrates together.',
  2,
  'CA',
  NULL, -- Will be set to June 25
  NULL  -- Will be set to July 1
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Celebrate Canada Day Together' AND country = 'CA');

-- Victoria Day (1 week before - Victoria Day, Monday before May 25)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, seasonal_start_date, seasonal_end_date)
SELECT 
  'Enjoy Victoria Day Weekend Together',
  'Make the most of the long weekend. Plan a getaway, host a gathering, or simply enjoy quality time together to kick off the summer season.',
  'Quality Time',
  'quality_time',
  'action_completed',
  '👑',
  'Creates space for connection and marks the start of summer.',
  2,
  'CA',
  NULL, -- Will be calculated dynamically (1 week before Monday before May 25)
  NULL  -- Will be calculated dynamically (Monday before May 25)
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Enjoy Victoria Day Weekend Together' AND country = 'CA');

-- Canadian Labor Day (1 week before - Labor Day, 1st Monday in September)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, health_point_value, country, seasonal_start_date, seasonal_end_date)
SELECT 
  'Enjoy a Labour Day Weekend Together',
  'Make the most of the long weekend. Plan a getaway, host a gathering, or simply enjoy quality time together without the usual weekday rush.',
  'Quality Time',
  'quality_time',
  'action_completed',
  '🏖️',
  'Creates space for connection and relaxation.',
  2,
  'CA',
  NULL, -- Will be calculated dynamically (1 week before 1st Monday in Sept)
  NULL  -- Will be calculated dynamically (1st Monday in Sept)
WHERE NOT EXISTS (SELECT 1 FROM actions WHERE name = 'Enjoy a Labour Day Weekend Together' AND country = 'CA');

-- Update existing Thanksgiving action to be US-specific
UPDATE actions 
SET country = 'US'
WHERE name = 'Write a Gratitude List for Your Partner' 
  AND country IS NULL;

-- Add comment
COMMENT ON COLUMN actions.country IS 'Country code for country-specific actions (US = United States, CA = Canada). NULL means action is available in all countries. Actions with a country code will only be served to users in that country.';

