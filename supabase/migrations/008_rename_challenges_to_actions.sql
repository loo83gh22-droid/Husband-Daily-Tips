-- Rename challenges table to actions (if it exists and hasn't been renamed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenges') THEN
    ALTER TABLE challenges RENAME TO actions;
  END IF;
END $$;

-- Rename user_challenge_completions table to user_action_completions (if it exists and hasn't been renamed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_challenge_completions') THEN
    ALTER TABLE user_challenge_completions RENAME TO user_action_completions;
  END IF;
END $$;

-- Rename columns that reference challenges
-- Check if column exists before renaming (PostgreSQL doesn't support IF EXISTS for RENAME COLUMN)
DO $$
BEGIN
  -- Check if user_action_completions table exists and has challenge_id column
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_action_completions' 
    AND column_name = 'challenge_id'
  ) THEN
    ALTER TABLE user_action_completions RENAME COLUMN challenge_id TO action_id;
  END IF;
  
  -- Also check if it's still named user_challenge_completions (in case table rename failed)
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_challenge_completions' 
    AND column_name = 'challenge_id'
  ) THEN
    ALTER TABLE user_challenge_completions RENAME COLUMN challenge_id TO action_id;
  END IF;
END $$;

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

