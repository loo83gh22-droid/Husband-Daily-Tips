-- Step 2: Add 30-day and 90-day survey questions and update functions
-- This runs AFTER the enum values have been added in migration 040

-- Insert 30-day check-in survey questions
INSERT INTO follow_up_survey_questions (survey_type, question_text, question_type, order_index, required, options) VALUES
  ('day_30_checkin'::follow_up_survey_type, 'How has your relationship improved since starting?', 'scale', 1, TRUE, NULL),
  ('day_30_checkin'::follow_up_survey_type, 'What''s been most valuable to you?', 'multiple_choice', 2, TRUE, '{"options": ["Daily actions", "Progress tracking", "Badges/challenges", "Email reminders", "Health bar", "Journal/reflections", "Other"]}'),
  ('day_30_checkin'::follow_up_survey_type, 'How likely are you to continue using this long-term?', 'scale', 3, TRUE, NULL),
  ('day_30_checkin'::follow_up_survey_type, 'Any suggestions for improvement?', 'text', 4, FALSE, NULL)
ON CONFLICT (survey_type, order_index) DO NOTHING;

-- Insert 90-day NPS survey questions
INSERT INTO follow_up_survey_questions (survey_type, question_text, question_type, order_index, required, options) VALUES
  ('day_90_nps'::follow_up_survey_type, 'How likely are you to recommend Best Husband Ever to a friend or colleague?', 'scale', 1, TRUE, '{"scale_min": 0, "scale_max": 10}'),
  ('day_90_nps'::follow_up_survey_type, 'What''s the main reason for your score?', 'text', 2, FALSE, NULL)
ON CONFLICT (survey_type, order_index) DO NOTHING;

-- Update the trigger function to include 30-day and 90-day surveys
CREATE OR REPLACE FUNCTION create_follow_up_survey_eligibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Create 3-day survey eligibility (3 days after signup)
  INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at)
  VALUES (NEW.id, 'day_3_feedback'::follow_up_survey_type, NEW.created_at + INTERVAL '3 days')
  ON CONFLICT (user_id, survey_type) DO NOTHING;
  
  -- Create 7-day survey eligibility (7 days after signup)
  INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at)
  VALUES (NEW.id, 'day_7_conversion'::follow_up_survey_type, NEW.created_at + INTERVAL '7 days')
  ON CONFLICT (user_id, survey_type) DO NOTHING;
  
  -- Create 30-day survey eligibility (30 days after signup)
  INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at)
  VALUES (NEW.id, 'day_30_checkin'::follow_up_survey_type, NEW.created_at + INTERVAL '30 days')
  ON CONFLICT (user_id, survey_type) DO NOTHING;
  
  -- Create 90-day survey eligibility (90 days after signup)
  INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at)
  VALUES (NEW.id, 'day_90_nps'::follow_up_survey_type, NEW.created_at + INTERVAL '90 days')
  ON CONFLICT (user_id, survey_type) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- For existing users, create eligibility records for 30-day and 90-day surveys
INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at, completed)
SELECT 
  id,
  'day_30_checkin'::follow_up_survey_type,
  created_at + INTERVAL '30 days',
  FALSE
FROM users
WHERE created_at < NOW() - INTERVAL '30 days'
ON CONFLICT (user_id, survey_type) DO NOTHING;

INSERT INTO user_follow_up_surveys (user_id, survey_type, eligible_at, completed)
SELECT 
  id,
  'day_90_nps'::follow_up_survey_type,
  created_at + INTERVAL '90 days',
  FALSE
FROM users
WHERE created_at < NOW() - INTERVAL '90 days'
ON CONFLICT (user_id, survey_type) DO NOTHING;

