-- Fix incorrectly awarded 7-day event completion badges
-- Badges were being awarded based on completed = true alone
-- But should only be awarded when completed = true AND completed_days = 7
-- This migration removes badges that were incorrectly awarded

-- Remove event completion badges from users who haven't actually completed all 7 days
DELETE FROM user_badges
WHERE badge_id IN (
  SELECT b.id
  FROM badges b
  WHERE b.requirement_type = 'event_completion'
)
AND user_id IN (
  SELECT DISTINCT uc.user_id
  FROM user_challenges uc
  INNER JOIN user_badges ub ON ub.user_id = uc.user_id
  INNER JOIN badges b ON b.id = ub.badge_id
  WHERE b.requirement_type = 'event_completion'
  AND uc.completed = true
  AND (uc.completed_days < 7 OR uc.completed_days IS NULL)
);

-- This will remove incorrectly awarded badges
-- The badge logic in lib/badges.ts has been updated to prevent future incorrect awards
-- by requiring completed_days = 7 in addition to completed = true

