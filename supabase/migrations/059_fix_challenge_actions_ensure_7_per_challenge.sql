-- Fix challenge_actions to ensure all 7-day challenges have exactly 7 actions
-- This migration will:
-- 1. Remove existing challenge_actions that don't have valid actions
-- 2. Ensure each challenge has exactly 7 actions
-- 3. Use category as fallback if theme doesn't have enough actions

DO $$
DECLARE
  challenge_record RECORD;
  action_record RECORD;
  day_num INTEGER;
  action_count INTEGER;
  theme_name TEXT;
  category_name TEXT;
BEGIN
  -- Loop through all active 7-day challenges
  FOR challenge_record IN 
    SELECT id, theme, name FROM challenges 
    WHERE is_active = TRUE 
    AND (name LIKE '%7-Day%' OR name LIKE '%7 Day%')
  LOOP
    -- Get the theme and map to category
    theme_name := challenge_record.theme;
    
    -- Map theme to category for fallback
    CASE theme_name
      WHEN 'communication' THEN category_name := 'Communication';
      WHEN 'romance' THEN category_name := 'Romance';
      WHEN 'gratitude' THEN category_name := 'Gratitude';
      WHEN 'conflict_resolution' THEN category_name := 'Conflict Resolution';
      WHEN 'intimacy' THEN category_name := 'Intimacy';
      WHEN 'partnership' THEN category_name := 'Partnership';
      WHEN 'reconnection' THEN category_name := 'Reconnection';
      WHEN 'quality_time' THEN category_name := 'Quality Time';
      ELSE category_name := theme_name;
    END CASE;
    
    -- Count existing valid challenge_actions
    SELECT COUNT(*) INTO action_count
    FROM challenge_actions ca
    INNER JOIN actions a ON ca.action_id = a.id
    WHERE ca.challenge_id = challenge_record.id
    AND a.id IS NOT NULL;
    
    -- If we don't have 7 actions, fix it
    IF action_count < 7 THEN
      -- First, remove invalid challenge_actions (where action_id doesn't exist)
      DELETE FROM challenge_actions 
      WHERE challenge_id = challenge_record.id
      AND action_id NOT IN (SELECT id FROM actions);
      
      -- Remove all existing challenge_actions for this challenge to start fresh
      DELETE FROM challenge_actions WHERE challenge_id = challenge_record.id;
      
      -- Try to get 7 actions from the theme first (only eligible for 7-day events)
      day_num := 1;
      FOR action_record IN 
        SELECT id FROM actions 
        WHERE theme = theme_name 
        AND eligible_for_7day_events = TRUE
        ORDER BY display_order NULLS LAST, name 
        LIMIT 7
      LOOP
        INSERT INTO challenge_actions (challenge_id, action_id, day_number)
        VALUES (challenge_record.id, action_record.id, day_num)
        ON CONFLICT (challenge_id, day_number) DO UPDATE SET action_id = EXCLUDED.action_id;
        day_num := day_num + 1;
      END LOOP;
      
      -- If we still don't have 7, fill with actions from the category (only eligible for 7-day events)
      IF day_num <= 7 THEN
        FOR action_record IN 
          SELECT id FROM actions 
          WHERE category = category_name 
          AND theme != theme_name  -- Don't duplicate theme actions
          AND eligible_for_7day_events = TRUE
          AND id NOT IN (SELECT action_id FROM challenge_actions WHERE challenge_id = challenge_record.id)
          ORDER BY display_order NULLS LAST, name 
          LIMIT (7 - day_num + 1)
        LOOP
          INSERT INTO challenge_actions (challenge_id, action_id, day_number)
          VALUES (challenge_record.id, action_record.id, day_num)
          ON CONFLICT (challenge_id, day_number) DO UPDATE SET action_id = EXCLUDED.action_id;
          day_num := day_num + 1;
        END LOOP;
      END IF;
      
      -- If we still don't have 7, use any eligible actions from the category (including theme)
      IF day_num <= 7 THEN
        FOR action_record IN 
          SELECT id FROM actions 
          WHERE category = category_name 
          AND eligible_for_7day_events = TRUE
          AND id NOT IN (SELECT action_id FROM challenge_actions WHERE challenge_id = challenge_record.id)
          ORDER BY display_order NULLS LAST, name 
          LIMIT (7 - day_num + 1)
        LOOP
          INSERT INTO challenge_actions (challenge_id, action_id, day_number)
          VALUES (challenge_record.id, action_record.id, day_num)
          ON CONFLICT (challenge_id, day_number) DO UPDATE SET action_id = EXCLUDED.action_id;
          day_num := day_num + 1;
        END LOOP;
      END IF;
      
      -- Final check: if we still don't have 7, log a warning
      SELECT COUNT(*) INTO action_count
      FROM challenge_actions ca
      INNER JOIN actions a ON ca.action_id = a.id
      WHERE ca.challenge_id = challenge_record.id;
      
      IF action_count < 7 THEN
        RAISE NOTICE 'Warning: Challenge % (%) only has % actions. Need 7.', challenge_record.name, challenge_record.id, action_count;
      END IF;
    END IF;
  END LOOP;
END $$;

-- Verify all challenges have 7 actions
DO $$
DECLARE
  challenge_record RECORD;
  action_count INTEGER;
BEGIN
  FOR challenge_record IN 
    SELECT id, name FROM challenges 
    WHERE is_active = TRUE 
    AND (name LIKE '%7-Day%' OR name LIKE '%7 Day%')
  LOOP
    SELECT COUNT(*) INTO action_count
    FROM challenge_actions ca
    INNER JOIN actions a ON ca.action_id = a.id
    WHERE ca.challenge_id = challenge_record.id;
    
    IF action_count != 7 THEN
      RAISE NOTICE 'Challenge % (%) has % actions (expected 7)', challenge_record.name, challenge_record.id, action_count;
    END IF;
  END LOOP;
END $$;

