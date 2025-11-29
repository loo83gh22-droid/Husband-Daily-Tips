-- Remove duplicate Intimacy Expert badge with incorrect description
-- The standard Intimacy Expert badge should have description: "Completed 10 intimacy actions. You're an intimacy expert."
-- This removes the duplicate with "You're building real connection" description

-- Also remove the "Love Language Learner" badge entirely as requested

-- First, remove any user badges associated with the badges we're deleting
DELETE FROM user_badges
WHERE badge_id IN (
  SELECT id FROM badges
  WHERE (
    -- Intimacy Expert with "building real connection" description (catch any variation)
    (name = 'Intimacy Expert'
     AND category = 'Intimacy'
     AND requirement_type = 'category_count'
     AND requirement_value = 10
     AND (description LIKE '%building real connection%' 
          OR description LIKE '%You''re building real connection%'
          OR description LIKE '%building%connection%'))
    OR
    -- Love Language Learner badge
    name = 'Love Language Learner'
  )
);

-- Delete ALL Intimacy Expert badges with "building real connection" in description
-- Keep only the one with "You're an intimacy expert" description
DELETE FROM badges
WHERE name = 'Intimacy Expert'
AND category = 'Intimacy'
AND requirement_type = 'category_count'
AND requirement_value = 10
AND description NOT LIKE '%You''re an intimacy expert%'
AND (description LIKE '%building real connection%' 
     OR description LIKE '%You''re building real connection%'
     OR description LIKE '%building%connection%');

-- Delete the Love Language Learner badge entirely
DELETE FROM badges
WHERE name = 'Love Language Learner';

-- Note: The correct Intimacy Expert badge should remain:
-- Name: 'Intimacy Expert'
-- Description: 'Completed 10 intimacy actions. You're an intimacy expert.'
-- Category: 'Intimacy'
-- Requirement: category_count = 10
-- This follows the standard progression badge naming convention (1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend)

