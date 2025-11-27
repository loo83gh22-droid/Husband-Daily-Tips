-- Update Romance badges with specific progressions:
-- Category count badges: 1, 5, 10, 25, 50, 100 (romance actions)
-- Date night badges: 1, 5, 10, 25 (date_nights)
-- Surprise date night badges: 1, 5 (surprise_actions)

-- ============================================================================
-- STEP 1: Remove existing romance badges that don't match the new structure
-- ============================================================================

-- Remove specific old badges that are being replaced
-- Remove old "Romance Rookie" (replaced by "Romance Builder")
-- Remove old "Date Night Pro" (replaced by "Date Night Regular" for 5, and we'll use a different name for 10)
DELETE FROM badges 
WHERE name IN ('Romance Rookie', 'Date Night Pro');

-- Remove existing romance category_count badges (we'll recreate them)
DELETE FROM badges 
WHERE category = 'Romance' 
AND requirement_type = 'category_count';

-- Remove existing date night badges that don't match progression (1, 5, 10, 25)
DELETE FROM badges 
WHERE requirement_type = 'date_nights'
AND requirement_value NOT IN (1, 5, 10, 25);

-- Remove existing surprise action badges that don't match progression (1, 5)
DELETE FROM badges 
WHERE requirement_type = 'surprise_actions'
AND requirement_value NOT IN (1, 5);

-- ============================================================================
-- STEP 2: Add Romance Category Count Badges (1, 5, 10, 25, 50, 100)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Romance Starter', 'Completed your first romance action. The spark starts here.', '💕', 'big_idea', 'category_count', 1, 0, 'Romance'),
  ('Romance Builder', 'Completed 5 romance actions. You''re bringing the romance back.', '💕', 'big_idea', 'category_count', 5, 0, 'Romance'),
  ('Romance Master', 'Completed 10 romance actions. You''re a romance master.', '💕', 'big_idea', 'category_count', 10, 0, 'Romance'),
  ('Romance Expert', 'Completed 25 romance actions. You''ve mastered keeping the spark alive.', '💕', 'big_idea', 'category_count', 25, 0, 'Romance'),
  ('Romance Champion', 'Completed 50 romance actions. You''re a romance champion.', '💕', 'big_idea', 'category_count', 50, 0, 'Romance'),
  ('Romance Legend', 'Completed 100 romance actions. You''re a romance legend.', '💕', 'big_idea', 'category_count', 100, 0, 'Romance')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 3: Add Date Night Badges (1, 5, 10, 25)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Date Night Starter', 'Planned your first date night. Quality time together starts here.', '🍷', 'big_idea', 'date_nights', 1, 0, 'Romance'),
  ('Date Night Regular', 'Planned 5 date nights. You''re making time together a priority.', '🍷', 'big_idea', 'date_nights', 5, 0, 'Romance'),
  ('Date Night Expert', 'Planned 10 date nights. You''re a date night expert.', '🍷', 'big_idea', 'date_nights', 10, 0, 'Romance'),
  ('Date Night Master', 'Planned 25 date nights. You''ve mastered prioritizing quality time together.', '🍷', 'big_idea', 'date_nights', 25, 0, 'Romance')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
);

-- ============================================================================
-- STEP 4: Add Surprise Date Night Badges (1, 5)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Surprise Specialist', 'Planned your first surprise date. The element of surprise adds magic.', '🎁', 'big_idea', 'surprise_actions', 1, 0, 'Romance'),
  ('Surprise Master', 'Planned 5 surprise dates. You''ve mastered the art of surprise.', '🎁', 'big_idea', 'surprise_actions', 5, 0, 'Romance')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
);

-- ============================================================================
-- STEP 5: Update comment documenting Romance badge structure
-- ============================================================================

COMMENT ON TABLE badges IS 'Romance badges include: Category count badges (1,5,10,25,50,100 romance actions), Date night badges (1,5,10,25 date nights), and Surprise date night badges (1,5 surprise actions). All badges are awards and do NOT affect Husband Health score.';

