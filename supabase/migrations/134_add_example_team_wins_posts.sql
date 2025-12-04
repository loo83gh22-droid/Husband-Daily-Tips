-- Add example anonymous posts to Team Wins for new users to see
-- These posts demonstrate what Team Wins is about and provide social proof

-- First, create a system/example user for these posts (if it doesn't exist)
-- This user will have post_anonymously = true so posts show as "Anonymous"
DO $$
DECLARE
    example_user_id UUID;
BEGIN
    -- Check if example user already exists
    SELECT id INTO example_user_id
    FROM users
    WHERE email = 'example@besthusbandever.com'
    LIMIT 1;

    -- If it doesn't exist, create it
    IF example_user_id IS NULL THEN
        INSERT INTO users (auth0_id, email, name, subscription_tier, post_anonymously, referral_code, created_at)
        VALUES (
            'auth0|example_user_for_team_wins',
            'example@besthusbandever.com',
            'Example User',
            'premium',
            true, -- Posts will show as Anonymous
            'EXAMPLE', -- Provide referral_code to bypass trigger
            NOW() - INTERVAL '30 days' -- Created 30 days ago to look realistic
        )
        RETURNING id INTO example_user_id;
        
        RAISE NOTICE 'Created example user with ID: %', example_user_id;
    ELSE
        RAISE NOTICE 'Example user already exists with ID: %', example_user_id;
    END IF;

    -- Now insert example posts (only if they don't already exist)
    -- These posts are diverse and show different types of wins
    
    -- Post 1: Communication win
    INSERT INTO deep_thoughts (user_id, content, tip_category, created_at, is_removed)
    SELECT 
        example_user_id,
        'Did the "Listen Without Fixing" action today. She was stressed about work and I just... listened. No solutions, no "you should just..." - just listened. She thanked me after and said it was exactly what she needed. Sometimes the best thing I can do is nothing.',
        'Communication',
        NOW() - INTERVAL '5 days',
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM deep_thoughts 
        WHERE user_id = example_user_id 
        AND content LIKE '%Listen Without Fixing%'
    );

    -- Post 2: Partnership win
    INSERT INTO deep_thoughts (user_id, content, tip_category, created_at, is_removed)
    SELECT 
        example_user_id,
        'Took over the morning routine completely this week. Got the kids ready, made breakfast, handled everything. She got to sleep in and actually relax. The look on her face when she came downstairs was worth it. Small daily actions, big impact.',
        'Partnership',
        NOW() - INTERVAL '8 days',
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM deep_thoughts 
        WHERE user_id = example_user_id 
        AND content LIKE '%morning routine%'
    );

    -- Post 3: Romance win
    INSERT INTO deep_thoughts (user_id, content, tip_category, created_at, is_removed)
    SELECT 
        example_user_id,
        'Planned a surprise date night - her favorite restaurant, then a walk in the park where we had our first date. She had no idea. The smile on her face when she realized where we were going... this is why I do this. Making her feel special never gets old.',
        'Romance',
        NOW() - INTERVAL '12 days',
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM deep_thoughts 
        WHERE user_id = example_user_id 
        AND content LIKE '%surprise date night%'
    );

    -- Post 4: Gratitude win
    INSERT INTO deep_thoughts (user_id, content, tip_category, created_at, is_removed)
    SELECT 
        example_user_id,
        'Expressed gratitude for something specific today - thanked her for always remembering the little things I like. She does so much that goes unnoticed. Taking a moment to actually see it and say it out loud made her day. And mine.',
        'Gratitude',
        NOW() - INTERVAL '15 days',
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM deep_thoughts 
        WHERE user_id = example_user_id 
        AND content LIKE '%gratitude for something specific%'
    );

    -- Post 5: Quality Time win
    INSERT INTO deep_thoughts (user_id, content, tip_category, created_at, is_removed)
    SELECT 
        example_user_id,
        'Cooked dinner together tonight. No phones, no distractions, just us in the kitchen. We laughed, talked about our day, and actually connected. It''s been too long since we had real quality time. This app is helping me remember what matters.',
        'Quality Time',
        NOW() - INTERVAL '18 days',
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM deep_thoughts 
        WHERE user_id = example_user_id 
        AND content LIKE '%Cooked dinner together%'
    );

    -- Post 6: Conflict Resolution win
    INSERT INTO deep_thoughts (user_id, content, tip_category, created_at, is_removed)
    SELECT 
        example_user_id,
        'Had a disagreement today but used "I" statements instead of "you always..." Made all the difference. We actually heard each other instead of getting defensive. Resolved it in 10 minutes instead of it ruining the whole day. Game changer.',
        'Conflict Resolution',
        NOW() - INTERVAL '22 days',
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM deep_thoughts 
        WHERE user_id = example_user_id 
        AND content LIKE '%I statements%'
    );

    -- Post 7: Intimacy win
    INSERT INTO deep_thoughts (user_id, content, tip_category, created_at, is_removed)
    SELECT 
        example_user_id,
        'Focused on her pleasure tonight. No pressure, no expectations, just making her feel amazing. The connection was incredible. When I focus on her, everything else falls into place. This is what intimacy should be.',
        'Intimacy',
        NOW() - INTERVAL '25 days',
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM deep_thoughts 
        WHERE user_id = example_user_id 
        AND content LIKE '%Focused on her pleasure%'
    );

    -- Post 8: Reconnection win
    INSERT INTO deep_thoughts (user_id, content, tip_category, created_at, is_removed)
    SELECT 
        example_user_id,
        'Had a 20-minute conversation with no phones, no distractions. Talked about dreams, fears, what we want for our future. Felt like we were dating again. We''ve been so busy with life we forgot to actually talk. This was a reminder of why I fell in love with her.',
        'Reconnection',
        NOW() - INTERVAL '28 days',
        false
    WHERE NOT EXISTS (
        SELECT 1 FROM deep_thoughts 
        WHERE user_id = example_user_id 
        AND content LIKE '%20-minute conversation%'
    );

    RAISE NOTICE 'Example Team Wins posts created successfully';
END $$;

COMMENT ON TABLE deep_thoughts IS 'Team Wins posts - shared reflections from users. Example posts are created by system user to help new users understand the feature.';

