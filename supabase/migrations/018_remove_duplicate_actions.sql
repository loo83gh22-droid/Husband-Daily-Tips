-- Remove duplicate/similar actions
-- This migration removes actions that are extremely similar to each other

-- Remove "Active Listening Session" if "Listen Without Fixing" exists
-- They are very similar - both about listening without offering solutions
-- Keep "Listen Without Fixing" as it's more specific and actionable

DO $$
DECLARE
  old_action_id UUID;
  new_action_id UUID;
BEGIN
  -- Get the IDs
  SELECT id INTO old_action_id FROM actions WHERE name = 'Active Listening Session' LIMIT 1;
  SELECT id INTO new_action_id FROM actions WHERE name = 'Listen Without Fixing' LIMIT 1;
  
  -- If both exist, migrate data before deleting
  IF old_action_id IS NOT NULL AND new_action_id IS NOT NULL THEN
    -- Migrate user_action_completions (avoid duplicates on same date)
    UPDATE user_action_completions
    SET action_id = new_action_id
    WHERE action_id = old_action_id
    AND NOT EXISTS (
      SELECT 1 FROM user_action_completions uac2
      WHERE uac2.user_id = user_action_completions.user_id
      AND uac2.action_id = new_action_id
      AND DATE(uac2.completed_at) = DATE(user_action_completions.completed_at)
    );
    
    -- Delete remaining completions that couldn't be migrated (duplicates)
    DELETE FROM user_action_completions
    WHERE action_id = old_action_id;
    
    -- Migrate user_daily_actions (avoid duplicates on same date)
    UPDATE user_daily_actions
    SET action_id = new_action_id
    WHERE action_id = old_action_id
    AND NOT EXISTS (
      SELECT 1 FROM user_daily_actions uda2
      WHERE uda2.user_id = user_daily_actions.user_id
      AND uda2.action_id = new_action_id
      AND uda2.date = user_daily_actions.date
    );
    
    -- Delete remaining daily actions that couldn't be migrated
    DELETE FROM user_daily_actions
    WHERE action_id = old_action_id;
    
    -- Update challenge_actions to point to new action
    -- But if the challenge already has the new action on a different day, we need to handle it
    -- For now, we'll update day 1 to use "Listen Without Fixing" (which is already on day 6)
    -- This will create a duplicate, so we'll need to remove day 1's entry
    -- Actually, let's just remove day 1's entry since day 6 already has "Listen Without Fixing"
    DELETE FROM challenge_actions
    WHERE action_id = old_action_id;
    
    -- Now safe to delete the old action
    DELETE FROM actions WHERE id = old_action_id;
  END IF;
END $$;

