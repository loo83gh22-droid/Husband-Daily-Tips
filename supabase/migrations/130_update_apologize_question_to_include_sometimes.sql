-- Update question 12 (apologize question) to use scale (1-3) instead of yes_no
-- 1 = No, 2 = Sometimes, 3 = Yes
-- This allows for more nuanced responses

UPDATE survey_questions
SET response_type = 'scale'
WHERE id = 12 AND question_text LIKE '%apologize when you''re wrong%';

-- Note: The scoring logic in app/api/survey/submit/route.ts will need to be updated
-- to handle this question specially:
-- - For baseline health: 1 = 0 points, 2 = 0.5 points, 3 = 1 point
-- - For category scores: 1 = 1 (normalized), 2 = 3 (normalized), 3 = 5 (normalized)

