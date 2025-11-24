-- Fix survey question response types to match question format
-- Questions asking "How would you rate..." should use rating scale (Poor/Excellent)
-- Questions asking "Would you like to improve..." should use yes_no
-- Statement questions should use agree/disagree scale

-- Update goal-setting rating questions (14, 16, 18, 20, 22, 24, 26, 28) to use 'rating' type
-- These ask "How would you rate..." and should show Poor/Excellent scale

-- Note: We'll add a new response_type 'rating' for questions that need Poor/Excellent scale
-- For now, we'll keep them as 'scale' but update the component to show different labels

-- Actually, let's add a new column to distinguish question types
ALTER TABLE survey_questions
ADD COLUMN IF NOT EXISTS scale_type TEXT DEFAULT 'agreement' CHECK (scale_type IN ('agreement', 'rating', 'frequency'));

COMMENT ON COLUMN survey_questions.scale_type IS 'Type of scale labels: agreement (Strongly Disagree/Agree), rating (Poor/Excellent), frequency (Never/Always)';

-- Update baseline questions (1-17) to use 'agreement' scale (they are statements)
UPDATE survey_questions 
SET scale_type = 'agreement' 
WHERE id BETWEEN 1 AND 17;

-- Update goal-setting rating questions (14, 16, 18, 20, 22, 24, 26, 28) to use 'rating' scale
-- These ask "How would you rate..." or "How well do you..."
UPDATE survey_questions 
SET scale_type = 'rating' 
WHERE id IN (14, 16, 18, 20, 22, 24, 26, 28);

-- Goal-setting yes/no questions (15, 17, 19, 21, 23, 25, 27, 29) already use 'yes_no' response_type - no change needed

