-- Add survey_completed field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS survey_completed BOOLEAN DEFAULT FALSE;

-- Survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'communication', 'romance', 'partnership', 'intimacy', 'conflict'
  response_value INTEGER NOT NULL, -- 1-5 scale or 1 for yes, 0 for no
  response_type TEXT NOT NULL CHECK (response_type IN ('scale', 'yes_no')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Survey summary table (calculated baseline and category scores)
CREATE TABLE IF NOT EXISTS survey_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  baseline_health INTEGER NOT NULL, -- 0-100 baseline health score
  communication_score DECIMAL(5,2) NOT NULL,
  romance_score DECIMAL(5,2) NOT NULL,
  partnership_score DECIMAL(5,2) NOT NULL,
  intimacy_score DECIMAL(5,2) NOT NULL,
  conflict_score DECIMAL(5,2) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_category ON survey_responses(category);
CREATE INDEX IF NOT EXISTS idx_survey_summary_user_id ON survey_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_users_survey_completed ON users(survey_completed);

