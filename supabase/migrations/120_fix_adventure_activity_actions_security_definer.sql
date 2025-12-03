-- Fix SECURITY DEFINER issue on adventure_activity_actions view
-- View should use SECURITY INVOKER (run with querying user's permissions)
-- instead of SECURITY DEFINER (run with view creator's permissions)
-- 
-- IMPORTANT: We must DROP and CREATE (not REPLACE) to ensure SECURITY DEFINER is removed
-- CREATE OR REPLACE may not change the security property if it was already set

-- Drop and recreate adventure_activity_actions view (defaults to SECURITY INVOKER)
DROP VIEW IF EXISTS adventure_activity_actions CASCADE;

CREATE VIEW adventure_activity_actions AS
SELECT 
  id,
  name,
  category,
  theme,
  description,
  'adventure_activities' AS badge_type
FROM actions
WHERE name ILIKE '%adventure%' 
   OR name ILIKE '%explore%' 
   OR name ILIKE '%explorer%'
   OR name ILIKE '%challenge%' 
   OR name ILIKE '%quest%' 
   OR name ILIKE '%journey%' 
   OR name ILIKE '%discover%' 
   OR name ILIKE '%expedition%'
   OR description ILIKE '%adventure%'
   OR description ILIKE '%explore%'
   OR description ILIKE '%explorer%'
   OR description ILIKE '%challenge%'
   OR description ILIKE '%quest%'
   OR description ILIKE '%journey%'
   OR description ILIKE '%discover%'
   OR description ILIKE '%expedition%';

-- Restore comment on adventure_activity_actions view
COMMENT ON VIEW adventure_activity_actions IS 'Actions that count toward Adventure Activities badges. Identified by keyword matching on name and description fields. Keywords: adventure, explore, explorer, challenge, quest, journey, discover, expedition.';

-- Explicitly set to SECURITY INVOKER (though this should be the default)
-- Note: PostgreSQL doesn't have a direct ALTER VIEW ... SET SECURITY INVOKER command,
-- so we rely on the DROP/CREATE to reset it to the default (SECURITY INVOKER)

