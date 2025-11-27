-- Standardize badge naming convention across all categories
-- Progression: 1=Starter, 5=Builder, 10=Expert, 25=Champion, 50=Master, 100=Legend

-- ============================================================================
-- STEP 1: Update Communication Badges
-- ============================================================================

UPDATE badges 
SET name = 'Communication Expert',
    description = 'Completed 10 communication actions. You''re a communication expert.'
WHERE category = 'Communication' 
AND requirement_type = 'category_count' 
AND requirement_value = 10;

UPDATE badges 
SET name = 'Communication Champion',
    description = 'Completed 25 communication actions. You''re a communication champion.'
WHERE category = 'Communication' 
AND requirement_type = 'category_count' 
AND requirement_value = 25;

UPDATE badges 
SET name = 'Communication Master',
    description = 'Completed 50 communication actions. You''re a communication master.'
WHERE category = 'Communication' 
AND requirement_type = 'category_count' 
AND requirement_value = 50;

-- ============================================================================
-- STEP 2: Update Intimacy Badges
-- ============================================================================

UPDATE badges 
SET name = 'Intimacy Expert',
    description = 'Completed 10 intimacy actions. You''re an intimacy expert.'
WHERE category = 'Intimacy' 
AND requirement_type = 'category_count' 
AND requirement_value = 10;

UPDATE badges 
SET name = 'Intimacy Champion',
    description = 'Completed 25 intimacy actions. You''re an intimacy champion.'
WHERE category = 'Intimacy' 
AND requirement_type = 'category_count' 
AND requirement_value = 25;

UPDATE badges 
SET name = 'Intimacy Master',
    description = 'Completed 50 intimacy actions. You''re an intimacy master.'
WHERE category = 'Intimacy' 
AND requirement_type = 'category_count' 
AND requirement_value = 50;

-- ============================================================================
-- STEP 3: Update Partnership Badges
-- ============================================================================

UPDATE badges 
SET name = 'Partnership Expert',
    description = 'Completed 10 partnership actions. You''re a partnership expert.'
WHERE category = 'Partnership' 
AND requirement_type = 'category_count' 
AND requirement_value = 10;

UPDATE badges 
SET name = 'Partnership Champion',
    description = 'Completed 25 partnership actions. You''re a partnership champion.'
WHERE category = 'Partnership' 
AND requirement_type = 'category_count' 
AND requirement_value = 25;

UPDATE badges 
SET name = 'Partnership Master',
    description = 'Completed 50 partnership actions. You''re a partnership master.'
WHERE category = 'Partnership' 
AND requirement_type = 'category_count' 
AND requirement_value = 50;

-- ============================================================================
-- STEP 4: Update Conflict Resolution Badges
-- ============================================================================

UPDATE badges 
SET name = 'Conflict Resolution Expert',
    description = 'Completed 10 conflict resolution actions. You''re a conflict resolution expert.'
WHERE category = 'Conflict Resolution' 
AND requirement_type = 'category_count' 
AND requirement_value = 10;

UPDATE badges 
SET name = 'Conflict Resolution Champion',
    description = 'Completed 25 conflict resolution actions. You''re a conflict resolution champion.'
WHERE category = 'Conflict Resolution' 
AND requirement_type = 'category_count' 
AND requirement_value = 25;

UPDATE badges 
SET name = 'Conflict Resolution Master',
    description = 'Completed 50 conflict resolution actions. You''re a conflict resolution master.'
WHERE category = 'Conflict Resolution' 
AND requirement_type = 'category_count' 
AND requirement_value = 50;

-- ============================================================================
-- STEP 5: Update Reconnection Badges
-- ============================================================================

UPDATE badges 
SET name = 'Reconnection Expert',
    description = 'Completed 10 reconnection actions. You''re a reconnection expert.'
WHERE category = 'Reconnection' 
AND requirement_type = 'category_count' 
AND requirement_value = 10;

UPDATE badges 
SET name = 'Reconnection Champion',
    description = 'Completed 25 reconnection actions. You''re a reconnection champion.'
WHERE category = 'Reconnection' 
AND requirement_type = 'category_count' 
AND requirement_value = 25;

UPDATE badges 
SET name = 'Reconnection Master',
    description = 'Completed 50 reconnection actions. You''re a reconnection master.'
WHERE category = 'Reconnection' 
AND requirement_type = 'category_count' 
AND requirement_value = 50;

-- ============================================================================
-- STEP 6: Update Quality Time Badges
-- ============================================================================

UPDATE badges 
SET name = 'Quality Time Expert',
    description = 'Completed 10 quality time actions. You''re a quality time expert.'
WHERE category = 'Quality Time' 
AND requirement_type = 'category_count' 
AND requirement_value = 10;

UPDATE badges 
SET name = 'Quality Time Champion',
    description = 'Completed 25 quality time actions. You''re a quality time champion.'
WHERE category = 'Quality Time' 
AND requirement_type = 'category_count' 
AND requirement_value = 25;

UPDATE badges 
SET name = 'Quality Time Master',
    description = 'Completed 50 quality time actions. You''re a quality time master.'
WHERE category = 'Quality Time' 
AND requirement_type = 'category_count' 
AND requirement_value = 50;

-- ============================================================================
-- STEP 7: Update Gratitude Badges (update by requirement_value, not name)
-- ============================================================================

UPDATE badges 
SET name = 'Gratitude Expert',
    description = 'Completed 10 gratitude actions. You''re a gratitude expert.'
WHERE requirement_type = 'gratitude_actions' 
AND requirement_value = 10;

UPDATE badges 
SET name = 'Gratitude Champion',
    description = 'Completed 25 gratitude actions. You''re a gratitude champion.'
WHERE requirement_type = 'gratitude_actions' 
AND requirement_value = 25;

UPDATE badges 
SET name = 'Gratitude Master',
    description = 'Completed 50 gratitude actions. You''re a gratitude master.'
WHERE requirement_type = 'gratitude_actions' 
AND requirement_value = 50;

-- ============================================================================
-- STEP 8: Update Date Night Badges to follow naming convention
-- ============================================================================

UPDATE badges 
SET name = 'Date Night Builder',
    description = 'Planned 5 date nights. You''re making time together a priority.'
WHERE requirement_type = 'date_nights' 
AND requirement_value = 5;

UPDATE badges 
SET name = 'Date Night Champion',
    description = 'Planned 25 date nights. You''re a date night champion.'
WHERE requirement_type = 'date_nights' 
AND requirement_value = 25;

-- ============================================================================
-- STEP 9: Update comment documenting standardized naming
-- ============================================================================

COMMENT ON TABLE badges IS 'All badge progressions follow consistent naming: 1=Starter, 5=Builder, 10=Expert, 25=Champion, 50=Master, 100=Legend. This applies to all category_count badges and gratitude_actions badges. Badges are awards and do NOT affect Husband Health score.';

