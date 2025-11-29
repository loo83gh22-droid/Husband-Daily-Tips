-- Add work days question to survey
-- This will be the last question in the survey (order_index 30)
-- Users can select multiple days they work (0=Sunday, 1=Monday, ..., 6=Saturday)

-- First, update the check constraint to allow 'multi_select' response type
-- Drop the existing constraint (PostgreSQL auto-generates names, so we need to find it)
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'survey_questions'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%response_type%';
    
    -- Drop it if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE survey_questions DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

-- Add the updated constraint
ALTER TABLE survey_questions 
ADD CONSTRAINT survey_questions_response_type_check 
CHECK (response_type IN ('scale', 'yes_no', 'multi_select'));

-- Now insert the work days question
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) 
VALUES
(30, 'Which days of the week do you typically work? (Select all that apply)', 'schedule', 'multi_select', 30)
ON CONFLICT (id) DO NOTHING;

-- Note: The response_type 'multi_select' will need to be handled in the SurveyForm component
-- The response will be stored as an array of integers in the users.work_days column

