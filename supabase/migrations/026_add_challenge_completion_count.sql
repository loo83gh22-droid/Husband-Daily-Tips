-- Add completion_count to track how many times a user has completed a challenge
-- Challenges can be completed multiple times

ALTER TABLE user_challenges ADD COLUMN IF NOT EXISTS completion_count INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_challenges_completion_count ON user_challenges(user_id, challenge_id, completed);

-- Add comment
COMMENT ON COLUMN user_challenges.completion_count IS 'Number of times user has completed this challenge (can complete multiple times)';

