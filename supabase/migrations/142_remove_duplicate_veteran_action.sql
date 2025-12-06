-- Remove duplicate "Plan a Dinner for a Veteran You Know" action
-- Keep the one with the earlier ID (ef70c0ff-9333-44d1-8c3b-d57247c78d13)
-- Remove the duplicate (6fdc2328-aa45-4fab-aed2-45a325ae79e3)

DO $$
DECLARE
    duplicate_action_id UUID := '6fdc2328-aa45-4fab-aed2-45a325ae79e3';
    keep_action_id UUID := 'ef70c0ff-9333-44d1-8c3b-d57247c78d13';
    migrated_count INTEGER := 0;
BEGIN
    -- Check if duplicate exists
    IF EXISTS (SELECT 1 FROM actions WHERE id = duplicate_action_id) THEN
        -- Migrate user_daily_actions to use the kept action
        UPDATE user_daily_actions
        SET action_id = keep_action_id
        WHERE action_id = duplicate_action_id;
        
        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % user_daily_actions records', migrated_count;
        
        -- Migrate user_action_completions to use the kept action
        UPDATE user_action_completions
        SET action_id = keep_action_id
        WHERE action_id = duplicate_action_id;
        
        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % user_action_completions records', migrated_count;
        
        -- Migrate user_hidden_actions to use the kept action
        UPDATE user_hidden_actions
        SET action_id = keep_action_id
        WHERE action_id = duplicate_action_id;
        
        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % user_hidden_actions records', migrated_count;
        
        -- Migrate user_action_favorites to use the kept action
        UPDATE user_action_favorites
        SET action_id = keep_action_id
        WHERE action_id = duplicate_action_id;
        
        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % user_action_favorites records', migrated_count;
        
        -- Migrate challenge_actions if they exist
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenge_actions') THEN
            UPDATE challenge_actions
            SET action_id = keep_action_id
            WHERE action_id = duplicate_action_id;
            
            GET DIAGNOSTICS migrated_count = ROW_COUNT;
            RAISE NOTICE 'Migrated % challenge_actions records', migrated_count;
        END IF;
        
        -- Now delete the duplicate action
        DELETE FROM actions WHERE id = duplicate_action_id;
        
        RAISE NOTICE 'Successfully removed duplicate action: Plan a Dinner for a Veteran You Know (ID: %)', duplicate_action_id;
    ELSE
        RAISE NOTICE 'Duplicate action not found, may have already been removed';
    END IF;
END $$;

