-- Move Quality Time-related badges out of Consistency and into the Quality Time category
-- This ensures they appear under the Quality Time section on the Badges page

UPDATE badges
SET category = 'Quality Time'
WHERE name IN (
  'Quality Time Starter',
  'Quality Time Builder',
  'Quality Time Expert',
  'Quality Time Master',
  'Quality Time Champion',
  'Quality Time Legend',
  '7-Day Quality Time Champion',
  'Camping Couple'
);

-- Note:
-- We intentionally leave badge_type as-is (most are consistency-type progression badges).
-- The badges page groups these under "Quality Time" based on the category/name,
-- and our Consistency section now only picks up badges that are not already categorized.


