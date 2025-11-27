-- Update survey to use fun, engaging scenario-based yes/no questions
-- Each "Yes" answer contributes to baseline health score
-- Maximum baseline health from survey is 90%
-- Questions cover all 8 action categories + consistency

-- Clear existing baseline questions (keep goal-setting questions 18-29)
DELETE FROM survey_questions WHERE id <= 17;

-- Insert 18 scenario-based yes/no questions
-- Each Yes = 1 point, No = 0 points
-- Max score = 18/18 = 100%, but we'll cap baseline at 90% in the API

-- Communication (Questions 1-2)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(1, 'When your partner tells you about their day, do you put your phone down and actually listen?', 'communication', 'yes_no', 1),
(2, 'If your partner says something isn''t working, do you listen without getting defensive first?', 'communication', 'yes_no', 2)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Intimacy (Questions 3-4)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(3, 'Do you initiate physical touch (hugs, hand-holding, cuddling) without it leading to sex?', 'intimacy', 'yes_no', 3),
(4, 'When your partner is stressed, do you offer comfort and support before trying to solve their problem?', 'intimacy', 'yes_no', 4)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Partnership (Questions 5-6)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(5, 'Do you notice what needs doing around the house and just do it, without being asked?', 'partnership', 'yes_no', 5),
(6, 'When your partner is overwhelmed, do you step in and handle something to lighten their load?', 'partnership', 'yes_no', 6)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Romance (Questions 7-8)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(7, 'In the last month, have you planned a date or surprise for your partner?', 'romance', 'yes_no', 7),
(8, 'Do you regularly tell your partner what you love or appreciate about them?', 'romance', 'yes_no', 8)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Gratitude (Questions 9-10)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(9, 'Do you thank your partner for the little things they do, not just the big ones?', 'gratitude', 'yes_no', 9),
(10, 'When your partner does something for you, do you acknowledge it out loud?', 'gratitude', 'yes_no', 10)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Conflict Resolution (Questions 11-12)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(11, 'When you disagree, do you stay calm and avoid raising your voice?', 'conflict_resolution', 'yes_no', 11),
(12, 'After a disagreement, do you apologize when you''re wrong, even if it''s hard?', 'conflict_resolution', 'yes_no', 12)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Reconnection (Questions 13-14)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(13, 'Do you have conversations with your partner that aren''t just about logistics or the kids?', 'reconnection', 'yes_no', 13),
(14, 'When you''re both home, do you put your phone away and actually be present with your partner?', 'reconnection', 'yes_no', 14)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Quality Time (Questions 15-16)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(15, 'Do you make time for activities you both enjoy, not just what you individually want to do?', 'quality_time', 'yes_no', 15),
(16, 'When your partner wants to do something together, do you say yes more often than no?', 'quality_time', 'yes_no', 16)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Consistency (Questions 17-18)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(17, 'Do you follow through on things you say you''ll do for your partner?', 'consistency', 'yes_no', 17),
(18, 'Are you intentional about showing up for your relationship, not just when it''s convenient?', 'consistency', 'yes_no', 18)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Note: Questions 19-29 remain as goal-setting questions (not used for baseline)

