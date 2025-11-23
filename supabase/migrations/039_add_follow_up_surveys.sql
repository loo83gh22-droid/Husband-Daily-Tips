-- Add follow-up survey system (3-day and 7-day surveys)
-- This extends the existing survey system to support post-signup feedback surveys

-- Follow-up survey types
CREATE TYPE follow_up_survey_type AS ENUM ('day_3_feedback', 'day_7_conversion');

-- Follow-up survey questions table
CREATE TABLE IF NOT EXISTS follow_up_survey_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_type follow_up_survey_type NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('scale', 'yes_no', 'multiple_choice', 'text')),
  order_index INTEGER NOT NULL,
  options JSONB, -- For multiple choice questions: {"options": ["Option 1", "Option 2", ...]}
  required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(survey_type, order_index)
);

-- Follow-up survey responses table
CREATE TABLE IF NOT EXISTS follow_up_survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  survey_type follow_up_survey_type NOT NULL,
  question_id UUID NOT NULL REFERENCES follow_up_survey_questions(id) ON DELETE CASCADE,
  response_value TEXT, -- Can store scale (1-5), yes/no, multiple choice, or text
  response_text TEXT, -- For text responses
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, survey_type, question_id)
);

-- User follow-up survey status tracking
CREATE TABLE IF NOT EXISTS user_follow_up_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  survey_type follow_up_survey_type NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  dismissed BOOLEAN DEFAULT FALSE, -- User dismissed the survey
  email_sent BOOLEAN DEFAULT FALSE, -- For 7-day survey email
  eligible_at TIMESTAMP WITH TIME ZONE NOT NULL, -- When user becomes eligible (3 or 7 days after signup)
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, survey_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_follow_up_survey_questions_type ON follow_up_survey_questions(survey_type, order_index);
CREATE INDEX IF NOT EXISTS idx_follow_up_survey_responses_user ON follow_up_survey_responses(user_id, survey_type);
CREATE INDEX IF NOT EXISTS idx_user_follow_up_surveys_user ON user_follow_up_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follow_up_surveys_eligible ON user_follow_up_surveys(eligible_at, completed, dismissed) WHERE completed = FALSE AND dismissed = FALSE;

-- Insert 3-day feedback survey questions
INSERT INTO follow_up_survey_questions (survey_type, question_text, question_type, order_index, required) VALUES
  ('day_3_feedback', 'How easy was it to get started?', 'scale', 1, TRUE),
  ('day_3_feedback', 'What do you think of the daily actions so far?', 'scale', 2, TRUE),
  ('day_3_feedback', 'Any features you''d like to see?', 'text', 3, FALSE),
  ('day_3_feedback', 'Any issues or confusion?', 'text', 4, FALSE),
  ('day_3_feedback', 'How likely are you to continue using this?', 'scale', 5, TRUE);

-- Insert 7-day conversion survey questions
INSERT INTO follow_up_survey_questions (survey_type, question_text, question_type, order_index, required, options) VALUES
  ('day_7_conversion', 'How has your experience been so far?', 'scale', 1, TRUE, NULL),
  ('day_7_conversion', 'Have the actions been helpful?', 'yes_no', 2, TRUE, NULL),
  ('day_7_conversion', 'What''s been most valuable?', 'multiple_choice', 3, TRUE, '{"options": ["Daily actions", "Progress tracking", "Badges/challenges", "Email reminders", "Other"]}'),
  ('day_7_conversion', 'What would make this more valuable?', 'text', 4, FALSE, NULL),
  ('day_7_conversion', 'Would you recommend this to a friend?', 'scale', 5, TRUE, NULL);

-- Function to automatically create follow-up survey eligibility records for new users
CREATE OR REPLACE FUNCTION create_follow_up_survey_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Create 3-day survey eligibility (3 days after signup)
  INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at)
  VALUES (NEW.id, 'day_3_feedback', NEW.created_at + INTERVAL '3 days')
  ON CONFLICT (user_id, survey_type) DO NOTHING;
  
  -- Create 7-day survey eligibility (7 days after signup)
  INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at)
  VALUES (NEW.id, 'day_7_conversion', NEW.created_at + INTERVAL '7 days')
  ON CONFLICT (user_id, survey_type) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create eligibility records when new user is created
DROP TRIGGER IF EXISTS trigger_create_follow_up_surveys ON users;
CREATE TRIGGER trigger_create_follow_up_surveys
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_up_survey_eligibility();

-- For existing users, create eligibility records (run this once after migration)
-- This will create records for users who signed up more than 3 or 7 days ago
INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at, completed)
SELECT 
  id,
  'day_3_feedback',
  created_at + INTERVAL '3 days',
  FALSE
FROM users
WHERE created_at < NOW() - INTERVAL '3 days'
ON CONFLICT (user_id, survey_type) DO NOTHING;

INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at, completed)
SELECT 
  id,
  'day_7_conversion',
  created_at + INTERVAL '7 days',
  FALSE
FROM users
WHERE created_at < NOW() - INTERVAL '7 days'
ON CONFLICT (user_id, survey_type) DO NOTHING;

