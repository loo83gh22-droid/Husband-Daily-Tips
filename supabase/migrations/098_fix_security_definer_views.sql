-- Fix SECURITY DEFINER issue on views
-- Views should use SECURITY INVOKER (run with querying user's permissions)
-- instead of SECURITY DEFINER (run with view creator's permissions)
-- By default, views are SECURITY INVOKER unless explicitly set to SECURITY DEFINER

-- Recreate outdoor_activity_actions view (defaults to SECURITY INVOKER)
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

-- Recreate adventure_activity_actions view (defaults to SECURITY INVOKER)
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

