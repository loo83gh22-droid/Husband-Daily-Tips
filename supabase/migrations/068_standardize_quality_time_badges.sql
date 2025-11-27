-- Standardize Quality Time badges to match the standard progression
-- Progression: 1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend
-- Includes: Quality Time Actions, Outdoor Activities, Adventure Activities

-- ============================================================================
-- STEP 1: Remove all existing Quality Time related badges
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

-- Remove any outdoor/adventure badges that don't fit the standard
DELETE FROM badges 
WHERE (name ILIKE '%outdoor%' OR name ILIKE '%adventure%' OR name ILIKE '%active%' OR name ILIKE '%fitness%')
AND (category = 'Quality Time' OR category IS NULL)
AND requirement_type IN ('category_count', 'outdoor_activities', 'adventure_activities')
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- ============================================================================
-- STEP 2: Add standardized Quality Time Actions progression (1, 5, 10, 25, 50, 100)
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
-- STEP 3: Add standardized Outdoor Activities progression (1, 5, 10, 25, 50, 100)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Outdoor Activities Starter', 'Completed your first outdoor activity together. Getting outside together starts here.', '🌲', 'big_idea', 'outdoor_activities', 1, 0, 'Quality Time'),
  ('Outdoor Activities Builder', 'Completed 5 outdoor activities together. You''re making outdoor time a priority.', '🌲', 'big_idea', 'outdoor_activities', 5, 0, 'Quality Time'),
  ('Outdoor Activities Expert', 'Completed 10 outdoor activities together. You''re an outdoor activities expert.', '🌲', 'big_idea', 'outdoor_activities', 10, 0, 'Quality Time'),
  ('Outdoor Activities Master', 'Completed 25 outdoor activities together. You''re an outdoor activities master.', '🌲', 'big_idea', 'outdoor_activities', 25, 0, 'Quality Time'),
  ('Outdoor Activities Champion', 'Completed 50 outdoor activities together. You''re an outdoor activities champion.', '🌲', 'big_idea', 'outdoor_activities', 50, 0, 'Quality Time'),
  ('Outdoor Activities Legend', 'Completed 100 outdoor activities together. You''re an outdoor activities legend.', '🌲', 'big_idea', 'outdoor_activities', 100, 0, 'Quality Time')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 4: Add standardized Adventure Activities progression (1, 5, 10, 25, 50, 100)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Adventure Activities Starter', 'Completed your first adventure activity together. Your adventure journey starts here.', '🏔️', 'big_idea', 'adventure_activities', 1, 0, 'Quality Time'),
  ('Adventure Activities Builder', 'Completed 5 adventure activities together. You''re building an adventurous relationship.', '🏔️', 'big_idea', 'adventure_activities', 5, 0, 'Quality Time'),
  ('Adventure Activities Expert', 'Completed 10 adventure activities together. You''re an adventure activities expert.', '🏔️', 'big_idea', 'adventure_activities', 10, 0, 'Quality Time'),
  ('Adventure Activities Master', 'Completed 25 adventure activities together. You''re an adventure activities master.', '🏔️', 'big_idea', 'adventure_activities', 25, 0, 'Quality Time'),
  ('Adventure Activities Champion', 'Completed 50 adventure activities together. You''re an adventure activities champion.', '🏔️', 'big_idea', 'adventure_activities', 50, 0, 'Quality Time'),
  ('Adventure Activities Legend', 'Completed 100 adventure activities together. You''re an adventure activities legend.', '🏔️', 'big_idea', 'adventure_activities', 100, 0, 'Quality Time')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 5: Ensure event completion badge exists
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
-- STEP 6: Remove any other Quality Time badges that don't fit the standard
-- ============================================================================

-- Remove any Quality Time badges with requirement values not in standard progression
DELETE FROM badges 
WHERE category = 'Quality Time'
AND requirement_type IN ('category_count', 'outdoor_activities', 'adventure_activities')
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- ============================================================================
-- STEP 7: Update comment
-- ============================================================================

COMMENT ON TABLE badges IS 'Quality Time badges include three progressions: Quality Time Actions (category_count), Outdoor Activities (outdoor_activities), and Adventure Activities (adventure_activities). Each follows the standard progression: 1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend. All badge progressions follow consistent naming across all categories. Badges are awards and do NOT affect Husband Health score.';

