-- Allow multiple completions of the same challenge
-- Remove the UNIQUE constraint and add notes field

-- Drop the unique constraint
ALTER TABLE user_challenge_completions DROP CONSTRAINT IF EXISTS user_challenge_completions_user_id_challenge_id_key;

-- Add notes field if it doesn't exist (it should already be there, but just in case)
ALTER TABLE user_challenge_completions ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add a journal_entry_id to link to reflections/journal
ALTER TABLE user_challenge_completions ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES reflections(id) ON DELETE SET NULL;

-- Create index for journal entries
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_journal_entry_id ON user_challenge_completions(journal_entry_id);

-- Add index for user + challenge for faster queries
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_user_challenge ON user_challenge_completions(user_id, challenge_id);

