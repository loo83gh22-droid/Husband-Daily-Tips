-- Explicitly fix SECURITY DEFINER issue on both views
-- This migration uses multiple approaches to ensure views are SECURITY INVOKER
-- 
-- The issue: Even after DROP/CREATE, views may still be SECURITY DEFINER
-- Solution: Use explicit owner changes and ensure proper security settings

-- ============================================================================
-- STEP 1: Drop both views completely
-- ============================================================================
DROP VIEW IF EXISTS outdoor_activity_actions CASCADE;
DROP VIEW IF EXISTS adventure_activity_actions CASCADE;

-- ============================================================================
-- STEP 2: Recreate outdoor_activity_actions view
-- ============================================================================
CREATE VIEW outdoor_activity_actions
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  category,
  theme,
  description,
  'outdoor_activities' AS badge_type
FROM actions
WHERE name ILIKE '%outdoor%' 
   OR name ILIKE '%hiking%' 
   OR name ILIKE '%walk%' 
   OR name ILIKE '%camping%' 
   OR name ILIKE '%nature%' 
   OR name ILIKE '%park%' 
   OR name ILIKE '%trail%' 
   OR name ILIKE '%beach%' 
   OR name ILIKE '%picnic%' 
   OR name ILIKE '%garden%'
   OR description ILIKE '%outdoor%'
   OR description ILIKE '%hiking%'
   OR description ILIKE '%walk%'
   OR description ILIKE '%camping%'
   OR description ILIKE '%nature%'
   OR description ILIKE '%park%'
   OR description ILIKE '%trail%'
   OR description ILIKE '%beach%'
   OR description ILIKE '%picnic%'
   OR description ILIKE '%garden%';

-- Restore comment
COMMENT ON VIEW outdoor_activity_actions IS 'Actions that count toward Outdoor Activities badges. Identified by keyword matching on name and description fields. Keywords: outdoor, hiking, walk, camping, nature, park, trail, beach, picnic, garden.';

-- ============================================================================
-- STEP 3: Recreate adventure_activity_actions view
-- ============================================================================
CREATE VIEW adventure_activity_actions
WITH (security_invoker = true) AS
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

-- Restore comment
COMMENT ON VIEW adventure_activity_actions IS 'Actions that count toward Adventure Activities badges. Identified by keyword matching on name and description fields. Keywords: adventure, explore, explorer, challenge, quest, journey, discover, expedition.';

-- ============================================================================
-- STEP 4: If WITH (security_invoker = true) is not supported, try alternative
-- Note: If the above fails, PostgreSQL may not support the WITH clause for views
-- In that case, we'll need to ensure the views are owned by a non-privileged role
-- ============================================================================

-- Alternative approach: Change owner to authenticated role (if WITH clause doesn't work)
-- Uncomment these if the WITH clause approach doesn't work:
-- ALTER VIEW outdoor_activity_actions OWNER TO authenticated;
-- ALTER VIEW adventure_activity_actions OWNER TO authenticated;

