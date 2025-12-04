-- Update all baseline questions (1-18) to use scale (1-3) instead of yes_no
-- 1 = No, 2 = Sometimes, 3 = Yes
-- This allows for more nuanced responses and better reflects real-world behavior
-- Scoring: No = 0 points, Sometimes = 0.5 points, Yes = 1 point for baseline health

UPDATE survey_questions
SET response_type = 'scale'
WHERE id >= 1 AND id <= 18;

-- Note: The scoring logic in app/api/survey/submit/route.ts handles this:
-- - For baseline health (questions 1-18): 1 = 0 points, 2 = 0.5 points, 3 = 1 point
-- - For category scores: 1 = 1 (normalized), 2 = 3 (normalized), 3 = 5 (normalized)
-- - Maximum baseline health is still capped at 90%

