-- Add work_days column to users table
-- Stores which days of the week the user works (0=Sunday, 1=Monday, ..., 6=Saturday)
-- Stored as an array of integers: [1,2,3,4,5] means Monday-Friday
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_days INTEGER[];

-- Add comment explaining the field
COMMENT ON COLUMN users.work_days IS 'Array of days user works (0=Sunday, 1=Monday, ..., 6=Saturday). Used to serve planning_required actions on days off. NULL means not specified.';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_work_days ON users USING GIN(work_days);

