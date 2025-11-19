-- Verification script to check if migrations 010 and 011 were applied correctly
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- ============================================================================
-- ALL CHECKS IN ONE RESULT SET
-- ============================================================================

SELECT 
  'Check 1: benefit column exists' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'actions' AND column_name = 'benefit'
    ) 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS result;

SELECT 
  'Check 2: user_daily_actions table exists' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'user_daily_actions'
    ) 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS result;

SELECT 
  'Check 3: Actions have benefits' AS check_name,
  CONCAT(
    CASE 
      WHEN COUNT(*) >= 30 THEN '✅ PASS: '
      ELSE '⚠️ WARNING: '
    END,
    COUNT(*), ' actions have benefits'
  ) AS result
FROM actions 
WHERE benefit IS NOT NULL AND benefit != '';

SELECT 
  'Check 4: daily_health_points table exists' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'daily_health_points'
    ) 
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END AS result;

SELECT 
  'Check 5: All badge health_bonus = 0' AS check_name,
  CASE 
    WHEN COUNT(*) = 0 
    THEN '✅ PASS: All badges have health_bonus = 0'
    ELSE CONCAT('❌ FAIL: ', COUNT(*), ' badges still have health_bonus > 0')
  END AS result
FROM badges 
WHERE health_bonus > 0;

-- ============================================================================
-- SUMMARY COUNTS
-- ============================================================================

SELECT '--- SUMMARY ---' AS info, '' AS count;

SELECT 'Total actions' AS info, COUNT(*)::text AS count FROM actions;

SELECT 'Actions with benefits' AS info, COUNT(*)::text AS count FROM actions WHERE benefit IS NOT NULL AND benefit != '';

SELECT 'Total badges' AS info, COUNT(*)::text AS count FROM badges;

SELECT 'Badges with health_bonus = 0' AS info, COUNT(*)::text AS count FROM badges WHERE health_bonus = 0;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

SELECT '--- SAMPLE ACTION (should show benefit) ---' AS info, '' AS count;

SELECT 
  name AS action_name, 
  LEFT(benefit, 100) AS benefit_preview 
FROM actions 
WHERE benefit IS NOT NULL AND benefit != '' 
LIMIT 3;
