-- Reset all user challenges to not started (delete all active/incomplete challenges)
-- This will allow the user to start fresh

-- Option 1: Reset for ALL users (delete all incomplete challenges)
-- DELETE FROM user_challenges WHERE completed = false;

-- Option 2: Reset for a specific user by email (RECOMMENDED)
DELETE FROM user_challenges 
WHERE completed = false 
AND user_id IN (
  SELECT id FROM users WHERE email = 'waterloo1983hawk22@gmail.com'
);

-- Verify the reset (should return 0 rows for your user)
SELECT uc.*, u.email 
FROM user_challenges uc
JOIN users u ON uc.user_id = u.id
WHERE uc.completed = false AND u.email = 'waterloo1983hawk22@gmail.com';

