-- Check if user keepitgreen@live.ca exists in Supabase
-- Run this in Supabase SQL Editor

SELECT 
  id,
  auth0_id,
  email,
  name,
  subscription_tier,
  created_at,
  updated_at
FROM users
WHERE email = 'keepitgreen@live.ca'
   OR email ILIKE '%keepitgreen%'
   OR auth0_id ILIKE '%keepitgreen%';

-- Also check all recent users to see what auth0_id format they have
SELECT 
  email,
  auth0_id,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

