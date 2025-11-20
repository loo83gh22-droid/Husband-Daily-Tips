-- Reorder action categories by importance for marriage
-- Combine outdoor and adventure themes into one "outdoor" theme
-- This migration consolidates similar categories and prepares for proper ordering

-- ============================================================================
-- COMBINE OUTDOOR AND ADVENTURE THEMES
-- ============================================================================

-- Update all "adventure" theme actions to "outdoor" theme
-- Also update category from "Adventure" to "Outdoor Activities"
UPDATE actions 
SET theme = 'outdoor', 
    category = 'Outdoor Activities'
WHERE theme = 'adventure' OR category = 'Adventure';

-- Update any badges that reference adventure_actions to outdoor_actions
-- Note: We'll keep the requirement_type as is for now to preserve badge logic
-- But we can update the category display name

-- ============================================================================
-- ADD DISPLAY ORDER TO ACTIONS TABLE (for future use)
-- ============================================================================

-- Add a display_order column if it doesn't exist
ALTER TABLE actions ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Set display order based on theme importance for marriage:
-- 1. Communication (most foundational)
-- 2. Intimacy (deepest connection)
-- 3. Partnership (working together)
-- 4. Romance (keeping spark alive)
-- 5. Gratitude (appreciation)
-- 6. Conflict (handling disagreements)
-- 7. Reconnection (addressing disconnection)
-- 8. Quality Time (spending time together)
-- 9. Outdoor (combined outdoor + adventure)
-- 10. Active Together (fitness/activity)

UPDATE actions SET display_order = 1 WHERE theme = 'communication';
UPDATE actions SET display_order = 2 WHERE theme = 'intimacy';
UPDATE actions SET display_order = 3 WHERE theme = 'partnership';
UPDATE actions SET display_order = 4 WHERE theme = 'romance';
UPDATE actions SET display_order = 5 WHERE theme = 'gratitude';
UPDATE actions SET display_order = 6 WHERE theme = 'conflict';
UPDATE actions SET display_order = 7 WHERE theme = 'reconnection';
UPDATE actions SET display_order = 8 WHERE theme = 'quality_time';
UPDATE actions SET display_order = 9 WHERE theme = 'outdoor';
UPDATE actions SET display_order = 10 WHERE theme = 'active';

-- Set default order for any themes we might have missed
UPDATE actions SET display_order = 99 WHERE display_order IS NULL;

