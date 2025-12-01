-- Setup test data for waterloo1983 user to test birthday actions
-- This sets the spouse birthday to a date that will trigger birthday week actions

-- First, let's set a birthday that's coming up soon (7 days from now)
-- This will ensure the user is in the birthday week
-- Adjust the date as needed for testing

-- Example: If today is 2024-01-15, and we want to test birthday week:
-- Set birthday to 2024-01-22 (7 days from now, which is a Monday)
-- This means birthday week would start on 2024-01-15 (Monday of the week before)

-- For waterloo1983 user, we'll set a birthday that's in the near future
-- You can adjust this date based on when you want to test

-- Update waterloo1983 user with spouse birthday
-- Note: Replace 'waterloo1983' with the actual auth0_id or email if different
UPDATE users
SET spouse_birthday = (CURRENT_DATE + INTERVAL '7 days')::DATE
WHERE email LIKE '%waterloo1983%' OR auth0_id LIKE '%waterloo1983%';

-- If the user doesn't exist or you want to create test data, you can run:
-- INSERT INTO users (auth0_id, email, name, subscription_tier, spouse_birthday, work_days)
-- VALUES (
--   'auth0|waterloo1983',
--   'waterloo1983@example.com',
--   'Test User',
--   'premium',
--   (CURRENT_DATE + INTERVAL '7 days')::DATE,
--   ARRAY[1,2,3,4,5]::INTEGER[] -- Monday through Friday
-- )
-- ON CONFLICT (auth0_id) DO UPDATE
-- SET spouse_birthday = (CURRENT_DATE + INTERVAL '7 days')::DATE,
--     work_days = ARRAY[1,2,3,4,5]::INTEGER[];

-- Verify the update
SELECT 
  id,
  email,
  auth0_id,
  spouse_birthday,
  work_days,
  CURRENT_DATE as today,
  (spouse_birthday - CURRENT_DATE) as days_until_birthday
FROM users
WHERE email LIKE '%waterloo1983%' OR auth0_id LIKE '%waterloo1983%';

COMMENT ON TABLE users IS 'Users table includes spouse_birthday for birthday week action serving';

