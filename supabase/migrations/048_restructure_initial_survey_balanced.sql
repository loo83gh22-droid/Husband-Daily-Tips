-- Restructure initial survey to have balanced questions
-- 2 questions per action category (8 categories) + 1 consistency question = 17 questions total
-- Remove roommate question, add conflict questions
-- This creates a balanced baseline health score

-- Clear existing questions (we'll rebuild them)
DELETE FROM survey_questions WHERE id <= 13;

-- Insert 17 balanced questions (2 per category + 1 consistency)
-- Scale: 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree

-- Communication (Questions 1-2)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(1, 'I am satisfied with my relationship overall', 'communication', 'scale', 1),
(2, 'My partner and I communicate well with each other', 'communication', 'scale', 2)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Intimacy (Questions 3-4)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(3, 'We have a strong emotional and physical connection', 'intimacy', 'scale', 3),
(4, 'I feel emotionally close and connected to my partner', 'intimacy', 'scale', 4)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Partnership (Questions 5-6)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(5, 'We work well together as a team in our relationship', 'partnership', 'scale', 5),
(6, 'I actively participate in activities and experiences with my partner', 'partnership', 'scale', 6)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Romance (Questions 7-8)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(7, 'I regularly show romantic gestures and affection to my partner', 'romance', 'scale', 7),
(8, 'We make time for date nights and quality time together', 'romance', 'scale', 8)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Gratitude (Questions 9-10)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(9, 'I regularly express gratitude and appreciation to my partner', 'gratitude', 'scale', 9),
(10, 'I notice and acknowledge the things my partner does for me', 'gratitude', 'scale', 10)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Conflict Resolution (Questions 11-12)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(11, 'We handle disagreements and conflicts constructively', 'conflict_resolution', 'scale', 11),
(12, 'I can resolve conflicts without making things worse', 'conflict_resolution', 'scale', 12)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Reconnection (Questions 13-14)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(13, 'We have meaningful conversations regularly (not just logistics)', 'reconnection', 'scale', 13),
(14, 'I feel connected and close to my partner on a deep level', 'reconnection', 'scale', 14)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Quality Time (Questions 15-16)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(15, 'We spend quality time together regularly', 'quality_time', 'scale', 15),
(16, 'I prioritize spending meaningful time with my partner', 'quality_time', 'scale', 16)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Consistency (Question 17)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(17, 'I consistently show up for my partner and our relationship', 'consistency', 'scale', 17)
ON CONFLICT (id) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  category = EXCLUDED.category,
  response_type = EXCLUDED.response_type,
  order_index = EXCLUDED.order_index;

-- Note: Questions 18-29 remain as goal-setting questions (not used for baseline)
-- Questions 14-29 are goal-setting (added in migration 047)

