-- Standardize Consistency badges
-- Consecutive Daily Actions: 3, 7, 14, 30, 60, 90, 180, 365
-- 7 Day Events: 1, 3, 5, All (renamed from "weekly events")
-- Total Actions Completed: 10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 500
-- Remove: Early Bird, Night Owl, Weekend badges

-- ============================================================================
-- STEP 1: Remove non-standard streak badges (keep only 3, 7, 14, 30, 60, 90, 180, 365)
-- ============================================================================

-- Remove streak badges that don't match the standard progression
DELETE FROM badges 
WHERE requirement_type = 'streak_days'
AND requirement_value NOT IN (3, 7, 14, 30, 60, 90, 180, 365);

-- ============================================================================
-- STEP 2: Ensure standard streak badges exist with correct names
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('3 Day Streak', 'Completed 3 consecutive daily actions. You''re building momentum.', '🔥', 'consistency', 'streak_days', 3, 0, NULL),
  ('7 Day Streak', 'Completed 7 consecutive daily actions. You''re making it a habit.', '🔥', 'consistency', 'streak_days', 7, 0, NULL),
  ('14 Day Streak', 'Completed 14 consecutive daily actions. Two weeks of consistency.', '🔥', 'consistency', 'streak_days', 14, 0, NULL),
  ('30 Day Streak', 'Completed 30 consecutive daily actions. A full month of showing up.', '🔥', 'consistency', 'streak_days', 30, 0, NULL),
  ('60 Day Streak', 'Completed 60 consecutive daily actions. Two months of dedication.', '🔥', 'consistency', 'streak_days', 60, 0, NULL),
  ('90 Day Streak', 'Completed 90 consecutive daily actions. Three months of consistency.', '🔥', 'consistency', 'streak_days', 90, 0, NULL),
  ('180 Day Streak', 'Completed 180 consecutive daily actions. Six months of commitment.', '🔥', 'consistency', 'streak_days', 180, 0, NULL),
  ('365 Day Streak', 'Completed 365 consecutive daily actions. A full year of showing up every day.', '🔥', 'consistency', 'streak_days', 365, 0, NULL)
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
);

-- ============================================================================
-- STEP 3: Update weekly event badges to "7 Day Events" (keep only 1, 3, 5, All)
-- ============================================================================

-- Remove non-standard weekly/event completion badges
DELETE FROM badges 
WHERE (requirement_type = 'challenge_completed' OR requirement_type = 'event_completion' OR name ILIKE '%weekly%' OR name ILIKE '%7-day%' OR name ILIKE '%7 day%')
AND requirement_value NOT IN (1, 3, 5)
AND name NOT ILIKE '%all%'
AND category IS NULL;

-- Remove badges with "All" in name that aren't event completion badges
DELETE FROM badges 
WHERE name ILIKE '%all%'
AND requirement_type NOT IN ('challenge_completed', 'event_completion')
AND category IS NULL;

-- Update existing weekly event badge names to "7 Day Events"
UPDATE badges 
SET name = REPLACE(REPLACE(REPLACE(name, 'Weekly', '7 Day Event'), 'weekly', '7 Day Event'), 'Week', '7 Day Event'),
    description = REPLACE(REPLACE(description, 'weekly event', '7-day event'), 'Weekly event', '7-day event')
WHERE (requirement_type = 'challenge_completed' OR requirement_type = 'event_completion')
AND (name ILIKE '%weekly%' OR name ILIKE '%week%')
AND category IS NULL;

-- Remove old event badges that don't match the new naming
DELETE FROM badges 
WHERE name IN (
  'Event Starter',
  'Event Master',
  'Event Legend',
  'Steady Hand'
)
OR (name ILIKE '%event starter%' AND requirement_type = 'challenge_joined')
OR (name ILIKE '%event master%' AND requirement_type IN ('challenge_completed', 'event_completion'))
OR (name ILIKE '%event legend%' AND requirement_type IN ('challenge_completed', 'event_completion'))
OR (name ILIKE '%steady hand%');

