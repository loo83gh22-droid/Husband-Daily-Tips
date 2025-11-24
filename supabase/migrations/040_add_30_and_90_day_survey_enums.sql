-- Step 1: Add new enum values for 30-day and 90-day surveys
-- This must be run FIRST, before using the enum values

-- Add day_30_checkin enum value
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'day_30_checkin' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'follow_up_survey_type')
  ) THEN
    ALTER TYPE follow_up_survey_type ADD VALUE 'day_30_checkin';
  END IF;
END $$;

-- Add day_90_nps enum value
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'day_90_nps' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'follow_up_survey_type')
  ) THEN
    ALTER TYPE follow_up_survey_type ADD VALUE 'day_90_nps';
  END IF;
END $$;

