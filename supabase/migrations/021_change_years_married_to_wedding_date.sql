-- Change years_married to wedding_date
-- This allows automatic calculation of years married from the wedding date

-- Add wedding_date column
ALTER TABLE users ADD COLUMN IF NOT EXISTS wedding_date DATE;

-- Migrate existing years_married data to wedding_date (approximate)
-- Only if the years_married column exists
-- We'll set wedding_date to be approximately years_married years ago from today
-- This is an approximation, but better than losing the data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'years_married'
  ) THEN
    UPDATE users
    SET wedding_date = CURRENT_DATE - INTERVAL '1 year' * COALESCE(years_married, 0)
    WHERE years_married IS NOT NULL AND wedding_date IS NULL;
    
    -- Drop the years_married column after migration
    ALTER TABLE users DROP COLUMN IF EXISTS years_married;
  END IF;
END $$;

