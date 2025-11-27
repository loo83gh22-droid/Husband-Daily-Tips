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

-- Remove duplicate "Intimacy Expert" badges (keep only one at 10 actions)
-- Remove "Deep Connection Master" at 20 actions (doesn't fit standard progression)
-- Remove "Intimacy Champion" at 30 actions (doesn't fit standard progression)
DELETE FROM badges 
WHERE (name = 'Deep Connection Master' AND category = 'Intimacy')
   OR (name = 'Intimacy Champion' AND category = 'Intimacy' AND requirement_type = 'category_count' AND requirement_value = 30)
   OR (name = 'Intimacy Expert' AND category = 'Intimacy' AND requirement_type = 'category_count' AND requirement_value = 10 AND description LIKE '%building real connection%');

-- ============================================================================
-- STEP 4: Remove any other badges that don't fit the standard progression (1,5,10,25,50,100)
-- ============================================================================

-- Remove any category_count badges with requirement_value = 20 or 30 (not in standard progression)
DELETE FROM badges 
WHERE requirement_type = 'category_count'
AND requirement_value IN (20, 30)
AND category IS NOT NULL;

-- ============================================================================
-- STEP 4: Update comment
-- ============================================================================

COMMENT ON TABLE badges IS 'All badge progressions follow consistent naming: 1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend. Only badges with requirement values of 1, 5, 10, 25, 50, or 100 are kept. Badges are awards and do NOT affect Husband Health score.';

