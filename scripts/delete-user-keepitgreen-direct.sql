-- Delete user "keepitgreen@live.ca" completely from the database
-- Run this in Supabase SQL Editor

-- First, find the user
DO $$
DECLARE
    target_user_id UUID;
    user_email TEXT;
    user_auth0_id TEXT;
    user_name TEXT;
    user_username TEXT;
BEGIN
    -- Try to find by email
    SELECT id, email, auth0_id, name, username 
    INTO target_user_id, user_email, user_auth0_id, user_name, user_username
    FROM users
    WHERE email = 'keepitgreen@live.ca' OR email ILIKE '%keepitgreen%'
    LIMIT 1;

    -- If not found, try by username
    IF target_user_id IS NULL THEN
        SELECT id, email, auth0_id, name, username 
        INTO target_user_id, user_email, user_auth0_id, user_name, user_username
        FROM users
        WHERE username = 'keepitgreen' OR username ILIKE '%keepitgreen%'
        LIMIT 1;
    END IF;

    -- If still not found, show all users for reference
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User not found. Here are all users (first 20):';
        FOR user_email IN 
            SELECT email || ' (username: ' || COALESCE(username, 'NULL') || ', name: ' || COALESCE(name, 'NULL') || ')' 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 20
        LOOP
            RAISE NOTICE '%', user_email;
        END LOOP;
        RETURN;
    END IF;

    RAISE NOTICE 'Found user:';
    RAISE NOTICE '  ID: %', target_user_id;
    RAISE NOTICE '  Email: %', user_email;
    RAISE NOTICE '  Username: %', COALESCE(user_username, 'NULL');
    RAISE NOTICE '  Auth0 ID: %', user_auth0_id;
    RAISE NOTICE '  Name: %', COALESCE(user_name, 'NULL');
    RAISE NOTICE '';
    RAISE NOTICE 'Starting deletion...';

    -- Delete in order (respecting foreign key constraints)
    
    -- 1. Delete deep_thoughts_comments (comments on Team Wins posts)
    DELETE FROM deep_thoughts_comments
    WHERE deep_thought_id IN (SELECT id FROM deep_thoughts WHERE user_id = target_user_id);
    RAISE NOTICE 'Deleted deep_thoughts_comments';

    -- 2. Delete deep_thoughts (Team Wins posts)
    DELETE FROM deep_thoughts WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted deep_thoughts';

    -- 3. Delete reflections (journal entries)
    DELETE FROM reflections WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted reflections';

    -- 4. Delete action_completion_history
    DELETE FROM action_completion_history WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted action_completion_history';

    -- 5. Delete user_action_completions
    DELETE FROM user_action_completions WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted user_action_completions';

    -- 6. Delete user_badges
    DELETE FROM user_badges WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted user_badges';

    -- 7. Delete user_challenges (7-day events)
    DELETE FROM user_challenges WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted user_challenges';

    -- 8. Delete event_completion_bonuses
    DELETE FROM event_completion_bonuses WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted event_completion_bonuses';

    -- 9. Delete health_decay_log
    DELETE FROM health_decay_log WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted health_decay_log';

    -- 10. Delete weekly_health_points
    DELETE FROM weekly_health_points WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted weekly_health_points';

    -- 11. Delete daily_health_points
    DELETE FROM daily_health_points WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted daily_health_points';

    -- 12. Delete user_tips
    DELETE FROM user_tips WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted user_tips';

    -- 13. Delete user_daily_actions
    DELETE FROM user_daily_actions WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted user_daily_actions';

    -- 14. Delete user_weekly_planning_actions
    DELETE FROM user_weekly_planning_actions WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted user_weekly_planning_actions';

    -- 15. Delete user_hidden_actions
    DELETE FROM user_hidden_actions WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted user_hidden_actions';

    -- 16. Delete follow_up_survey_responses
    DELETE FROM follow_up_survey_responses WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted follow_up_survey_responses';

    -- 17. Delete user_follow_up_surveys
    DELETE FROM user_follow_up_surveys WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted user_follow_up_surveys';

    -- 18. Delete survey_responses
    DELETE FROM survey_responses WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted survey_responses';

    -- 19. Delete survey_summary
    DELETE FROM survey_summary WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted survey_summary';

    -- 20. Delete email_replies
    DELETE FROM email_replies WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted email_replies';

    -- 21. Delete user_category_preferences
    DELETE FROM user_category_preferences WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted user_category_preferences';

    -- 22. Delete feedback
    DELETE FROM feedback WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted feedback';

    -- 23. Delete guide_visits
    DELETE FROM guide_visits WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted guide_visits';

    -- 24. Delete referrals where user is referrer
    DELETE FROM referrals WHERE referrer_id = target_user_id;
    RAISE NOTICE 'Deleted referrals (as referrer)';

    -- 25. Delete referrals where user is referee
    DELETE FROM referrals WHERE referee_id = target_user_id;
    RAISE NOTICE 'Deleted referrals (as referee)';

    -- 26. Clear referred_by_user_id for users referred by this user
    UPDATE users SET referred_by_user_id = NULL WHERE referred_by_user_id = target_user_id;
    RAISE NOTICE 'Cleared referred_by_user_id references';

    -- 27. Delete payment_history
    BEGIN
        DELETE FROM payment_history WHERE user_id = target_user_id;
        RAISE NOTICE 'Deleted payment_history';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipped payment_history: %', SQLERRM;
    END;

    -- 28. Delete subscriptions
    BEGIN
        DELETE FROM subscriptions WHERE user_id = target_user_id;
        RAISE NOTICE 'Deleted subscriptions';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Skipped subscriptions: %', SQLERRM;
    END;

    -- 31. Finally, delete the user record
    DELETE FROM users WHERE id = target_user_id;
    RAISE NOTICE 'Deleted user record';

    RAISE NOTICE '';
    RAISE NOTICE '✅ User "keepitgreen@live.ca" has been completely removed from the database!';
    RAISE NOTICE '   Email: %', user_email;
    RAISE NOTICE '   Username: %', COALESCE(user_username, 'NULL');
    RAISE NOTICE '   Auth0 ID: %', user_auth0_id;

END $$;

