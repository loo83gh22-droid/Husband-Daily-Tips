-- Rename challenges table to actions
ALTER TABLE IF EXISTS challenges RENAME TO actions;

-- Rename user_challenge_completions table to user_action_completions
ALTER TABLE IF EXISTS user_challenge_completions RENAME TO user_action_completions;

-- Rename columns that reference challenges
ALTER TABLE IF EXISTS user_action_completions 
  RENAME COLUMN challenge_id TO action_id;

-- Update indexes
DROP INDEX IF EXISTS idx_challenges_category;
DROP INDEX IF EXISTS idx_challenges_theme;
DROP INDEX IF EXISTS idx_challenges_requirement_type;
DROP INDEX IF EXISTS idx_user_challenge_completions_user_id;
DROP INDEX IF EXISTS idx_user_challenge_completions_challenge_id;

CREATE INDEX IF NOT EXISTS idx_actions_category ON actions(category);
CREATE INDEX IF NOT EXISTS idx_actions_theme ON actions(theme);
CREATE INDEX IF NOT EXISTS idx_actions_requirement_type ON actions(requirement_type);
CREATE INDEX IF NOT EXISTS idx_user_action_completions_user_id ON user_action_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_action_completions_action_id ON user_action_completions(action_id);

-- Update foreign key constraint name (if it exists)
-- Note: PostgreSQL doesn't allow direct renaming of foreign key constraints easily
-- The constraint will work with the new column name

-- Update trigger name
DROP TRIGGER IF EXISTS update_challenges_updated_at ON actions;
CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

