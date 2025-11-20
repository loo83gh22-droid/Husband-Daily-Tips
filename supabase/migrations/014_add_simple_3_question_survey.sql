-- Replace existing survey questions with a simple 3-question baseline survey
-- This gives us a quick baseline while keeping it simple for new users

-- Create survey_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS survey_questions (
  id INTEGER PRIMARY KEY,
  question_text TEXT NOT NULL,
  category TEXT NOT NULL, -- 'communication', 'romance', 'partnership', 'intimacy', 'conflict'
  response_type TEXT NOT NULL CHECK (response_type IN ('scale', 'yes_no')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON survey_questions(order_index);
CREATE INDEX IF NOT EXISTS idx_survey_questions_category ON survey_questions(category);

-- Clear existing questions (if any)
DELETE FROM survey_questions;

-- Insert 3 simple baseline questions
-- Scale: 1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
-- Question 1: Overall relationship satisfaction (used for baseline health)
(1, 'I am satisfied with my relationship overall', 'communication', 'scale', 1),

-- Question 2: Communication quality
(2, 'My partner and I communicate well with each other', 'communication', 'scale', 2),

-- Question 3: Partnership/teamwork
(3, 'We work well together as a team in our relationship', 'partnership', 'scale', 3);

-- Note: For the simple 3-question survey, we'll use:
-- - Question 1 for overall baseline health
-- - Question 2 for communication score
-- - Question 3 for partnership score
-- Romance, intimacy, and conflict scores will default to the average of the 3 answers

