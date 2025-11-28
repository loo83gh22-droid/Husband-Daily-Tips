-- Clean up existing challenge_actions that use ineligible actions
-- This migration should be run AFTER migration 078 (which adds the eligible_for_7day_events field)
-- and AFTER migration 059 (which ensures challenges have 7 actions)

-- Remove challenge_actions that reference ineligible actions
DELETE FROM challenge_actions
WHERE action_id IN (
  SELECT id FROM actions WHERE eligible_for_7day_events = FALSE
);

-- Now fix any challenges that have fewer than 7 actions after cleanup
-- This uses the same logic as migration 059 but only for challenges that need fixing
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
    -- Count existing valid challenge_actions
    SELECT COUNT(*) INTO action_count
    FROM challenge_actions ca
    INNER JOIN actions a ON ca.action_id = a.id
    WHERE ca.challenge_id = challenge_record.id
    AND a.eligible_for_7day_events = TRUE;
    
    -- If we don't have 7 eligible actions, fix it
    IF action_count < 7 THEN
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
      
      -- Get the current highest day_number
      SELECT COALESCE(MAX(day_number), 0) INTO day_num
      FROM challenge_actions
      WHERE challenge_id = challenge_record.id;
      day_num := day_num + 1;
      
      -- Try to get actions from the theme first (only eligible)
      FOR action_record IN 
        SELECT id FROM actions 
        WHERE theme = theme_name 
        AND eligible_for_7day_events = TRUE
        AND id NOT IN (SELECT action_id FROM challenge_actions WHERE challenge_id = challenge_record.id)
        ORDER BY display_order NULLS LAST, name 
        LIMIT (7 - action_count)
      LOOP
        INSERT INTO challenge_actions (challenge_id, action_id, day_number)
        VALUES (challenge_record.id, action_record.id, day_num)
        ON CONFLICT (challenge_id, day_number) DO UPDATE SET action_id = EXCLUDED.action_id;
        day_num := day_num + 1;
      END LOOP;
      
      -- Get updated count
      SELECT COUNT(*) INTO action_count
      FROM challenge_actions ca
      INNER JOIN actions a ON ca.action_id = a.id
      WHERE ca.challenge_id = challenge_record.id
      AND a.eligible_for_7day_events = TRUE;
      
      -- If we still don't have 7, fill with actions from the category (only eligible)
      IF action_count < 7 THEN
        FOR action_record IN 
          SELECT id FROM actions 
          WHERE category = category_name 
          AND theme != theme_name
          AND eligible_for_7day_events = TRUE
          AND id NOT IN (SELECT action_id FROM challenge_actions WHERE challenge_id = challenge_record.id)
          ORDER BY display_order NULLS LAST, name 
          LIMIT (7 - action_count)
        LOOP
          INSERT INTO challenge_actions (challenge_id, action_id, day_number)
          VALUES (challenge_record.id, action_record.id, day_num)
          ON CONFLICT (challenge_id, day_number) DO UPDATE SET action_id = EXCLUDED.action_id;
          day_num := day_num + 1;
        END LOOP;
      END IF;
      
      -- Get updated count again
      SELECT COUNT(*) INTO action_count
      FROM challenge_actions ca
      INNER JOIN actions a ON ca.action_id = a.id
      WHERE ca.challenge_id = challenge_record.id
      AND a.eligible_for_7day_events = TRUE;
      
      -- If we still don't have 7, use any eligible actions from the category (including theme)
      IF action_count < 7 THEN
        FOR action_record IN 
          SELECT id FROM actions 
          WHERE category = category_name 
          AND eligible_for_7day_events = TRUE
          AND id NOT IN (SELECT action_id FROM challenge_actions WHERE challenge_id = challenge_record.id)
          ORDER BY display_order NULLS LAST, name 
          LIMIT (7 - action_count)
        LOOP
          INSERT INTO challenge_actions (challenge_id, action_id, day_number)
          VALUES (challenge_record.id, action_record.id, day_num)
          ON CONFLICT (challenge_id, day_number) DO UPDATE SET action_id = EXCLUDED.action_id;
          day_num := day_num + 1;
        END LOOP;
      END IF;
      
      -- Final check
      SELECT COUNT(*) INTO action_count
      FROM challenge_actions ca
      INNER JOIN actions a ON ca.action_id = a.id
      WHERE ca.challenge_id = challenge_record.id
      AND a.eligible_for_7day_events = TRUE;
      
      IF action_count < 7 THEN
        RAISE NOTICE 'Warning: Challenge % (%) only has % eligible actions. Need 7.', challenge_record.name, challenge_record.id, action_count;
      END IF;
    END IF;
  END LOOP;
END $$;

