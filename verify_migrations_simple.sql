-- Simple combined verification query
-- This shows all checks in one result set

SELECT 
  'benefit column exists' AS check_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'actions' AND column_name = 'benefit'
  ) AS passed
UNION ALL
SELECT 
  'user_daily_actions table exists',
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_daily_actions'
  )
UNION ALL
SELECT 
  'daily_health_points table exists',
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'daily_health_points'
  )
UNION ALL
SELECT 
  'badges have health_bonus = 0',
  (SELECT COUNT(*) = 0 FROM badges WHERE health_bonus > 0)
UNION ALL
SELECT 
  'actions have benefits (count)',
  (SELECT COUNT(*) >= 30 FROM actions WHERE benefit IS NOT NULL AND benefit != '');

