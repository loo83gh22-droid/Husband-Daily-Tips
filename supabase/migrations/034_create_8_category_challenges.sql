-- Create 8 challenges (one per category)
-- Each challenge has 7 actions, one for each day
-- Challenges are always available (no start/end date restrictions)

-- ============================================================================
-- CREATE 8 CATEGORY CHALLENGES
-- ============================================================================

-- Challenge 1: Communication
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Communication Challenge', 
 '7 days. 7 chances to stop talking AT her and start talking WITH her. Real conversations, not surface-level stuff. The guy who listens? That''s the guy who wins. Let''s upgrade your conversation game.',
 'communication', 
 CURRENT_DATE, -- Always available
 CURRENT_DATE + INTERVAL '365 days', -- Available for a year
 TRUE)
ON CONFLICT DO NOTHING;

-- Challenge 2: Intimacy
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Intimacy Challenge', 
 'Rebuild the connection that got you here in the first place. 7 days of actions that bring you closer—emotionally and physically. Intimacy isn''t just about the bedroom. It''s about being truly seen and understood.',
 'intimacy', 
 CURRENT_DATE,
 CURRENT_DATE + INTERVAL '365 days',
 TRUE)
ON CONFLICT DO NOTHING;

-- Challenge 3: Partnership
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Partnership Challenge', 
 'Be a true partner, not just a roommate. 7 days of actions that show you''re in this together. From household stuff to big decisions, let''s make sure you''re actually partnering, not just co-existing.',
 'partnership', 
 CURRENT_DATE,
 CURRENT_DATE + INTERVAL '365 days',
 TRUE)
ON CONFLICT DO NOTHING;

-- Challenge 4: Romance
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Romance Challenge', 
 'Remember when you used to actually try? Yeah, her too. 7 days of small moves that make big impressions. Romance isn''t dead—it just needs a daily dose of intentional action. Let''s bring the spark back, one gesture at a time.',
 'romance', 
 CURRENT_DATE,
 CURRENT_DATE + INTERVAL '365 days',
 TRUE)
ON CONFLICT DO NOTHING;

-- Challenge 5: Gratitude
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Gratitude Challenge', 
 'Appreciate what you have. Recognize what she does. 7 days of actions that show you notice and you care. Gratitude isn''t just saying thanks—it''s showing you see her. Let''s make appreciation a daily habit.',
 'gratitude', 
 CURRENT_DATE,
 CURRENT_DATE + INTERVAL '365 days',
 TRUE)
ON CONFLICT DO NOTHING;

-- Challenge 6: Conflict Resolution
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Conflict Resolution Challenge', 
 'Handle disagreements like partners, not opponents. 7 days of actions that turn arguments into understanding. Conflict happens. How you handle it? That''s what separates roommates from partners.',
 'conflict_resolution', 
 CURRENT_DATE,
 CURRENT_DATE + INTERVAL '365 days',
 TRUE)
ON CONFLICT DO NOTHING;

-- Challenge 7: Reconnection
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Reconnection Challenge', 
 'Newsflash: You''re not roommates. You''re partners. But somewhere along the way, that got blurry. 7 days to rediscover what you two actually are. Daily actions to move from "Hey, did you pay the electric bill?" back to "Hey, I actually missed you today."',
 'reconnection', 
 CURRENT_DATE,
 CURRENT_DATE + INTERVAL '365 days',
 TRUE)
ON CONFLICT DO NOTHING;

-- Challenge 8: Quality Time
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Quality Time Challenge', 
 'Spend meaningful time together—indoors or outdoors, active or chill. 7 days of actions that prioritize "us" time. Quality time isn''t about what you do, it''s about being present. Let''s make time together actually count.',
 'quality_time', 
 CURRENT_DATE,
 CURRENT_DATE + INTERVAL '365 days',
 TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LINK ACTIONS TO CHALLENGES
-- ============================================================================

-- We'll use a DO block to get challenge IDs and link actions
DO $$
DECLARE
  comm_challenge_id UUID;
  intimacy_challenge_id UUID;
  partnership_challenge_id UUID;
  romance_challenge_id UUID;
  gratitude_challenge_id UUID;
  conflict_challenge_id UUID;
  reconnection_challenge_id UUID;
  quality_time_challenge_id UUID;
  action_record RECORD;
  day_num INTEGER;
