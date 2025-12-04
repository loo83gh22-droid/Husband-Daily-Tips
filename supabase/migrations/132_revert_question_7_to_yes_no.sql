-- Revert question 7 back to yes_no (no Sometimes option)
-- Question 7: "In the last month, have you planned a date or surprise for your partner?"
-- This should remain a simple Yes/No question, not a 3-option scale

UPDATE survey_questions
SET response_type = 'yes_no'
WHERE id = 7 AND question_text LIKE '%planned a date or surprise%';

-- Note: Question 7 is a baseline question but should remain Yes/No only
-- All other baseline questions (1-6, 8-18) use scale (1-3) with No/Sometimes/Yes

