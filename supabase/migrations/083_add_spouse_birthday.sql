-- Add spouse_birthday column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS spouse_birthday DATE;

-- Add comment explaining the field
COMMENT ON COLUMN users.spouse_birthday IS 'Spouse/partner birthday for personalized reminders and special date actions';

