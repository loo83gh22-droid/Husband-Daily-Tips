-- Improve tracking for Outdoor Activities and Adventure Activities badges
-- Add a way to identify which actions count toward these badges

-- ============================================================================
-- STEP 1: Check current actions that might be outdoor/adventure related
-- This query helps identify which actions should count for these badges
-- ============================================================================

-- View actions that might be outdoor-related
-- SELECT name, category, theme, description 
-- FROM actions 
-- WHERE name ILIKE '%outdoor%' 
--    OR name ILIKE '%hiking%' 
--    OR name ILIKE '%walk%' 
--    OR name ILIKE '%camping%' 
--    OR name ILIKE '%nature%' 
--    OR name ILIKE '%park%' 
--    OR name ILIKE '%trail%' 
--    OR name ILIKE '%beach%' 
--    OR name ILIKE '%picnic%' 
--    OR name ILIKE '%garden%'
--    OR description ILIKE '%outdoor%'
--    OR description ILIKE '%hiking%'
-- ORDER BY category, name;

-- View actions that might be adventure-related
-- SELECT name, category, theme, description 
-- FROM actions 
-- WHERE name ILIKE '%adventure%' 
--    OR name ILIKE '%explore%' 
--    OR name ILIKE '%challenge%' 
--    OR name ILIKE '%quest%' 
--    OR name ILIKE '%journey%' 
--    OR name ILIKE '%discover%' 
--    OR name ILIKE '%expedition%'
--    OR description ILIKE '%adventure%'
--    OR description ILIKE '%explore%'
-- ORDER BY category, name;

-- ============================================================================
-- STEP 2: Add tags or metadata to help identify outdoor/adventure actions
-- Option 1: Add a tags column to actions table (if it doesn't exist)
-- Option 2: Use the existing theme/category fields more effectively
-- ============================================================================

-- For now, the keyword matching in lib/badges.ts handles this
-- But we should document which actions count toward these badges

-- ============================================================================
-- STEP 3: Create a view or helper query to see which actions count for outdoor/adventure badges
-- ============================================================================

-- This query shows which actions would count for Outdoor Activities badges
-- (based on keyword matching logic in lib/badges.ts)
CREATE OR REPLACE VIEW outdoor_activity_actions AS
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

-- This query shows which actions would count for Adventure Activities badges
CREATE OR REPLACE VIEW adventure_activity_actions AS
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

-- ============================================================================
-- STEP 4: Add comments to document the tracking method
-- ============================================================================

COMMENT ON VIEW outdoor_activity_actions IS 'Actions that count toward Outdoor Activities badges. Identified by keyword matching on name and description fields. Keywords: outdoor, hiking, walk, camping, nature, park, trail, beach, picnic, garden.';

COMMENT ON VIEW adventure_activity_actions IS 'Actions that count toward Adventure Activities badges. Identified by keyword matching on name and description fields. Keywords: adventure, explore, explorer, challenge, quest, journey, discover, expedition.';

COMMENT ON TABLE badges IS 'Outdoor Activities and Adventure Activities badges use keyword matching to identify qualifying actions. See outdoor_activity_actions and adventure_activity_actions views for which actions count. Badges are awards and do NOT affect Husband Health score.';

