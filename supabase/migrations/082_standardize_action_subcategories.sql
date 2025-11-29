-- Standardize action subcategories (requirement_type) to better align with badges
-- and confirm actions are mapped to the 8 core categories.

-- 1) Ensure all actions use one of the 8 canonical categories
-- (This is mostly already true; this is just a safety net for any legacy rows.)
UPDATE actions
SET category = 'Communication'
WHERE category ILIKE 'communication%';

UPDATE actions
SET category = 'Intimacy'
WHERE category ILIKE 'intimacy%';

UPDATE actions
SET category = 'Partnership'
WHERE category ILIKE 'partnership%';

UPDATE actions
SET category = 'Romance'
WHERE category ILIKE 'romance%';

UPDATE actions
SET category = 'Gratitude'
WHERE category ILIKE 'gratitude%';

UPDATE actions
SET category = 'Conflict Resolution'
WHERE category ILIKE 'conflict resolution%';

UPDATE actions
SET category = 'Reconnection'
WHERE category ILIKE 'reconnection%' OR category ILIKE 'roommate syndrome recovery%';

UPDATE actions
SET category = 'Quality Time'
WHERE category ILIKE 'quality time%';

-- 2) Gratitude actions: mark as gratitude_actions so they accrue cleanly to
-- the Gratitude progression badges (1,5,10,25,50,100).
UPDATE actions
SET requirement_type = 'gratitude_actions'
WHERE category = 'Gratitude'
  AND (requirement_type IS NULL OR requirement_type IN ('daily', 'weekly', 'action_completion'));

-- 3) Date night actions (Romance): mark as date_nights so they accrue to
-- the Date Night progression badges.
UPDATE actions
SET requirement_type = 'date_nights'
WHERE category = 'Romance'
  AND (name ILIKE '%date%' OR description ILIKE '%date night%')
  AND (requirement_type IS NULL OR requirement_type IN ('daily', 'weekly', 'action_completion'));

-- 4) Quality Time subcategories:
--    a) Default Quality Time actions -> quality_time_actions
UPDATE actions
SET requirement_type = 'quality_time_actions'
WHERE category = 'Quality Time'
  AND (requirement_type IS NULL OR requirement_type IN ('daily', 'weekly', 'action_completion'));

--    b) Outdoor / walking / hiking actions -> outdoor_activities
UPDATE actions
SET requirement_type = 'outdoor_activities'
WHERE category = 'Quality Time'
  AND (name ILIKE '%outdoor%' 
       OR name ILIKE '%walk%' 
       OR name ILIKE '%hiking%' 
       OR name ILIKE '%trail%' 
       OR name ILIKE '%camping%' 
       OR name ILIKE '%beach%' 
       OR description ILIKE '%outdoor%' 
       OR description ILIKE '%walk%' 
       OR description ILIKE '%hiking%' 
       OR description ILIKE '%trail%' 
       OR description ILIKE '%camping%' 
       OR description ILIKE '%beach%');

--    c) Adventure-style quality time -> adventure_activities
UPDATE actions
SET requirement_type = 'adventure_activities'
WHERE category = 'Quality Time'
  AND (name ILIKE '%adventure%' 
       OR name ILIKE '%explore%' 
       OR name ILIKE '%exploring%' 
       OR name ILIKE '%trip%' 
       OR name ILIKE '%getaway%' 
       OR description ILIKE '%adventure%' 
       OR description ILIKE '%explore%' 
       OR description ILIKE '%exploring%' 
       OR description ILIKE '%trip%' 
       OR description ILIKE '%getaway%');

-- 5) Communication / Conflict Resolution subcategories:
--    a) Apology-focused actions -> apology_actions
UPDATE actions
SET requirement_type = 'apology_actions'
WHERE category = 'Communication'
  AND (name ILIKE '%apolog%' OR description ILIKE '%apolog%')
  AND (requirement_type IS NULL OR requirement_type IN ('daily', 'weekly', 'action_completion'));

--    b) Conflict resolution actions -> conflict_resolutions
UPDATE actions
SET requirement_type = 'conflict_resolutions'
WHERE category = 'Conflict Resolution'
  AND (requirement_type IS NULL OR requirement_type IN ('daily', 'weekly', 'action_completion'));

-- 6) Intimacy and Reconnection/Roommate Recovery:
--    a) Intimacy-related actions -> intimacy_actions
UPDATE actions
SET requirement_type = 'intimacy_actions'
WHERE category = 'Intimacy'
  AND (requirement_type IS NULL OR requirement_type IN ('daily', 'weekly', 'action_completion'));

--    b) Roommate Recovery / deep connection actions in Reconnection -> connection_actions
UPDATE actions
SET requirement_type = 'connection_actions'
WHERE category = 'Reconnection'
  AND (name ILIKE '%roommate%' 
       OR name ILIKE '%connection%' 
       OR description ILIKE '%roommate%' 
       OR description ILIKE '%connection%')
  AND (requirement_type IS NULL OR requirement_type IN ('daily', 'weekly', 'action_completion'));

-- 7) Partnership: default to partnership_actions if not otherwise specialized
UPDATE actions
SET requirement_type = 'partnership_actions'
WHERE category = 'Partnership'
  AND (requirement_type IS NULL OR requirement_type IN ('daily', 'weekly', 'action_completion'));

-- Notes:
-- - These updates are intentionally conservative: they only override generic
--   requirement_types like 'daily', 'weekly', or 'action_completion', or NULL.
-- - Existing specific requirement_types (date_nights, outdoor_activities, etc.)
--   are preserved.
-- - This pass ensures every action sits in one of the 8 main categories and
--   has a meaningful subcategory that connects cleanly to the badge system.


