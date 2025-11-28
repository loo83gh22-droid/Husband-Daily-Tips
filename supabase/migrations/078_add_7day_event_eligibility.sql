-- Add field to mark actions as eligible for 7-day events
-- 7-day events should only include actions that can be easily completed in a single day

ALTER TABLE actions ADD COLUMN IF NOT EXISTS eligible_for_7day_events BOOLEAN DEFAULT TRUE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_actions_eligible_for_7day_events ON actions(eligible_for_7day_events) WHERE eligible_for_7day_events = TRUE;

-- Mark actions that are NOT suitable for 7-day events (require planning, multiple days, or are too complex)
-- These actions will still be available for regular daily actions, just not in 7-day events

UPDATE actions 
SET eligible_for_7day_events = FALSE
WHERE 
  -- Multi-day activities that require planning
  name ILIKE '%camping trip%' OR
  name ILIKE '%vacation%' OR
  name ILIKE '%weekend getaway%' OR
  name ILIKE '%trip%' AND (name ILIKE '%plan%' OR name ILIKE '%organize%') OR
  
  -- Activities that require significant planning or preparation
  name ILIKE '%plan a special%thanksgiving%' OR
  name ILIKE '%plan a special%christmas%' OR
  name ILIKE '%plan a special%holiday%' OR
  name ILIKE '%organize%party%' OR
  name ILIKE '%plan%party%' OR
  name ILIKE '%surprise vacation%' OR
  name ILIKE '%plan%surprise%' AND (name ILIKE '%trip%' OR name ILIKE '%getaway%') OR
  
  -- Building/construction activities that take multiple days
  name ILIKE '%build%fire pit%' OR
  name ILIKE '%build%outdoor seating%' OR
  name ILIKE '%build%garden bed%' OR
  name ILIKE '%build%deck%' OR
  name ILIKE '%build%shed%' OR
  name ILIKE '%renovate%' OR
  name ILIKE '%remodel%' OR
  
  -- Activities that require booking/reservations far in advance
  name ILIKE '%book%spa%' OR
  name ILIKE '%reserve%restaurant%' AND name ILIKE '%fancy%' OR
  name ILIKE '%plan%surprise%' AND name ILIKE '%dinner%' AND name ILIKE '%reservation%' OR
  
  -- Activities that are explicitly multi-day
  description ILIKE '%multiple days%' OR
  description ILIKE '%over several days%' OR
  description ILIKE '%plan and execute%' AND description ILIKE '%trip%' OR
  description ILIKE '%weekend%' AND (description ILIKE '%plan%' OR description ILIKE '%organize%');

-- Explicitly mark specific problematic actions (case-insensitive matching)
UPDATE actions 
SET eligible_for_7day_events = FALSE
WHERE LOWER(name) IN (
  'camping trip',
  'plan a surprise vacation',
  'plan a weekend getaway',
  'organize a surprise party',
  'plan a special us thanksgiving together',
  'plan a special canadian thanksgiving together',
  'build a fire pit or outdoor seating area together',
  'build a raised garden bed together'
);

-- Mark actions that ARE suitable (simple, can be done in a day)
-- Reset to TRUE first, then we'll mark FALSE for complex ones above
-- Most actions are eligible by default unless they match the exclusion patterns

-- Set default to TRUE for any actions that weren't explicitly set
-- This ensures new actions are eligible by default unless marked otherwise
UPDATE actions 
SET eligible_for_7day_events = TRUE
WHERE eligible_for_7day_events IS NULL;

-- Add comment to explain the field
COMMENT ON COLUMN actions.eligible_for_7day_events IS 'Whether this action can be easily completed in a single day and is suitable for 7-day events. Actions requiring planning, multiple days, or significant preparation should be FALSE.';

