-- Quick script to add example Team Wins posts immediately
-- Copy and paste this entire script into Supabase SQL Editor and run it

DO $$
DECLARE
    example_user_id UUID;
BEGIN
    -- Get or create example user
    SELECT id INTO example_user_id
    FROM users
    WHERE email = 'example@besthusbandever.com'
    LIMIT 1;

    IF example_user_id IS NULL THEN
        INSERT INTO users (auth0_id, email, name, subscription_tier, post_anonymously, referral_code, created_at)
        VALUES (
            'auth0|example_user_for_team_wins',
            'example@besthusbandever.com',
            'Example User',
            'premium',
            true,
            'EXAMPLE', -- Provide referral_code to bypass trigger
            NOW() - INTERVAL '30 days'
        )
        RETURNING id INTO example_user_id;
    END IF;

    -- Delete any existing posts from this user first (clean slate)
    DELETE FROM deep_thoughts WHERE user_id = example_user_id;

    -- Insert all 8 example posts
    INSERT INTO deep_thoughts (user_id, content, tip_category, created_at, is_removed) VALUES
        (
            example_user_id,
            'Did the "Listen Without Fixing" action today. She was stressed about work and I just... listened. No solutions, no "you should just..." - just listened. She thanked me after and said it was exactly what she needed. Sometimes the best thing I can do is nothing.',
            'Communication',
            NOW() - INTERVAL '5 days',
            false
        ),
        (
            example_user_id,
            'Took over the morning routine completely this week. Got the kids ready, made breakfast, handled everything. She got to sleep in and actually relax. The look on her face when she came downstairs was worth it. Small daily actions, big impact.',
            'Partnership',
            NOW() - INTERVAL '8 days',
            false
        ),
        (
            example_user_id,
            'Planned a surprise date night - her favorite restaurant, then a walk in the park where we had our first date. She had no idea. The smile on her face when she realized where we were going... this is why I do this. Making her feel special never gets old.',
            'Romance',
            NOW() - INTERVAL '12 days',
            false
        ),
        (
            example_user_id,
            'Expressed gratitude for something specific today - thanked her for always remembering the little things I like. She does so much that goes unnoticed. Taking a moment to actually see it and say it out loud made her day. And mine.',
            'Gratitude',
            NOW() - INTERVAL '15 days',
            false
        ),
        (
            example_user_id,
            'Cooked dinner together tonight. No phones, no distractions, just us in the kitchen. We laughed, talked about our day, and actually connected. It''s been too long since we had real quality time. This app is helping me remember what matters.',
            'Quality Time',
            NOW() - INTERVAL '18 days',
            false
        ),
        (
            example_user_id,
            'Had a disagreement today but used "I" statements instead of "you always..." Made all the difference. We actually heard each other instead of getting defensive. Resolved it in 10 minutes instead of it ruining the whole day. Game changer.',
            'Conflict Resolution',
            NOW() - INTERVAL '22 days',
            false
        ),
        (
            example_user_id,
            'Focused on her pleasure tonight. No pressure, no expectations, just making her feel amazing. The connection was incredible. When I focus on her, everything else falls into place. This is what intimacy should be.',
            'Intimacy',
            NOW() - INTERVAL '25 days',
            false
        ),
        (
            example_user_id,
            'Had a 20-minute conversation with no phones, no distractions. Talked about dreams, fears, what we want for our future. Felt like we were dating again. We''ve been so busy with life we forgot to actually talk. This was a reminder of why I fell in love with her.',
            'Reconnection',
            NOW() - INTERVAL '28 days',
            false
        );

    RAISE NOTICE 'Successfully created 8 example Team Wins posts for user ID: %', example_user_id;
END $$;

-- Verify posts were created (run this separately to check)
SELECT 
    COUNT(*) as total_posts,
    COUNT(CASE WHEN is_removed = false OR is_removed IS NULL THEN 1 END) as visible_posts
FROM deep_thoughts dt
JOIN users u ON dt.user_id = u.id
WHERE u.email = 'example@besthusbandever.com';

