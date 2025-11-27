-- Standardize Quality Time badges to match the standard progression
-- Progression: 1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend

-- ============================================================================
-- STEP 1: Remove all existing Quality Time category_count badges
-- ============================================================================

-- Remove all Quality Time category_count badges (we'll recreate them with correct progression)
DELETE FROM badges 
WHERE category = 'Quality Time' 
AND requirement_type = 'category_count';

-- Remove any Quality Time badges with non-standard requirement values
DELETE FROM badges 
WHERE (category = 'Quality Time' OR name ILIKE '%quality time%' OR name ILIKE '%quality%time%')
AND requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- Remove any duplicate or incorrectly named Quality Time badges
DELETE FROM badges 
WHERE (name ILIKE '%outdoor%' OR name ILIKE '%adventure%' OR name ILIKE '%active%' OR name ILIKE '%fitness%')
AND category = 'Quality Time'
AND requirement_type = 'category_count';

-- ============================================================================
-- STEP 2: Add standardized Quality Time progression badges (1, 5, 10, 25, 50, 100)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Quality Time Starter', 'Completed your first quality time action. You''re prioritizing time together.', '⏰', 'big_idea', 'category_count', 1, 0, 'Quality Time'),
  ('Quality Time Builder', 'Completed 5 quality time actions. You''re making time together a priority.', '⏰', 'big_idea', 'category_count', 5, 0, 'Quality Time'),
  ('Quality Time Expert', 'Completed 10 quality time actions. You''re a quality time expert.', '⏰', 'big_idea', 'category_count', 10, 0, 'Quality Time'),
  ('Quality Time Master', 'Completed 25 quality time actions. You''re a quality time master.', '⏰', 'big_idea', 'category_count', 25, 0, 'Quality Time'),
  ('Quality Time Champion', 'Completed 50 quality time actions. You''re a quality time champion.', '⏰', 'big_idea', 'category_count', 50, 0, 'Quality Time'),
  ('Quality Time Legend', 'Completed 100 quality time actions. You''re a quality time legend.', '⏰', 'big_idea', 'category_count', 100, 0, 'Quality Time')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 3: Ensure event completion badge exists
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Quality Time Champion',
  'Completed the 7-Day Quality Time Event',
  '⏰',
  'big_idea',
  'event_completion',
  1,
  0,
  'Quality Time'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Quality Time Champion' AND requirement_type = 'event_completion'
);

-- ============================================================================
-- STEP 4: Remove any other Quality Time badges that don't fit the standard
-- ============================================================================

-- Remove any Quality Time badges with requirement values not in standard progression
DELETE FROM badges 
WHERE category = 'Quality Time'
AND requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- ============================================================================
-- STEP 5: Update comment
-- ============================================================================

COMMENT ON TABLE badges IS 'Quality Time badges follow the standard progression: 1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend. All badge progressions follow consistent naming across all categories. Badges are awards and do NOT affect Husband Health score.';

