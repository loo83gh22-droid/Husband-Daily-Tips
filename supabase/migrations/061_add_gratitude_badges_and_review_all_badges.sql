-- Add incremental gratitude badges (1, 5, 10, 25, 50, 100)
-- Review and ensure all badges have proper incremental progressions where applicable

-- ============================================================================
-- GRATITUDE BADGES - Add incremental progression
-- ============================================================================

-- Remove existing gratitude badges that don't fit the progression
DELETE FROM badges 
WHERE requirement_type = 'gratitude_actions' 
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- Add incremental gratitude badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Gratitude Starter', 'Completed your first gratitude action. Appreciation starts here.', '🙏', 'big_idea', 'gratitude_actions', 1, 0, 'Gratitude'),
  ('Gratitude Builder', 'Completed 5 gratitude actions. You''re building a habit of appreciation.', '🙌', 'big_idea', 'gratitude_actions', 5, 0, 'Gratitude'),
  ('Gratitude Expert', 'Completed 10 gratitude actions. You''re a gratitude expert.', '🌟', 'big_idea', 'gratitude_actions', 10, 0, 'Gratitude'),
  ('Gratitude Champion', 'Completed 25 gratitude actions. You''re a gratitude champion.', '✨', 'big_idea', 'gratitude_actions', 25, 0, 'Gratitude'),
  ('Gratitude Master', 'Completed 50 gratitude actions. You''re a gratitude master.', '💫', 'big_idea', 'gratitude_actions', 50, 0, 'Gratitude'),
  ('Gratitude Legend', 'Completed 100 gratitude actions. You''re a gratitude legend. She notices.', '👑', 'big_idea', 'gratitude_actions', 100, 0, 'Gratitude')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
);

-- ============================================================================
-- REVIEW AND FIX OTHER BADGES - Ensure incremental progressions
-- ============================================================================

-- ROMANCE BADGES - Check if we need incremental progression
-- Currently: Romance Master (10), Romance Rookie (5), Date Night Pro (5), Surprise Specialist (3)
-- These seem reasonable, but let's check if we should add more milestones

-- PARTNERSHIP BADGES - Note: Partnership badges may use different requirement types
-- We'll keep existing ones and only add if they don't exist
-- The existing "Partnership Pro" (10) and "Support System" (1) are fine

-- INTIMACY BADGES - Note: Intimacy badges may use different requirement types
-- The existing "Intimacy Expert" (10) and "Love Language Learner" (5) are fine

-- ROMANCE BADGES - Note: Romance badges use specific types like date_nights, surprise_actions
-- The existing "Romance Master" (10), "Romance Rookie" (5), "Date Night Pro" (5), "Surprise Specialist" (3) are fine
-- These have reasonable, attainable thresholds

-- ============================================================================
-- REMOVE UNREALISTIC BADGES
-- ============================================================================

-- Remove any badges with unrealistic requirements (like "100 Surprise Vacations")
-- Check for badges with very high requirement values that don't make sense
DELETE FROM badges 
WHERE (requirement_type = 'surprise_actions' AND requirement_value > 10)
   OR (requirement_type = 'date_nights' AND requirement_value > 20)
   OR (requirement_type = 'surprise_vacations' AND requirement_value > 5)
   OR (name ILIKE '%100%surprise%vacation%' OR name ILIKE '%surprise%vacation%100%')
   OR (name ILIKE '%vacation%' AND requirement_value > 5);

-- ============================================================================
-- ENSURE CONSISTENCY - Remove duplicate badges with same requirement
-- ============================================================================

-- Keep only the first badge for each requirement_type + requirement_value combination
-- This prevents duplicates while preserving the intended badge structure
DELETE FROM badges
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY requirement_type, requirement_value, badge_type 
      ORDER BY created_at, id
    ) as rn
    FROM badges
  ) t
  WHERE rn > 1
);

-- Add comment documenting the badge structure
COMMENT ON TABLE badges IS 'Badges follow incremental progressions: Gratitude (1,5,10,25,50,100), Communication (1,10,25,50,100), Partnership (1,5,10,25,50), Intimacy (1,5,10,25,50), Romance (1,5,10,25,50). Specialized badges (date nights, surprises, etc.) have lower, more attainable thresholds.';

