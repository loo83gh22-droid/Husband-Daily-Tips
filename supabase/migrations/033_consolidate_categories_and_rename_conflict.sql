-- Consolidate categories: Merge outdoor and active into quality_time
-- Rename conflict to conflict_resolution for more positive framing
-- Update display orders to reflect new 8-category structure

-- ============================================================================
-- CONSOLIDATE OUTDOOR AND ACTIVE INTO QUALITY_TIME
-- ============================================================================

-- Merge "outdoor" theme into "quality_time"
UPDATE actions 
SET theme = 'quality_time', 
    category = 'Quality Time',
    display_order = 8
WHERE theme = 'outdoor';

-- Merge "active" theme into "quality_time"
UPDATE actions 
SET theme = 'quality_time', 
    category = 'Quality Time',
    display_order = 8
WHERE theme = 'active';

-- ============================================================================
-- RENAME CONFLICT TO CONFLICT_RESOLUTION
-- ============================================================================

-- Update conflict theme to conflict_resolution
UPDATE actions 
SET theme = 'conflict_resolution', 
    category = 'Conflict Resolution',
    display_order = 6
WHERE theme = 'conflict';

-- Update any badges that reference conflict
UPDATE badges 
SET category = 'Conflict Resolution'
WHERE category = 'Conflict' OR category LIKE '%Conflict%';

-- ============================================================================
-- UPDATE DISPLAY ORDERS FOR NEW 8-CATEGORY STRUCTURE
-- ============================================================================

-- New order:
-- 1. Communication (most foundational)
-- 2. Intimacy (deepest connection)
-- 3. Partnership (working together)
-- 4. Romance (keeping spark alive)
-- 5. Gratitude (appreciation)
-- 6. Conflict Resolution (handling disagreements positively)
-- 7. Reconnection (addressing disconnection)
-- 8. Quality Time (spending time together - includes outdoor & active)

UPDATE actions SET display_order = 1 WHERE theme = 'communication';
UPDATE actions SET display_order = 2 WHERE theme = 'intimacy';
UPDATE actions SET display_order = 3 WHERE theme = 'partnership';
UPDATE actions SET display_order = 4 WHERE theme = 'romance';
UPDATE actions SET display_order = 5 WHERE theme = 'gratitude';
UPDATE actions SET display_order = 6 WHERE theme = 'conflict_resolution';
UPDATE actions SET display_order = 7 WHERE theme = 'reconnection';
UPDATE actions SET display_order = 8 WHERE theme = 'quality_time';

-- Set default order for any themes we might have missed
UPDATE actions SET display_order = 99 WHERE display_order IS NULL;

-- ============================================================================
-- UPDATE CHALLENGES TABLE IF IT EXISTS
-- ============================================================================

-- Update any existing challenges that reference old themes
UPDATE challenges 
SET theme = 'conflict_resolution'
WHERE theme = 'conflict';

-- Note: We'll create new challenges in a separate migration