BEGIN
  -- Get challenge IDs
  SELECT id INTO comm_challenge_id FROM challenges WHERE theme = 'communication' AND name LIKE '%Communication Challenge%' LIMIT 1;
  SELECT id INTO intimacy_challenge_id FROM challenges WHERE theme = 'intimacy' AND name LIKE '%Intimacy Challenge%' LIMIT 1;
  SELECT id INTO partnership_challenge_id FROM challenges WHERE theme = 'partnership' AND name LIKE '%Partnership Challenge%' LIMIT 1;
  SELECT id INTO romance_challenge_id FROM challenges WHERE theme = 'romance' AND name LIKE '%Romance Challenge%' LIMIT 1;
  SELECT id INTO gratitude_challenge_id FROM challenges WHERE theme = 'gratitude' AND name LIKE '%Gratitude Challenge%' LIMIT 1;
  SELECT id INTO conflict_challenge_id FROM challenges WHERE theme = 'conflict_resolution' AND name LIKE '%Conflict Resolution Challenge%' LIMIT 1;
  SELECT id INTO reconnection_challenge_id FROM challenges WHERE theme = 'reconnection' AND name LIKE '%Reconnection Challenge%' LIMIT 1;
  SELECT id INTO quality_time_challenge_id FROM challenges WHERE theme = 'quality_time' AND name LIKE '%Quality Time Challenge%' LIMIT 1;

  -- Only proceed if we have challenge IDs
  IF comm_challenge_id IS NOT NULL THEN
    -- Communication Challenge - Get 7 actions, ordered by display_order
    day_num := 1;
    FOR action_record IN 
      SELECT id FROM actions 
      WHERE theme = 'communication' 
      ORDER BY display_order NULLS LAST, name 
      LIMIT 7
    LOOP
      INSERT INTO challenge_actions (challenge_id, action_id, day_number)
      VALUES (comm_challenge_id, action_record.id, day_num)
      ON CONFLICT DO NOTHING;
      day_num := day_num + 1;
    END LOOP;
  END IF;

  IF intimacy_challenge_id IS NOT NULL THEN
    -- Intimacy Challenge
    day_num := 1;
    FOR action_record IN 
      SELECT id FROM actions 
      WHERE theme = 'intimacy' 
      ORDER BY display_order NULLS LAST, name 
      LIMIT 7
    LOOP
      INSERT INTO challenge_actions (challenge_id, action_id, day_number)
      VALUES (intimacy_challenge_id, action_record.id, day_num)
      ON CONFLICT DO NOTHING;
      day_num := day_num + 1;
    END LOOP;
  END IF;

  IF partnership_challenge_id IS NOT NULL THEN
    -- Partnership Challenge
    day_num := 1;
    FOR action_record IN 
      SELECT id FROM actions 
      WHERE theme = 'partnership' 
      ORDER BY display_order NULLS LAST, name 
      LIMIT 7
    LOOP
      INSERT INTO challenge_actions (challenge_id, action_id, day_number)
      VALUES (partnership_challenge_id, action_record.id, day_num)
      ON CONFLICT DO NOTHING;
      day_num := day_num + 1;
    END LOOP;
  END IF;

  IF romance_challenge_id IS NOT NULL THEN
    -- Romance Challenge
    day_num := 1;
    FOR action_record IN 
      SELECT id FROM actions 
      WHERE theme = 'romance' 
      ORDER BY display_order NULLS LAST, name 
      LIMIT 7
    LOOP
      INSERT INTO challenge_actions (challenge_id, action_id, day_number)
      VALUES (romance_challenge_id, action_record.id, day_num)
      ON CONFLICT DO NOTHING;
      day_num := day_num + 1;
    END LOOP;
  END IF;

  IF gratitude_challenge_id IS NOT NULL THEN
    -- Gratitude Challenge
    day_num := 1;
    FOR action_record IN 
      SELECT id FROM actions 
      WHERE theme = 'gratitude' 
      ORDER BY display_order NULLS LAST, name 
      LIMIT 7
    LOOP
      INSERT INTO challenge_actions (challenge_id, action_id, day_number)
      VALUES (gratitude_challenge_id, action_record.id, day_num)
      ON CONFLICT DO NOTHING;
      day_num := day_num + 1;
    END LOOP;
  END IF;

  IF conflict_challenge_id IS NOT NULL THEN
    -- Conflict Resolution Challenge
    day_num := 1;
    FOR action_record IN 
      SELECT id FROM actions 
      WHERE theme = 'conflict_resolution' 
      ORDER BY display_order NULLS LAST, name 
      LIMIT 7
    LOOP
      INSERT INTO challenge_actions (challenge_id, action_id, day_number)
      VALUES (conflict_challenge_id, action_record.id, day_num)
      ON CONFLICT DO NOTHING;
      day_num := day_num + 1;
    END LOOP;
  END IF;

  IF reconnection_challenge_id IS NOT NULL THEN
    -- Reconnection Challenge
    day_num := 1;
    FOR action_record IN 
      SELECT id FROM actions 
      WHERE theme = 'reconnection' 
      ORDER BY display_order NULLS LAST, name 
      LIMIT 7
    LOOP
      INSERT INTO challenge_actions (challenge_id, action_id, day_number)
      VALUES (reconnection_challenge_id, action_record.id, day_num)
      ON CONFLICT DO NOTHING;
      day_num := day_num + 1;
    END LOOP;
  END IF;

  IF quality_time_challenge_id IS NOT NULL THEN
    -- Quality Time Challenge
    day_num := 1;
    FOR action_record IN 
      SELECT id FROM actions 
      WHERE theme = 'quality_time' 
      ORDER BY display_order NULLS LAST, name 
      LIMIT 7
    LOOP
      INSERT INTO challenge_actions (challenge_id, action_id, day_number)
      VALUES (quality_time_challenge_id, action_record.id, day_num)
      ON CONFLICT DO NOTHING;
      day_num := day_num + 1;
    END LOOP;
  END IF;

END $$;

