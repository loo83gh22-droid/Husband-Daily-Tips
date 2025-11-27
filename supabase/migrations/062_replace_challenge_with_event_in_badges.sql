-- Replace all user-facing references to "Challenge" with "7-Day Event" or "Event" in badges
-- This ensures consistency across the site

-- Update badge descriptions that mention "Challenge"
UPDATE badges 
SET description = REPLACE(description, 'Challenge', 'Event')
WHERE description ILIKE '%challenge%';

UPDATE badges 
SET description = REPLACE(description, 'challenge', 'event')
WHERE description ILIKE '%challenge%';

-- Update badge names that mention "Challenge" (if any)
UPDATE badges 
SET name = REPLACE(name, 'Challenge', 'Event')
WHERE name ILIKE '%challenge%';

UPDATE badges 
SET name = REPLACE(name, 'challenge', 'event')
WHERE name ILIKE '%challenge%';

-- Specifically fix the "7-Day Communication Champion" badge description
UPDATE badges 
SET description = 'Completed the 7-Day Communication Event'
WHERE name = '7-Day Communication Champion' 
AND description ILIKE '%challenge%';

-- Fix any other event completion badges
UPDATE badges 
SET description = REPLACE(description, '7-Day Communication Challenge', '7-Day Communication Event')
WHERE description ILIKE '%7-Day Communication Challenge%';

UPDATE badges 
SET description = REPLACE(description, '7-Day Intimacy Challenge', '7-Day Intimacy Event')
WHERE description ILIKE '%7-Day Intimacy Challenge%';

UPDATE badges 
SET description = REPLACE(description, '7-Day Partnership Challenge', '7-Day Partnership Event')
WHERE description ILIKE '%7-Day Partnership Challenge%';

UPDATE badges 
SET description = REPLACE(description, '7-Day Romance Challenge', '7-Day Romance Event')
WHERE description ILIKE '%7-Day Romance Challenge%';

UPDATE badges 
SET description = REPLACE(description, '7-Day Gratitude Challenge', '7-Day Gratitude Event')
WHERE description ILIKE '%7-Day Gratitude Challenge%';

UPDATE badges 
SET description = REPLACE(description, '7-Day Conflict Resolution Challenge', '7-Day Conflict Resolution Event')
WHERE description ILIKE '%7-Day Conflict Resolution Challenge%';

UPDATE badges 
SET description = REPLACE(description, '7-Day Reconnection Challenge', '7-Day Reconnection Event')
WHERE description ILIKE '%7-Day Reconnection Challenge%';

UPDATE badges 
SET description = REPLACE(description, '7-Day Quality Time Challenge', '7-Day Quality Time Event')
WHERE description ILIKE '%7-Day Quality Time Challenge%';

-- Add comment
COMMENT ON TABLE badges IS 'All badges use "Event" terminology instead of "Challenge" for consistency. Badge descriptions and names have been updated to reflect this.';

