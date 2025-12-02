-- Remove "Connection" category and move all actions to appropriate existing categories
-- The 8 standard categories are: Communication, Intimacy, Partnership, Romance, Gratitude, Conflict Resolution, Reconnection, Quality Time

-- ============================================================================
-- STEP 1: Update Good Friday actions from "Connection" to "Quality Time"
-- These actions are about planning quiet, reflective time together, which fits Quality Time
-- ============================================================================

UPDATE actions
SET category = 'Quality Time',
    theme = 'quality_time'
WHERE category = 'Connection'
  AND (name ILIKE '%Good Friday%' OR name ILIKE '%quiet%reflective%' OR name ILIKE '%meaningful%Good Friday%');

-- ============================================================================
-- STEP 2: Update any other "Connection" category actions to "Quality Time" as default
-- If there are other Connection actions, they likely fit Quality Time best
-- ============================================================================

UPDATE actions
SET category = 'Quality Time',
    theme = 'quality_time'
WHERE category = 'Connection';

-- ============================================================================
-- STEP 3: Verify no "Connection" category remains
-- ============================================================================

-- This query should return 0 rows after the migration
-- SELECT COUNT(*) FROM actions WHERE category = 'Connection';

