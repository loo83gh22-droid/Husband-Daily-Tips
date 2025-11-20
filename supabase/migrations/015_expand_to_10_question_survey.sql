-- Expand survey to 10 questions covering generic happiness and specific action themes
-- This provides a more comprehensive baseline while still being quick

-- Clear existing questions
DELETE FROM survey_questions;

-- Insert 10 questions covering different relationship areas
-- Scale: 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
-- Generic/Happiness Questions (1-2)
(1, 'I am satisfied with my relationship overall', 'communication', 'scale', 1),
(2, 'I feel happy and fulfilled in my relationship', 'communication', 'scale', 2),

-- Communication Questions (3-4)
(3, 'My partner and I communicate well with each other', 'communication', 'scale', 3),
(4, 'I feel comfortable expressing my feelings to my partner', 'communication', 'scale', 4),

-- Romance Questions (5-6)
(5, 'I regularly show romantic gestures and affection to my partner', 'romance', 'scale', 5),
(6, 'We make time for date nights and quality time together', 'romance', 'scale', 6),

-- Intimacy Questions (7-8)
(7, 'We have a strong emotional and physical connection', 'intimacy', 'scale', 7),
(8, 'I feel emotionally close and connected to my partner', 'intimacy', 'scale', 8),

-- Partnership/Activity Questions (9-10)
(9, 'We work well together as a team in our relationship', 'partnership', 'scale', 9),
(10, 'I actively participate in activities and experiences with my partner', 'partnership', 'scale', 10);

-- Note: Questions are distributed across categories:
-- - Communication: 4 questions (generic happiness + communication-specific)
-- - Romance: 2 questions
-- - Intimacy: 2 questions
-- - Partnership: 2 questions
-- - Conflict: 0 questions (will use average of other categories)

