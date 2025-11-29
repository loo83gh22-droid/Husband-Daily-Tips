-- Remove duplicate Intimacy Expert badge with incorrect description
-- The standard Intimacy Expert badge should have description: "Completed 10 intimacy actions. You're an intimacy expert."
-- This removes the duplicate with "You're building real connection" description

-- Also remove the "Love Language Learner" badge entirely as requested

-- Step 1: Remove any user badges associated with badges we're deleting
-- Delete user badges for Intimacy Expert badges that don't have the correct description
DELETE FROM user_badges
WHERE badge_id IN (
  SELECT id FROM badges
  WHERE name = 'Intimacy Expert'
    AND category = 'Intimacy'
    AND requirement_type = 'category_count'
    AND requirement_value = 10
    AND description != 'Completed 10 intimacy actions. You''re an intimacy expert.'
);

-- Delete user badges for Love Language Learner
DELETE FROM user_badges
WHERE badge_id IN (
  SELECT id FROM badges WHERE name = 'Love Language Learner'
);

-- Step 2: Delete the badges themselves
-- Delete ALL Intimacy Expert badges that DON'T have the exact correct description
DELETE FROM badges
WHERE name = 'Intimacy Expert'
  AND category = 'Intimacy'
  AND requirement_type = 'category_count'
  AND requirement_value = 10
  AND description != 'Completed 10 intimacy actions. You''re an intimacy expert.';

-- Delete the Love Language Learner badge entirely
DELETE FROM badges WHERE name = 'Love Language Learner';

-- Note: The correct Intimacy Expert badge should remain:
-- Name: 'Intimacy Expert'
-- Description: 'Completed 10 intimacy actions. You're an intimacy expert.'
-- Category: 'Intimacy'
-- Requirement: category_count = 10
-- This follows the standard progression badge naming convention (1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend)

