-- Add Weekly Streak badges for consistency category
-- Awards users for completing at least 1 action during consecutive work weeks (Monday-Friday)
-- Follows the same naming and logic pattern as other progression badges

-- ============================================================================
-- STEP 1: Create Weekly Streak badges (1, 3, 5, 10, 20, 50, 100 weeks)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('1 Week Streak', 'Completed at least 1 action this work week. You''re showing up.', '🔥', 'consistency', 'weekly_streak', 1, 0, NULL),
  ('3 Week Streak', 'Completed actions for 3 consecutive work weeks. Building consistency.', '🔥', 'consistency', 'weekly_streak', 3, 0, NULL),
  ('5 Week Streak', 'Completed actions for 5 consecutive work weeks. Making it a habit.', '🔥', 'consistency', 'weekly_streak', 5, 0, NULL),
  ('10 Week Streak', 'Completed actions for 10 consecutive work weeks. You''re committed.', '🔥', 'consistency', 'weekly_streak', 10, 0, NULL),
  ('20 Week Streak', 'Completed actions for 20 consecutive work weeks. You''re dedicated.', '🔥', 'consistency', 'weekly_streak', 20, 0, NULL),
  ('50 Week Streak', 'Completed actions for 50 consecutive work weeks. You''re consistent.', '🔥', 'consistency', 'weekly_streak', 50, 0, NULL),
  ('100 Week Streak', 'Completed actions for 100 consecutive work weeks. You''re a legend.', '🔥', 'consistency', 'weekly_streak', 100, 0, NULL)
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE requirement_type = 'weekly_streak'
  AND requirement_value = v.requirement_value
);

-- ============================================================================
-- STEP 2: Update table comment to include weekly streak badges
-- ============================================================================

COMMENT ON TABLE badges IS 'Consistency badges include: Consecutive Daily Actions (3, 7, 14, 30, 60, 90, 180, 365 days), Weekly Streaks (1, 3, 5, 10, 20, 50, 100 weeks), 7-Day Events (1, 3, 5, All), and Total Actions Completed (10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 500). Badges are awards and do NOT affect Husband Health score.';

