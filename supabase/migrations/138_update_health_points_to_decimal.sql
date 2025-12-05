-- Update daily_health_points and weekly_health_points tables to support decimal values
-- for Option 1: Conservative & Steady scoring algorithm

-- Update daily_health_points.action_points to DECIMAL(3,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_health_points' 
    AND column_name = 'action_points' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE daily_health_points
    ALTER COLUMN action_points TYPE DECIMAL(3,1) USING action_points::DECIMAL(3,1);
  END IF;
END $$;

-- Update daily_health_points.total_points to DECIMAL(3,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_health_points' 
    AND column_name = 'total_points' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE daily_health_points
    ALTER COLUMN total_points TYPE DECIMAL(3,1) USING total_points::DECIMAL(3,1);
  END IF;
END $$;

-- Update daily_health_points.event_bonus to DECIMAL(3,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_health_points' 
    AND column_name = 'event_bonus' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE daily_health_points
    ALTER COLUMN event_bonus TYPE DECIMAL(3,1) USING event_bonus::DECIMAL(3,1);
  END IF;
END $$;

-- Update weekly_health_points.points_earned to DECIMAL(3,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'weekly_health_points' 
    AND column_name = 'points_earned' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE weekly_health_points
    ALTER COLUMN points_earned TYPE DECIMAL(3,1) USING points_earned::DECIMAL(3,1);
  END IF;
END $$;

-- Update health_decay_log.decay_applied to DECIMAL(3,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'health_decay_log' 
    AND column_name = 'decay_applied' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE health_decay_log
    ALTER COLUMN decay_applied TYPE DECIMAL(3,1) USING decay_applied::DECIMAL(3,1);
  END IF;
END $$;

-- Update event_completion_bonuses.bonus_points to DECIMAL(3,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'event_completion_bonuses' 
    AND column_name = 'bonus_points' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE event_completion_bonuses
    ALTER COLUMN bonus_points TYPE DECIMAL(3,1) USING bonus_points::DECIMAL(3,1);
  END IF;
END $$;

