-- Check for duplicate challenges in the database
-- Run this in Supabase SQL Editor to see if there are actual duplicates

-- Check for duplicates by name
SELECT name, COUNT(*) as count
FROM challenges
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Check for duplicates by ID (should never happen, but checking)
SELECT id, COUNT(*) as count
FROM challenges
GROUP BY id
HAVING COUNT(*) > 1;

-- Show all challenges with their IDs to verify
SELECT id, name, category, theme
FROM challenges
ORDER BY name, id;

-- If duplicates are found, use REMOVE_DUPLICATE_CHALLENGES.sql to safely remove them
-- DO NOT use the simple DELETE below - it will break challenge completions!

