-- Fix Roommate Recovery actions to connect to Reconnection badges
-- Roommate Syndrome Recovery actions should be categorized as "Reconnection" to match existing badges

-- ============================================================================
-- STEP 1: Update any actions with "Roommate Syndrome Recovery" category to "Reconnection"
-- ============================================================================

UPDATE actions 
SET category = 'Reconnection',
    theme = 'reconnection'
WHERE category = 'Roommate Syndrome Recovery'
   OR category ILIKE '%roommate%'
   OR theme = 'roommate_syndrome';

-- ============================================================================
-- STEP 2: Remove old "Roommate Syndrome Recovery" badges that don't match standard progression
-- ============================================================================

DELETE FROM badges 
WHERE category = 'Roommate Syndrome Recovery'
   OR (name ILIKE '%roommate%' AND category IS NOT NULL AND category != 'Reconnection')
   OR (name ILIKE '%roommate syndrome%');

-- ============================================================================
-- STEP 3: Ensure Reconnection badges exist (they should from migration 071, but double-check)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Reconnection Starter', 'Completed your first reconnection action. You''re rebuilding the connection.', '🔗', 'big_idea', 'category_count', 1, 0, 'Reconnection'),
  ('Reconnection Builder', 'Completed 5 reconnection actions. You''re actively rebuilding your bond.', '🔗', 'big_idea', 'category_count', 5, 0, 'Reconnection'),
  ('Reconnection Expert', 'Completed 10 reconnection actions. You''re a reconnection expert.', '🔗', 'big_idea', 'category_count', 10, 0, 'Reconnection'),
  ('Reconnection Master', 'Completed 25 reconnection actions. You''re a reconnection master.', '🔗', 'big_idea', 'category_count', 25, 0, 'Reconnection'),
  ('Reconnection Champion', 'Completed 50 reconnection actions. You''re a reconnection champion.', '🔗', 'big_idea', 'category_count', 50, 0, 'Reconnection'),
  ('Reconnection Legend', 'Completed 100 reconnection actions. You''re a reconnection legend.', '🔗', 'big_idea', 'category_count', 100, 0, 'Reconnection')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 4: Ensure 7-Day Reconnection Event badge exists
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Reconnection Champion',
  'Completed the 7-Day Reconnection Event',
  '🔗',
  'big_idea',
  'event_completion',
  1,
  0,
  'Reconnection'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Reconnection Champion' AND requirement_type = 'event_completion'
);

-- ============================================================================
-- STEP 5: Update comment
-- ============================================================================

COMMENT ON TABLE badges IS 'Reconnection category (formerly Roommate Syndrome Recovery) has complete category_count badge progressions: 1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend. All actions with "Roommate Syndrome Recovery" category have been updated to "Reconnection" to match badges. Badges are awards and do NOT affect Husband Health score.';

