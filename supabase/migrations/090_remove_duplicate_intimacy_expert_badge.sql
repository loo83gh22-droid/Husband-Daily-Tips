-- Remove duplicate Intimacy Expert badge with incorrect description
-- The standard Intimacy Expert badge should have description: "Completed 10 intimacy actions. You're an intimacy expert."
-- This removes the duplicate with "You're building real connection" description

-- First, remove any user badges associated with the duplicate badge
DELETE FROM user_badges
WHERE badge_id IN (
  SELECT id FROM badges
  WHERE name = 'Intimacy Expert'
  AND category = 'Intimacy'
  AND requirement_type = 'category_count'
  AND requirement_value = 10
  AND (description LIKE '%building real connection%' OR description LIKE '%You''re building real connection%')
);

-- Then delete the duplicate Intimacy Expert badge with "building real connection" description
DELETE FROM badges
WHERE name = 'Intimacy Expert'
AND category = 'Intimacy'
AND requirement_type = 'category_count'
AND requirement_value = 10
AND (description LIKE '%building real connection%' OR description LIKE '%You''re building real connection%');

-- Note: The correct Intimacy Expert badge should remain:
-- Name: 'Intimacy Expert'
-- Description: 'Completed 10 intimacy actions. You're an intimacy expert.'
-- Category: 'Intimacy'
-- Requirement: category_count = 10
-- This follows the standard progression badge naming convention (1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend)