-- Ensure standard 7 Day Event badges exist (with correct "7-Day" naming)
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('First 7-Day Event', 'Completed your first 7-Day event. You''re committed to growth.', '🎯', 'consistency', 'event_completion', 1, 0, NULL),
  ('3 Seven-Day Events', 'Completed 3 7-Day events. You''re building consistency.', '🎯', 'consistency', 'event_completion', 3, 0, NULL),
  ('5 Seven-Day Events', 'Completed 5 7-Day events. You''re a dedicated participant.', '🎯', 'consistency', 'event_completion', 5, 0, NULL),
  ('All Seven-Day Events', 'Completed all available 7-Day events. You''re a completionist.', '🎯', 'consistency', 'event_completion', 999, 0, NULL)
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category IS NULL
);

-- Update any existing badges that say "seven-day" to "7-Day"
UPDATE badges 
SET name = REPLACE(REPLACE(name, 'seven-day', '7-Day'), 'Seven-Day', '7-Day'),
    description = REPLACE(REPLACE(description, 'seven-day', '7-Day'), 'Seven-Day', '7-Day')
WHERE (name ILIKE '%seven-day%' OR description ILIKE '%seven-day%')
AND requirement_type = 'event_completion';

-- ============================================================================
-- STEP 4: Standardize Total Actions Completed badges (10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 500)
-- ============================================================================

-- Remove non-standard total actions badges
DELETE FROM badges 
WHERE requirement_type = 'total_actions'
AND requirement_value NOT IN (10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 500);

-- Ensure standard total actions badges exist
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('10 Actions Completed', 'Completed 10 total actions. You''re getting started.', '✅', 'consistency', 'total_actions', 10, 0, NULL),
  ('25 Actions Completed', 'Completed 25 total actions. You''re making progress.', '✅', 'consistency', 'total_actions', 25, 0, NULL),
  ('50 Actions Completed', 'Completed 50 total actions. You''re building momentum.', '✅', 'consistency', 'total_actions', 50, 0, NULL),
  ('100 Actions Completed', 'Completed 100 total actions. You''re committed.', '✅', 'consistency', 'total_actions', 100, 0, NULL),
  ('150 Actions Completed', 'Completed 150 total actions. You''re dedicated.', '✅', 'consistency', 'total_actions', 150, 0, NULL),
  ('200 Actions Completed', 'Completed 200 total actions. You''re consistent.', '✅', 'consistency', 'total_actions', 200, 0, NULL),
  ('250 Actions Completed', 'Completed 250 total actions. You''re persistent.', '✅', 'consistency', 'total_actions', 250, 0, NULL),
  ('300 Actions Completed', 'Completed 300 total actions. You''re determined.', '✅', 'consistency', 'total_actions', 300, 0, NULL),
  ('350 Actions Completed', 'Completed 350 total actions. You''re unstoppable.', '✅', 'consistency', 'total_actions', 350, 0, NULL),
  ('400 Actions Completed', 'Completed 400 total actions. You''re a champion.', '✅', 'consistency', 'total_actions', 400, 0, NULL),
  ('500 Actions Completed', 'Completed 500 total actions. You''re a legend.', '✅', 'consistency', 'total_actions', 500, 0, NULL)
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
);

-- ============================================================================
-- STEP 5: Remove Early Bird, Night Owl, and Weekend badges
-- ============================================================================

DELETE FROM badges 
WHERE name ILIKE '%early bird%'
OR name ILIKE '%night owl%'
OR name ILIKE '%weekend%'
OR (name ILIKE '%early%' AND name ILIKE '%bird%')
OR (name ILIKE '%night%' AND name ILIKE '%owl%');

-- ============================================================================
-- STEP 6: Update comment
-- ============================================================================

COMMENT ON TABLE badges IS 'Consistency badges include: Consecutive Daily Actions (3, 7, 14, 30, 60, 90, 180, 365 days), 7-Day Events (1, 3, 5, All), and Total Actions Completed (10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 500). Badges are awards and do NOT affect Husband Health score.';

