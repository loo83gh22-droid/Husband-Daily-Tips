-- Add goal-setting questions to initial survey
-- For each of the 8 action categories, ask:
-- 1. "How [Category] are you?" (1-5 scale)
-- 2. "Would you like to improve it?" (yes/no)
-- This helps prioritize actions and recommend 7-day events

-- ============================================================================
-- ADD NEW GOAL-SETTING QUESTIONS (Questions 14-29)
-- ============================================================================

-- Communication Goal Questions (14-15)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) 
VALUES
(14, 'How would you rate your communication skills in your relationship?', 'communication', 'scale', 14),
(15, 'Would you like to improve your communication?', 'communication', 'yes_no', 15)
ON CONFLICT (id) DO NOTHING;

-- Intimacy Goal Questions (16-17)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) 
VALUES
(16, 'How would you rate the intimacy in your relationship?', 'intimacy', 'scale', 16),
(17, 'Would you like to improve intimacy?', 'intimacy', 'yes_no', 17)
ON CONFLICT (id) DO NOTHING;

-- Partnership Goal Questions (18-19)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) 
VALUES
(18, 'How would you rate your partnership skills (sharing responsibilities, working as a team)?', 'partnership', 'scale', 18),
(19, 'Would you like to improve your partnership?', 'partnership', 'yes_no', 19)
ON CONFLICT (id) DO NOTHING;

-- Romance Goal Questions (20-21)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) 
VALUES
(20, 'How romantic are you in your relationship?', 'romance', 'scale', 20),
(21, 'Would you like to improve romance?', 'romance', 'yes_no', 21)
ON CONFLICT (id) DO NOTHING;

-- Gratitude Goal Questions (22-23)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) 
VALUES
(22, 'How well do you express gratitude and appreciation?', 'gratitude', 'scale', 22),
(23, 'Would you like to improve gratitude?', 'gratitude', 'yes_no', 23)
ON CONFLICT (id) DO NOTHING;

-- Conflict Resolution Goal Questions (24-25)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) 
VALUES
(24, 'How well do you handle conflicts and disagreements?', 'conflict_resolution', 'scale', 24),
(25, 'Would you like to improve conflict resolution?', 'conflict_resolution', 'yes_no', 25)
ON CONFLICT (id) DO NOTHING;

-- Reconnection Goal Questions (26-27)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) 
VALUES
(26, 'How connected do you feel to your partner?', 'reconnection', 'scale', 26),
(27, 'Would you like to improve your connection?', 'reconnection', 'yes_no', 27)
ON CONFLICT (id) DO NOTHING;

-- Quality Time Goal Questions (28-29)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) 
VALUES
(28, 'How much quality time do you spend together?', 'quality_time', 'scale', 28),
(29, 'Would you like to improve quality time?', 'quality_time', 'yes_no', 29)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- UPDATE SURVEY_SUMMARY TABLE TO STORE GOAL PREFERENCES
-- ============================================================================

-- Add columns to store goal preferences (self-rating and improvement desire)
ALTER TABLE survey_summary 
ADD COLUMN IF NOT EXISTS communication_self_rating INTEGER,
ADD COLUMN IF NOT EXISTS communication_wants_improvement BOOLEAN,
ADD COLUMN IF NOT EXISTS intimacy_self_rating INTEGER,
ADD COLUMN IF NOT EXISTS intimacy_wants_improvement BOOLEAN,
ADD COLUMN IF NOT EXISTS partnership_self_rating INTEGER,
ADD COLUMN IF NOT EXISTS partnership_wants_improvement BOOLEAN,
ADD COLUMN IF NOT EXISTS romance_self_rating INTEGER,
ADD COLUMN IF NOT EXISTS romance_wants_improvement BOOLEAN,
ADD COLUMN IF NOT EXISTS gratitude_self_rating INTEGER,
ADD COLUMN IF NOT EXISTS gratitude_wants_improvement BOOLEAN,
ADD COLUMN IF NOT EXISTS conflict_resolution_self_rating INTEGER,
ADD COLUMN IF NOT EXISTS conflict_resolution_wants_improvement BOOLEAN,
ADD COLUMN IF NOT EXISTS reconnection_self_rating INTEGER,
ADD COLUMN IF NOT EXISTS reconnection_wants_improvement BOOLEAN,
ADD COLUMN IF NOT EXISTS quality_time_self_rating INTEGER,
ADD COLUMN IF NOT EXISTS quality_time_wants_improvement BOOLEAN;

-- Add comment explaining the new columns
COMMENT ON COLUMN survey_summary.communication_self_rating IS 'User self-rating (1-5) for communication skills';
COMMENT ON COLUMN survey_summary.communication_wants_improvement IS 'Whether user wants to improve communication (true/false)';
COMMENT ON COLUMN survey_summary.intimacy_self_rating IS 'User self-rating (1-5) for intimacy';
COMMENT ON COLUMN survey_summary.intimacy_wants_improvement IS 'Whether user wants to improve intimacy (true/false)';
COMMENT ON COLUMN survey_summary.partnership_self_rating IS 'User self-rating (1-5) for partnership skills';
COMMENT ON COLUMN survey_summary.partnership_wants_improvement IS 'Whether user wants to improve partnership (true/false)';
COMMENT ON COLUMN survey_summary.romance_self_rating IS 'User self-rating (1-5) for romance';
COMMENT ON COLUMN survey_summary.romance_wants_improvement IS 'Whether user wants to improve romance (true/false)';
COMMENT ON COLUMN survey_summary.gratitude_self_rating IS 'User self-rating (1-5) for gratitude';
COMMENT ON COLUMN survey_summary.gratitude_wants_improvement IS 'Whether user wants to improve gratitude (true/false)';
COMMENT ON COLUMN survey_summary.conflict_resolution_self_rating IS 'User self-rating (1-5) for conflict resolution';
COMMENT ON COLUMN survey_summary.conflict_resolution_wants_improvement IS 'Whether user wants to improve conflict resolution (true/false)';
COMMENT ON COLUMN survey_summary.reconnection_self_rating IS 'User self-rating (1-5) for connection';
COMMENT ON COLUMN survey_summary.reconnection_wants_improvement IS 'Whether user wants to improve connection (true/false)';
COMMENT ON COLUMN survey_summary.quality_time_self_rating IS 'User self-rating (1-5) for quality time';
COMMENT ON COLUMN survey_summary.quality_time_wants_improvement IS 'Whether user wants to improve quality time (true/false)';

