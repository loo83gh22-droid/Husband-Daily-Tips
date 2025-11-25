-- Add country support for users and country-specific holiday actions

-- Step 1: Add country field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT CHECK (country IN ('US', 'CA', NULL));

-- Add comment
COMMENT ON COLUMN users.country IS 'User country code (US = United States, CA = Canada). Used to serve country-specific holiday actions.';

-- Step 2: Add country field to actions table for country-specific actions
ALTER TABLE actions ADD COLUMN IF NOT EXISTS country TEXT CHECK (country IN ('US', 'CA', NULL));

-- Add comment
COMMENT ON COLUMN actions.country IS 'Country code for country-specific actions (US = United States, CA = Canada). NULL means action is available in all countries.';

-- Create index for efficient country-based queries
CREATE INDEX IF NOT EXISTS idx_actions_country ON actions(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country) WHERE country IS NOT NULL;

