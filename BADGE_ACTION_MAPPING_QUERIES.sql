-- ============================================================================
-- BADGE TO ACTION MAPPING QUERIES
-- Run these in Supabase SQL Editor to see which actions accrue to which badges
-- ============================================================================

-- ============================================================================
-- QUERY 1: View all actions with their categories
-- This shows you what category each action belongs to
-- ============================================================================
SELECT 
  id,
  name,
  category,
  theme,
  description
FROM actions
ORDER BY category, name;

-- ============================================================================
-- QUERY 2: View all category-based badges with their requirements
-- This shows you which badges exist for each category
-- ============================================================================
SELECT 
  id,
  name,
  category,
  requirement_type,
  requirement_value,
  description
FROM badges
WHERE requirement_type = 'category_count'
ORDER BY category, requirement_value;

-- ============================================================================
-- QUERY 3: JOIN - See which actions accrue to which badges
-- This is the most useful query - shows the mapping directly
-- ============================================================================
SELECT 
  a.name AS action_name,
  a.category AS action_category,
  b.name AS badge_name,
  b.requirement_value AS actions_needed,
  b.description AS badge_description
FROM actions a
CROSS JOIN badges b
WHERE b.requirement_type = 'category_count'
  AND b.category = a.category
ORDER BY a.category, b.requirement_value, a.name;

-- ============================================================================
-- QUERY 4: Count actions per category (to see how many actions exist for each badge)
-- ============================================================================
SELECT 
  category,
  COUNT(*) AS total_actions
FROM actions
GROUP BY category
ORDER BY category;

-- ============================================================================
-- QUERY 5: See badge progression for a specific category
-- Replace 'Conflict Resolution' with any category you want to check
-- ============================================================================
SELECT 
  b.name AS badge_name,
  b.requirement_value AS actions_needed,
  b.description,
  COUNT(DISTINCT a.id) AS available_actions_in_category
FROM badges b
LEFT JOIN actions a ON a.category = b.category
WHERE b.requirement_type = 'category_count'
  AND b.category = 'Conflict Resolution'  -- Change this to any category
GROUP BY b.id, b.name, b.requirement_value, b.description
ORDER BY b.requirement_value;

-- ============================================================================
-- QUERY 6: Check if any actions have NULL or incorrect categories
-- ============================================================================
SELECT 
  id,
  name,
  category,
  theme
FROM actions
WHERE category IS NULL 
  OR category NOT IN (
    'Communication',
    'Intimacy',
    'Partnership',
    'Romance',
    'Gratitude',
    'Conflict Resolution',
    'Reconnection',
    'Quality Time'
  )
ORDER BY category, name;

-- ============================================================================
-- QUERY 7: Check if any badges have categories that don't match actions
-- ============================================================================
SELECT DISTINCT
  b.category AS badge_category,
  COUNT(DISTINCT a.id) AS matching_actions_count
FROM badges b
LEFT JOIN actions a ON a.category = b.category
WHERE b.requirement_type = 'category_count'
GROUP BY b.category
HAVING COUNT(DISTINCT a.id) = 0
ORDER BY b.category;

-- ============================================================================
-- QUERY 8: User-specific - See which badges a user is close to earning
-- Replace 'USER_ID_HERE' with an actual user ID
-- ============================================================================
SELECT 
  b.name AS badge_name,
  b.category,
  b.requirement_value AS needed,
  COUNT(DISTINCT uac.action_id) AS completed,
  b.requirement_value - COUNT(DISTINCT uac.action_id) AS remaining,
  ROUND((COUNT(DISTINCT uac.action_id)::numeric / b.requirement_value::numeric) * 100, 1) AS progress_percent
FROM badges b
LEFT JOIN actions a ON a.category = b.category
LEFT JOIN user_action_completions uac ON uac.action_id = a.id 
  AND uac.user_id = 'USER_ID_HERE'  -- Replace with actual user ID
WHERE b.requirement_type = 'category_count'
  AND b.id NOT IN (
    SELECT badge_id FROM user_badges WHERE user_id = 'USER_ID_HERE'  -- Replace with actual user ID
  )
GROUP BY b.id, b.name, b.category, b.requirement_value
HAVING COUNT(DISTINCT uac.action_id) < b.requirement_value
ORDER BY b.category, progress_percent DESC;

