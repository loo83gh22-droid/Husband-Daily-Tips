-- Upgrade your account to premium/paid tier for testing
-- Replace 'YOUR_EMAIL_HERE' with your actual email address
-- OR replace 'YOUR_AUTH0_ID_HERE' with your Auth0 user ID (found in your session)

-- Option 1: Update by email (easier)
UPDATE users 
SET subscription_tier = 'premium'
WHERE email = 'YOUR_EMAIL_HERE';

-- Option 2: Update by Auth0 ID (more precise)
-- UPDATE users 
-- SET subscription_tier = 'premium'
-- WHERE auth0_id = 'YOUR_AUTH0_ID_HERE';

-- Verify the update worked
SELECT id, email, subscription_tier, created_at 
FROM users 
WHERE email = 'YOUR_EMAIL_HERE' OR auth0_id = 'YOUR_AUTH0_ID_HERE';

