-- Script to grant premium access to a user
-- Usage: Replace 'user@example.com' with the actual user's email address
-- Run this in Supabase SQL Editor

-- Option 1: Grant premium access by email (recommended)
-- This will set subscription_tier to 'premium' without a Stripe subscription
-- (This is for lifetime/manual premium access)

UPDATE users
SET 
  subscription_tier = 'premium',
  updated_at = NOW()
WHERE email = 'user@example.com'; -- REPLACE WITH ACTUAL EMAIL

-- Verify the update
SELECT 
  id,
  email,
  name,
  subscription_tier,
  trial_started_at,
  trial_ends_at,
  stripe_subscription_id,
  created_at
FROM users
WHERE email = 'user@example.com'; -- REPLACE WITH ACTUAL EMAIL

-- Option 2: Grant premium access with a trial period (90 days from now)
-- Uncomment the lines below if you want to set a trial period

-- UPDATE users
-- SET 
--   subscription_tier = 'premium',
--   trial_started_at = NOW(),
--   trial_ends_at = NOW() + INTERVAL '90 days',
--   updated_at = NOW()
-- WHERE email = 'user@example.com'; -- REPLACE WITH ACTUAL EMAIL

-- Option 3: Grant premium access by Auth0 ID
-- Use this if you know the user's Auth0 ID instead of email

-- UPDATE users
-- SET 
--   subscription_tier = 'premium',
--   updated_at = NOW()
-- WHERE auth0_id = 'auth0|xxxxxxxxxxxxx'; -- REPLACE WITH ACTUAL AUTH0 ID