-- ============================================================================
-- QUERY 9: CSV FORMAT - Actions with all corresponding badges as columns
-- This query creates a CSV-friendly format with actions in column 1
-- and all corresponding badges in subsequent columns
-- ============================================================================
SELECT 
  a.name AS "Action Name",
  a.category AS "Category",
  STRING_AGG(
    CASE 
      WHEN b.requirement_value = 1 THEN 'Starter (1)'
      WHEN b.requirement_value = 5 THEN 'Builder (5)'
      WHEN b.requirement_value = 10 THEN 'Expert (10)'
      WHEN b.requirement_value = 25 THEN 'Master (25)'
      WHEN b.requirement_value = 50 THEN 'Champion (50)'
      WHEN b.requirement_value = 100 THEN 'Legend (100)'
      ELSE b.name || ' (' || b.requirement_value::text || ')'
    END,
    ', ' ORDER BY b.requirement_value
  ) AS "Corresponding Badges"
FROM actions a
LEFT JOIN badges b ON b.category = a.category 
  AND b.requirement_type = 'category_count'
GROUP BY a.id, a.name, a.category
ORDER BY a.category, a.name;

-- ============================================================================
-- QUERY 10: CSV FORMAT - Detailed version with each badge as separate column
-- Shows each badge level as Yes/No for each action (CATEGORY BADGES ONLY)
-- ============================================================================
SELECT 
  a.name AS "Action Name",
  a.category AS "Category",
  MAX(CASE WHEN b.requirement_value = 1 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Starter (1)",
  MAX(CASE WHEN b.requirement_value = 5 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Builder (5)",
  MAX(CASE WHEN b.requirement_value = 10 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Expert (10)",
  MAX(CASE WHEN b.requirement_value = 25 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Master (25)",
  MAX(CASE WHEN b.requirement_value = 50 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Champion (50)",
  MAX(CASE WHEN b.requirement_value = 100 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Legend (100)"
FROM actions a
LEFT JOIN badges b ON b.category = a.category 
  AND b.requirement_type = 'category_count'
GROUP BY a.id, a.name, a.category
ORDER BY a.category, a.name;

-- ============================================================================
-- QUERY 12: Check for missing badges - See which categories are missing badges
-- ============================================================================
SELECT 
  a.category,
  COUNT(DISTINCT a.id) AS total_actions,
  COUNT(DISTINCT CASE WHEN b.requirement_type = 'category_count' AND b.requirement_value = 1 THEN b.id END) AS has_starter,
  COUNT(DISTINCT CASE WHEN b.requirement_type = 'category_count' AND b.requirement_value = 5 THEN b.id END) AS has_builder,
  COUNT(DISTINCT CASE WHEN b.requirement_type = 'category_count' AND b.requirement_value = 10 THEN b.id END) AS has_expert,
  COUNT(DISTINCT CASE WHEN b.requirement_type = 'category_count' AND b.requirement_value = 25 THEN b.id END) AS has_master,
  COUNT(DISTINCT CASE WHEN b.requirement_type = 'category_count' AND b.requirement_value = 50 THEN b.id END) AS has_champion,
  COUNT(DISTINCT CASE WHEN b.requirement_type = 'category_count' AND b.requirement_value = 100 THEN b.id END) AS has_legend
FROM actions a
LEFT JOIN badges b ON b.category = a.category 
  AND b.requirement_type = 'category_count'
GROUP BY a.category
ORDER BY a.category;

-- ============================================================================
-- QUERY 13: CSV FORMAT - Complete version with ALL badge types
-- Includes category badges AND specialized badges (apology, gratitude, etc.)
-- ============================================================================
WITH category_badges AS (
  SELECT 
    a.id AS action_id,
    a.name AS action_name,
    a.category,
    MAX(CASE WHEN b.requirement_value = 1 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Category Starter (1)",
    MAX(CASE WHEN b.requirement_value = 5 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Category Builder (5)",
    MAX(CASE WHEN b.requirement_value = 10 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Category Expert (10)",
    MAX(CASE WHEN b.requirement_value = 25 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Category Master (25)",
    MAX(CASE WHEN b.requirement_value = 50 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Category Champion (50)",
    MAX(CASE WHEN b.requirement_value = 100 AND b.requirement_type = 'category_count' THEN 'Yes' ELSE '' END) AS "Category Legend (100)"
  FROM actions a
  LEFT JOIN badges b ON b.category = a.category 
    AND b.requirement_type = 'category_count'
  GROUP BY a.id, a.name, a.category
),
specialized_badges AS (
  SELECT 
    a.id AS action_id,
    STRING_AGG(
      CASE 
        WHEN b.requirement_type = 'apology_actions' THEN 'Apology: ' || b.name || ' (' || b.requirement_value::text || ')'
        WHEN b.requirement_type = 'gratitude_actions' THEN 'Gratitude: ' || b.name || ' (' || b.requirement_value::text || ')'
        WHEN b.requirement_type = 'surprise_actions' THEN 'Surprise: ' || b.name || ' (' || b.requirement_value::text || ')'
        WHEN b.requirement_type = 'date_nights' THEN 'Date Night: ' || b.name || ' (' || b.requirement_value::text || ')'
        WHEN b.requirement_type = 'outdoor_activities' THEN 'Outdoor: ' || b.name || ' (' || b.requirement_value::text || ')'
        WHEN b.requirement_type = 'adventure_activities' THEN 'Adventure: ' || b.name || ' (' || b.requirement_value::text || ')'
        ELSE b.requirement_type || ': ' || b.name || ' (' || b.requirement_value::text || ')'
      END,
      ', ' ORDER BY b.requirement_type, b.requirement_value
    ) AS specialized_badge_list
  FROM actions a
  LEFT JOIN badges b ON (
    -- Match by action name/keywords for specialized badges
    (b.requirement_type = 'apology_actions' AND (a.name ILIKE '%apolog%' OR a.description ILIKE '%apolog%'))
    OR (b.requirement_type = 'gratitude_actions' AND (a.name ILIKE '%gratitude%' OR a.name ILIKE '%thank%' OR a.description ILIKE '%gratitude%' OR a.description ILIKE '%thank%'))
    OR (b.requirement_type = 'surprise_actions' AND (a.name ILIKE '%surprise%' OR a.description ILIKE '%surprise%'))
    OR (b.requirement_type = 'date_nights' AND (a.name ILIKE '%date%' OR a.description ILIKE '%date night%'))
    OR (b.requirement_type = 'outdoor_activities' AND (a.name ILIKE '%outdoor%' OR a.name ILIKE '%hiking%' OR a.name ILIKE '%walk%' OR a.name ILIKE '%camping%' OR a.description ILIKE '%outdoor%'))
    OR (b.requirement_type = 'adventure_activities' AND (a.name ILIKE '%adventure%' OR a.name ILIKE '%explore%' OR a.description ILIKE '%adventure%'))
  )
  WHERE b.requirement_type IN ('apology_actions', 'gratitude_actions', 'surprise_actions', 'date_nights', 'outdoor_activities', 'adventure_activities')
  GROUP BY a.id
)
SELECT 
  cb.action_name AS "Action Name",
  cb.category AS "Category",
  cb."Category Starter (1)",
  cb."Category Builder (5)",
  cb."Category Expert (10)",
  cb."Category Master (25)",
  cb."Category Champion (50)",
  cb."Category Legend (100)",
  COALESCE(sb.specialized_badge_list, '') AS "Specialized Badges"
FROM category_badges cb
LEFT JOIN specialized_badges sb ON cb.action_id = sb.action_id
ORDER BY cb.category, cb.action_name;

-- ============================================================================
-- QUERY 11: CSV FORMAT - All badges as separate columns with badge names
-- Most detailed version - shows full badge names as column headers
-- ============================================================================
SELECT 
  a.name AS "Action Name",
  a.category AS "Category",
  MAX(CASE WHEN b.name LIKE '%Starter%' AND b.requirement_value = 1 THEN 'Yes' ELSE '' END) AS "Starter Badge",
  MAX(CASE WHEN b.name LIKE '%Builder%' AND b.requirement_value = 5 THEN 'Yes' ELSE '' END) AS "Builder Badge",
  MAX(CASE WHEN b.name LIKE '%Expert%' AND b.requirement_value = 10 THEN 'Yes' ELSE '' END) AS "Expert Badge",
  MAX(CASE WHEN b.name LIKE '%Master%' AND b.requirement_value = 25 THEN 'Yes' ELSE '' END) AS "Master Badge",
  MAX(CASE WHEN b.name LIKE '%Champion%' AND b.requirement_value = 50 THEN 'Yes' ELSE '' END) AS "Champion Badge",
  MAX(CASE WHEN b.name LIKE '%Legend%' AND b.requirement_value = 100 THEN 'Yes' ELSE '' END) AS "Legend Badge"
FROM actions a
LEFT JOIN badges b ON b.category = a.category 
  AND b.requirement_type = 'category_count'
GROUP BY a.id, a.name, a.category
ORDER BY a.category, a.name;

-- ============================================================================
-- QUERY 14: CSV FORMAT - FIXED VERSION - Shows all category badges correctly
-- This version shows "MISSING" if badges don't exist, and includes specialized badges
-- ============================================================================
SELECT 
  a.name AS "Action Name",
  a.category AS "Category",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM badges b 
      WHERE b.category = a.category 
      AND b.requirement_type = 'category_count' 
      AND b.requirement_value = 1
    ) THEN 'Yes' 
    ELSE 'MISSING' 
  END AS "Starter (1)",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM badges b 
      WHERE b.category = a.category 
      AND b.requirement_type = 'category_count' 
      AND b.requirement_value = 5
    ) THEN 'Yes' 
    ELSE 'MISSING' 
  END AS "Builder (5)",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM badges b 
      WHERE b.category = a.category 
      AND b.requirement_type = 'category_count' 
      AND b.requirement_value = 10
    ) THEN 'Yes' 
    ELSE 'MISSING' 
  END AS "Expert (10)",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM badges b 
      WHERE b.category = a.category 
      AND b.requirement_type = 'category_count' 
      AND b.requirement_value = 25
    ) THEN 'Yes' 
    ELSE 'MISSING' 
  END AS "Master (25)",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM badges b 
      WHERE b.category = a.category 
      AND b.requirement_type = 'category_count' 
      AND b.requirement_value = 50
    ) THEN 'Yes' 
    ELSE 'MISSING' 
  END AS "Champion (50)",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM badges b 
      WHERE b.category = a.category 
      AND b.requirement_type = 'category_count' 
      AND b.requirement_value = 100
    ) THEN 'Yes' 
    ELSE 'MISSING' 
  END AS "Legend (100)",
  -- Specialized badges column
  CASE 
    WHEN a.name ILIKE '%apolog%' OR a.description ILIKE '%apolog%' THEN 'Apology Ace (3)'
    WHEN a.name ILIKE '%gratitude%' OR a.name ILIKE '%thank%' OR a.description ILIKE '%gratitude%' OR a.description ILIKE '%thank%' THEN 'Gratitude badges (1,5,10,25,50,100)'
    WHEN a.name ILIKE '%surprise%' OR a.description ILIKE '%surprise%' THEN 'Surprise badges (1,5)'
    WHEN a.name ILIKE '%date%' OR a.description ILIKE '%date night%' THEN 'Date Night badges (1,5,10,25)'
    WHEN EXISTS (SELECT 1 FROM outdoor_activity_actions oaa WHERE oaa.id = a.id) THEN 'Outdoor Activities badges (1,5,10,25,50,100)'
    WHEN EXISTS (SELECT 1 FROM adventure_activity_actions aaa WHERE aaa.id = a.id) THEN 'Adventure Activities badges (1,5,10,25,50,100)'
    ELSE ''
  END AS "Specialized Badges"
FROM actions a
ORDER BY a.category, a.name;

-- ============================================================================
-- QUERY 15: See which actions count for Outdoor Activities badges
-- ============================================================================
SELECT 
  name AS "Action Name",
  category AS "Category",
  description
FROM outdoor_activity_actions
ORDER BY category, name;

-- ============================================================================
-- QUERY 16: See which actions count for Adventure Activities badges
-- ============================================================================
SELECT 
  name AS "Action Name",
  category AS "Category",
  description
FROM adventure_activity_actions
ORDER BY category, name;

-- ============================================================================
-- QUERY 17: CSV FORMAT - Actions with Outdoor/Adventure badge connections
-- ============================================================================
SELECT 
  a.name AS "Action Name",
  a.category AS "Category",
  CASE WHEN EXISTS (SELECT 1 FROM outdoor_activity_actions oaa WHERE oaa.id = a.id) THEN 'Yes' ELSE '' END AS "Outdoor Activities",
  CASE WHEN EXISTS (SELECT 1 FROM adventure_activity_actions aaa WHERE aaa.id = a.id) THEN 'Yes' ELSE '' END AS "Adventure Activities"
FROM actions a
ORDER BY a.category, a.name;

