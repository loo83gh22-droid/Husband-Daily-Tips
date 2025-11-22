-- Add DNC (Did Not Complete) field to user_daily_actions table
-- This allows users to mark actions they don't want to complete, hiding them from outstanding actions

ALTER TABLE user_daily_actions ADD COLUMN IF NOT EXISTS dnc BOOLEAN DEFAULT FALSE;

-- Create index for filtering outstanding actions (completed = false AND dnc = false)
CREATE INDEX IF NOT EXISTS idx_user_daily_actions_outstanding ON user_daily_actions(user_id, date, completed, dnc) WHERE completed = false AND dnc = false;

