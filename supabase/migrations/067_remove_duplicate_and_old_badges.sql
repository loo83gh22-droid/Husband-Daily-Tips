-- Remove duplicate and old badges that have been replaced
-- Remove "First S" (old communication badge replaced by "Communication Starter")
-- Remove "Conflict Resolution Mast" at 20 actions (doesn't fit standard progression)

-- ============================================================================
-- STEP 1: Remove old "First S" communication badge
-- ============================================================================

DELETE FROM badges 
WHERE name LIKE 'First S%'
   OR (name ILIKE '%first%s%' AND category = 'Communication' AND requirement_type = 'category_count' AND requirement_value = 1);

-- ============================================================================
-- STEP 2: Remove "Conflict Resolution Mast" or any conflict resolution badges at 20 actions
-- ============================================================================

DELETE FROM badges 
WHERE (name ILIKE '%conflict%resolution%mast%' OR name ILIKE '%conflict%mast%')
   OR (category = 'Conflict Resolution' 
       AND requirement_type = 'category_count' 
       AND requirement_value = 20);

-- ============================================================================
-- STEP 3: Remove Intimacy badges that don't fit the standard progression
-- ============================================================================

-- First, remove ALL Intimacy category_count badges that don't match standard progression (1,5,10,25,50,100)
-- This removes the "Intimacy Champion" at 30 actions
DELETE FROM badges 
WHERE category = 'Intimacy' 
AND requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- Remove "Deep Connection Master" at 20 actions (doesn't fit standard progression)
DELETE FROM badges 
WHERE name = 'Deep Connection Master' AND category = 'Intimacy';

-- Remove the specific "Intimacy Expert" badge with "You're an intimacy expert" description (eyes icon)
-- Keep the one with "You're building real connection" description (heart icon)
DELETE FROM badges
WHERE name = 'Intimacy Expert'
AND category = 'Intimacy'
AND requirement_type = 'category_count'
AND requirement_value = 10
AND description LIKE '%You''re an intimacy expert%';

-- If there are still multiple "Intimacy Expert" badges at 10, keep only the oldest one
DELETE FROM badges
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY category, requirement_type, requirement_value 
      ORDER BY created_at ASC
    ) as rn
    FROM badges
    WHERE name = 'Intimacy Expert'
    AND category = 'Intimacy'
    AND requirement_type = 'category_count'
    AND requirement_value = 10
  ) t
  WHERE rn > 1
);

-- ============================================================================
-- STEP 4: Remove Partnership badges that don't fit the standard progression
-- ============================================================================

-- Remove "True Partner" at 10 actions (duplicate of "Partnership Expert")
-- Remove "Partnership Pro" at 20 actions (doesn't fit standard progression)
DELETE FROM badges 
WHERE (name = 'True Partner' AND category = 'Partnership' AND requirement_type = 'category_count' AND requirement_value = 10)
   OR (name = 'Partnership Pro' AND category = 'Partnership' AND requirement_type = 'category_count' AND requirement_value = 20);

-- ============================================================================
-- STEP 5: Remove any other badges that don't fit the standard progression (1,5,10,25,50,100)
-- ============================================================================

-- Remove any category_count badges with requirement_value = 20 or 30 (not in standard progression)
DELETE FROM badges 
WHERE requirement_type = 'category_count'
AND requirement_value IN (20, 30)
AND category IS NOT NULL;

-- ============================================================================
-- STEP 6: Update comment
-- ============================================================================

COMMENT ON TABLE badges IS 'All badge progressions follow consistent naming: 1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend. Only badges with requirement values of 1, 5, 10, 25, 50, or 100 are kept. Badges are awards and do NOT affect Husband Health score.';

