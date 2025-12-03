-- Remove duplicate "Gratitude Text" action
-- This action is a duplicate of "Send a Gratitude Text" and should be removed
-- 
-- Note: "Send a Gratitude Text" is the correct action to keep
-- "Gratitude Text" is the duplicate that should be removed

-- First, get the action ID to handle dependencies
DO $$
DECLARE
    gratitude_text_action_id UUID;
BEGIN
    -- Find the action ID for "Gratitude Text"
    SELECT id INTO gratitude_text_action_id
    FROM actions
    WHERE name = 'Gratitude Text'
    LIMIT 1;

    -- Only proceed if the action exists
    IF gratitude_text_action_id IS NOT NULL THEN
        -- Delete from user_daily_actions (cascade will handle this, but being explicit)
        DELETE FROM user_daily_actions
        WHERE action_id = gratitude_text_action_id;

        -- Delete from user_action_completions
        DELETE FROM user_action_completions
        WHERE action_id = gratitude_text_action_id;

        -- Delete from action_completion_history
        DELETE FROM action_completion_history
        WHERE action_id = gratitude_text_action_id;

        -- Delete from challenge_actions
        DELETE FROM challenge_actions
        WHERE action_id = gratitude_text_action_id;

        -- Delete from user_weekly_planning_actions (if referenced in action_ids array)
        -- Note: action_ids is UUID[] so we need to remove the UUID from the array
        UPDATE user_weekly_planning_actions
        SET action_ids = array_remove(action_ids, gratitude_text_action_id)
        WHERE gratitude_text_action_id = ANY(action_ids);

        -- Finally, delete the action itself
        DELETE FROM actions
        WHERE id = gratitude_text_action_id;

        RAISE NOTICE 'Successfully removed duplicate "Gratitude Text" action (ID: %)', gratitude_text_action_id;
    ELSE
        RAISE NOTICE 'Action "Gratitude Text" not found - may have already been removed';
    END IF;
END $$;

-- Verify removal (this will show a notice if the action still exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM actions WHERE name = 'Gratitude Text') THEN
        RAISE WARNING 'Action "Gratitude Text" still exists after deletion attempt';
    ELSE
        RAISE NOTICE 'Verification: "Gratitude Text" action successfully removed';
    END IF;
END $$;

