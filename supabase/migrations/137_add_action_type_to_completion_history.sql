-- Update action_completion_history table for Option 1: Conservative & Steady scoring
-- 1. Add action_type column to distinguish daily vs weekly actions
-- 2. Change points_earned and base_points to DECIMAL to support fractional values (0.5, 1.0, 2.0, etc.)

-- Add action_type column
ALTER TABLE action_completion_history
ADD COLUMN IF NOT EXISTS action_type TEXT CHECK (action_type IN ('daily', 'weekly'));

-- Change points_earned from INTEGER to DECIMAL(3,1) to support fractional values
-- DECIMAL(3,1) allows values like 0.5, 1.0, 2.0, 3.0, etc.
DO $$
BEGIN
  -- Check if column exists and is INTEGER
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'action_completion_history' 
    AND column_name = 'points_earned' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE action_completion_history
    ALTER COLUMN points_earned TYPE DECIMAL(3,1) USING points_earned::DECIMAL(3,1);
  END IF;
END $$;

-- Change base_points from INTEGER to DECIMAL(3,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'action_completion_history' 
    AND column_name = 'base_points' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE action_completion_history
    ALTER COLUMN base_points TYPE DECIMAL(3,1) USING base_points::DECIMAL(3,1);
  END IF;
END $$;

-- Change penalty_applied from INTEGER to DECIMAL(3,1) (though it will be 0 in Option 1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'action_completion_history' 
    AND column_name = 'penalty_applied' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE action_completion_history
    ALTER COLUMN penalty_applied TYPE DECIMAL(3,1) USING penalty_applied::DECIMAL(3,1);
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_action_completion_history_action_type 
ON action_completion_history(action_type);

-- Update comments
COMMENT ON COLUMN action_completion_history.action_type IS 'Type of action: daily (routine) or weekly (planning_required). Used for Option 1 scoring algorithm.';
COMMENT ON COLUMN action_completion_history.points_earned IS 'Points actually earned (after caps). Option 1: 0.5 for daily, 2.0 for weekly.';
COMMENT ON COLUMN action_completion_history.base_points IS 'Base points before caps. Option 1: 0.5 for daily, 2.0 for weekly.';

