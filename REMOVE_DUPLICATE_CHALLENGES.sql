-- Remove duplicate challenges from the database
-- This script will:
-- 1. Find duplicate challenges (by name)
-- 2. Keep the oldest one (earliest created_at)
-- 3. Update any challenge completions to point to the kept challenge
-- 4. Delete the duplicate challenges

-- Step 1: See what duplicates we have
SELECT name, COUNT(*) as count, 
       STRING_AGG(id::text, ', ' ORDER BY created_at) as challenge_ids,
       STRING_AGG(created_at::text, ', ' ORDER BY created_at) as created_dates
FROM challenges
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Step 2: Create a temporary table with the challenges to keep (oldest of each duplicate)
CREATE TEMP TABLE challenges_to_keep AS
SELECT DISTINCT ON (name) id, name
FROM challenges
ORDER BY name, created_at ASC;

-- Step 3: Update user_challenge_completions to point to the kept challenge
-- For each duplicate, update completions to use the kept challenge ID
UPDATE user_challenge_completions ucc
SET challenge_id = ctk.id
FROM challenges_to_keep ctk
WHERE ucc.challenge_id IN (
  SELECT c.id 
  FROM challenges c
  WHERE c.name = ctk.name
  AND c.id != ctk.id  -- Not the one we're keeping
);

-- Step 4: Delete the duplicate challenges (keep only the oldest of each name)
DELETE FROM challenges
WHERE id NOT IN (SELECT id FROM challenges_to_keep);

-- Step 5: Verify the cleanup
SELECT COUNT(*) as total_challenges FROM challenges;
-- Should be 30

-- Step 6: Verify no orphaned completions
SELECT COUNT(*) as orphaned_completions
FROM user_challenge_completions ucc
WHERE NOT EXISTS (
  SELECT 1 FROM challenges c WHERE c.id = ucc.challenge_id
);
-- Should be 0

-- Clean up temp table
DROP TABLE IF EXISTS challenges_to_keep;

