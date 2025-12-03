-- Remove duplicate conflict resolution actions
-- These actions are duplicates of more specific versions and should be removed
-- 
-- Actions to remove:
-- 1. "Take Responsibility" (duplicate of "Take Responsibility for Your Part")
-- 2. "Stay Calm" (duplicate of "Stay Calm and Speak Softly")
--
-- Actions to keep:
-- - "Take Responsibility for Your Part" (more specific)
-- - "Stay Calm and Speak Softly" (more specific)

DO $$
DECLARE
    take_responsibility_action_id UUID;
    stay_calm_action_id UUID;
BEGIN
    -- Find the action ID for "Take Responsibility"
    SELECT id INTO take_responsibility_action_id
    FROM actions
    WHERE name = 'Take Responsibility'
    LIMIT 1;

    -- Find the action ID for "Stay Calm"
    SELECT id INTO stay_calm_action_id
    FROM actions
    WHERE name = 'Stay Calm'
    LIMIT 1;

    -- Remove "Take Responsibility" if it exists
    IF take_responsibility_action_id IS NOT NULL THEN
        -- Delete from user_daily_actions
        DELETE FROM user_daily_actions
        WHERE action_id = take_responsibility_action_id;

        -- Delete from user_action_completions
        DELETE FROM user_action_completions
        WHERE action_id = take_responsibility_action_id;

        -- Delete from action_completion_history
        DELETE FROM action_completion_history
        WHERE action_id = take_responsibility_action_id;

        -- Delete from challenge_actions
        DELETE FROM challenge_actions
        WHERE action_id = take_responsibility_action_id;

        -- Remove from user_weekly_planning_actions arrays
        UPDATE user_weekly_planning_actions
        SET action_ids = array_remove(action_ids, take_responsibility_action_id)
        WHERE take_responsibility_action_id = ANY(action_ids);

        -- Delete the action itself
        DELETE FROM actions
        WHERE id = take_responsibility_action_id;

        RAISE NOTICE 'Successfully removed duplicate "Take Responsibility" action (ID: %)', take_responsibility_action_id;
    ELSE
        RAISE NOTICE 'Action "Take Responsibility" not found - may have already been removed';
    END IF;

    -- Remove "Stay Calm" if it exists
    IF stay_calm_action_id IS NOT NULL THEN
        -- Delete from user_daily_actions
        DELETE FROM user_daily_actions
        WHERE action_id = stay_calm_action_id;

        -- Delete from user_action_completions
        DELETE FROM user_action_completions
        WHERE action_id = stay_calm_action_id;

        -- Delete from action_completion_history
        DELETE FROM action_completion_history
        WHERE action_id = stay_calm_action_id;

        -- Delete from challenge_actions
        DELETE FROM challenge_actions
        WHERE action_id = stay_calm_action_id;

        -- Remove from user_weekly_planning_actions arrays
        UPDATE user_weekly_planning_actions
        SET action_ids = array_remove(action_ids, stay_calm_action_id)
        WHERE stay_calm_action_id = ANY(action_ids);

        -- Delete the action itself
        DELETE FROM actions
        WHERE id = stay_calm_action_id;

        RAISE NOTICE 'Successfully removed duplicate "Stay Calm" action (ID: %)', stay_calm_action_id;
    ELSE
        RAISE NOTICE 'Action "Stay Calm" not found - may have already been removed';
    END IF;
END $$;

-- Verify removal
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM actions WHERE name = 'Take Responsibility') THEN
        RAISE WARNING 'Action "Take Responsibility" still exists after deletion attempt';
    ELSE
        RAISE NOTICE 'Verification: "Take Responsibility" action successfully removed';
    END IF;

    IF EXISTS (SELECT 1 FROM actions WHERE name = 'Stay Calm') THEN
        RAISE WARNING 'Action "Stay Calm" still exists after deletion attempt';
    ELSE
        RAISE NOTICE 'Verification: "Stay Calm" action successfully removed';
    END IF;
END $$;

