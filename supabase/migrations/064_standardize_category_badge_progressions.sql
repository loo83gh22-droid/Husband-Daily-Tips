-- Standardize badge progressions for all action categories
-- Ensure each category has: 1, 5, 10, 25, 50, 100 action completion badges
-- Fix mis-categorized badges (e.g., Conflict Resolution badges in Communication)

-- ============================================================================
-- STEP 1: Remove mis-categorized badges and duplicates
-- ============================================================================

-- Remove Conflict Resolution badges that are incorrectly in Communication category
DELETE FROM badges 
WHERE (name IN ('Conflict Resolver', 'Peacemaker') AND category = 'Communication')
   OR (name LIKE '%Conflict%' AND category = 'Communication' AND requirement_type = 'conflict_resolutions');

-- Remove any badges that don't follow the standard progression (1, 5, 10, 25, 50, 100)
-- for category_count requirement_type, except specialized badges
DELETE FROM badges
WHERE requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100)
AND badge_type = 'big_idea'
AND category IS NOT NULL
AND name NOT LIKE '%Listener%'  -- Keep specialized listening badges
AND name NOT LIKE '%Check-In%'  -- Keep specialized check-in badges
AND name NOT LIKE '%Vulnerability%';  -- Keep specialized vulnerability badges

-- ============================================================================
-- STEP 2: COMMUNICATION BADGES - Ensure full progression (1, 5, 10, 25, 50, 100)
-- ============================================================================

-- Remove existing communication category_count badges that don't match progression
DELETE FROM badges 
WHERE category = 'Communication' 
AND requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- Add full progression for Communication
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Communication Starter', 'Completed your first communication action. You''re starting to get it.', '💬', 'big_idea', 'category_count', 1, 0, 'Communication'),
  ('Communication Builder', 'Completed 5 communication actions. You''re building better communication habits.', '💬', 'big_idea', 'category_count', 5, 0, 'Communication'),
  ('Communication Champion', 'Completed 10 communication actions. You''re getting good at this talking thing.', '💬', 'big_idea', 'category_count', 10, 0, 'Communication'),
  ('Communication Pro', 'Completed 25 communication actions. You actually listen now. Impressive.', '💬', 'big_idea', 'category_count', 25, 0, 'Communication'),
  ('Communication Master', 'Completed 50 communication actions. You''ve mastered the art of connection.', '💬', 'big_idea', 'category_count', 50, 0, 'Communication'),
  ('Communication Legend', 'Completed 100 communication actions. You''re a communication legend. She notices.', '💬', 'big_idea', 'category_count', 100, 0, 'Communication')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 3: INTIMACY BADGES - Ensure full progression (1, 5, 10, 25, 50, 100)
-- ============================================================================

-- Remove existing intimacy category_count badges that don't match progression
DELETE FROM badges 
WHERE category = 'Intimacy' 
AND requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- Add full progression for Intimacy
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Intimacy Starter', 'Completed your first intimacy action. Connection starts here.', '💝', 'big_idea', 'category_count', 1, 0, 'Intimacy'),
  ('Intimacy Builder', 'Completed 5 intimacy actions. You''re building deeper connection.', '💝', 'big_idea', 'category_count', 5, 0, 'Intimacy'),
  ('Intimacy Expert', 'Completed 10 intimacy actions. You''re deepening your bond.', '💝', 'big_idea', 'category_count', 10, 0, 'Intimacy'),
  ('Intimacy Master', 'Completed 25 intimacy actions. You''ve mastered emotional connection.', '💝', 'big_idea', 'category_count', 25, 0, 'Intimacy'),
  ('Intimacy Champion', 'Completed 50 intimacy actions. You''re an intimacy champion.', '💝', 'big_idea', 'category_count', 50, 0, 'Intimacy'),
  ('Intimacy Legend', 'Completed 100 intimacy actions. You''re an intimacy legend.', '💝', 'big_idea', 'category_count', 100, 0, 'Intimacy')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 4: PARTNERSHIP BADGES - Ensure full progression (1, 5, 10, 25, 50, 100)
-- ============================================================================

-- Remove existing partnership category_count badges that don't match progression
DELETE FROM badges 
WHERE category = 'Partnership' 
AND requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- Add full progression for Partnership
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Partnership Starter', 'Completed your first partnership action. Teamwork makes the dream work.', '🤝', 'big_idea', 'category_count', 1, 0, 'Partnership'),
  ('Partnership Builder', 'Completed 5 partnership actions. You''re becoming a true partner.', '🤝', 'big_idea', 'category_count', 5, 0, 'Partnership'),
  ('Partnership Pro', 'Completed 10 partnership actions. You''re a reliable partner.', '🤝', 'big_idea', 'category_count', 10, 0, 'Partnership'),
  ('Partnership Master', 'Completed 25 partnership actions. You''ve mastered being a team player.', '🤝', 'big_idea', 'category_count', 25, 0, 'Partnership'),
  ('Partnership Champion', 'Completed 50 partnership actions. You''re a partnership champion.', '🤝', 'big_idea', 'category_count', 50, 0, 'Partnership'),
  ('Partnership Legend', 'Completed 100 partnership actions. You''re a partnership legend.', '🤝', 'big_idea', 'category_count', 100, 0, 'Partnership')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 5: ROMANCE BADGES - Ensure full progression (1, 5, 10, 25, 50, 100)
-- ============================================================================

-- Remove existing romance category_count badges that don't match progression
DELETE FROM badges 
WHERE category = 'Romance' 
AND requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- Add full progression for Romance
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Romance Starter', 'Completed your first romance action. The spark starts here.', '💕', 'big_idea', 'category_count', 1, 0, 'Romance'),
  ('Romance Rookie', 'Completed 5 romance actions. You''re bringing the romance back.', '💕', 'big_idea', 'category_count', 5, 0, 'Romance'),
  ('Romance Master', 'Completed 10 romance actions. You''re a romance master.', '💕', 'big_idea', 'category_count', 10, 0, 'Romance'),
  ('Romance Expert', 'Completed 25 romance actions. You''ve mastered keeping the spark alive.', '💕', 'big_idea', 'category_count', 25, 0, 'Romance'),
  ('Romance Champion', 'Completed 50 romance actions. You''re a romance champion.', '💕', 'big_idea', 'category_count', 50, 0, 'Romance'),
  ('Romance Legend', 'Completed 100 romance actions. You''re a romance legend.', '💕', 'big_idea', 'category_count', 100, 0, 'Romance')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 6: CONFLICT RESOLUTION BADGES - Ensure full progression (1, 5, 10, 25, 50, 100)
-- ============================================================================

-- Remove existing conflict resolution badges that are mis-categorized or don't match progression
DELETE FROM badges 
WHERE (category = 'Conflict Resolution' AND requirement_type = 'category_count' AND requirement_value NOT IN (1, 5, 10, 25, 50, 100))
   OR (name IN ('Conflict Resolver', 'Peacemaker') AND category = 'Communication');

-- Add full progression for Conflict Resolution
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Conflict Resolution Starter', 'Completed your first conflict resolution action. You''re learning to navigate disagreements.', '⚖️', 'big_idea', 'category_count', 1, 0, 'Conflict Resolution'),
  ('Conflict Resolution Builder', 'Completed 5 conflict resolution actions. You''re building healthier conflict skills.', '⚖️', 'big_idea', 'category_count', 5, 0, 'Conflict Resolution'),
  ('Conflict Resolver', 'Completed 10 conflict resolution actions. You turn arguments into understanding.', '⚖️', 'big_idea', 'category_count', 10, 0, 'Conflict Resolution'),
  ('Conflict Resolution Expert', 'Completed 25 conflict resolution actions. You''ve mastered constructive conflict.', '⚖️', 'big_idea', 'category_count', 25, 0, 'Conflict Resolution'),
  ('Conflict Resolution Champion', 'Completed 50 conflict resolution actions. You''re a conflict resolution champion.', '⚖️', 'big_idea', 'category_count', 50, 0, 'Conflict Resolution'),
  ('Conflict Resolution Legend', 'Completed 100 conflict resolution actions. You''re a conflict resolution legend.', '⚖️', 'big_idea', 'category_count', 100, 0, 'Conflict Resolution')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 7: RECONNECTION BADGES - Ensure full progression (1, 5, 10, 25, 50, 100)
-- ============================================================================

-- Remove existing reconnection category_count badges that don't match progression
DELETE FROM badges 
WHERE category = 'Reconnection' 
AND requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- Add full progression for Reconnection
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Reconnection Starter', 'Completed your first reconnection action. You''re rebuilding the connection.', '🔗', 'big_idea', 'category_count', 1, 0, 'Reconnection'),
  ('Reconnection Builder', 'Completed 5 reconnection actions. You''re actively rebuilding your bond.', '🔗', 'big_idea', 'category_count', 5, 0, 'Reconnection'),
  ('Reconnection Expert', 'Completed 10 reconnection actions. You''re reconnecting on a deeper level.', '🔗', 'big_idea', 'category_count', 10, 0, 'Reconnection'),
  ('Reconnection Master', 'Completed 25 reconnection actions. You''ve mastered reconnecting.', '🔗', 'big_idea', 'category_count', 25, 0, 'Reconnection'),
  ('Reconnection Champion', 'Completed 50 reconnection actions. You''re a reconnection champion.', '🔗', 'big_idea', 'category_count', 50, 0, 'Reconnection'),
  ('Reconnection Legend', 'Completed 100 reconnection actions. You''re a reconnection legend.', '🔗', 'big_idea', 'category_count', 100, 0, 'Reconnection')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 8: QUALITY TIME BADGES - Ensure full progression (1, 5, 10, 25, 50, 100)
-- ============================================================================

-- Remove existing quality time category_count badges that don't match progression
DELETE FROM badges 
WHERE category = 'Quality Time' 
AND requirement_type = 'category_count'
AND requirement_value NOT IN (1, 5, 10, 25, 50, 100);

-- Add full progression for Quality Time
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Quality Time Starter', 'Completed your first quality time action. You''re prioritizing time together.', '⏰', 'big_idea', 'category_count', 1, 0, 'Quality Time'),
  ('Quality Time Builder', 'Completed 5 quality time actions. You''re making time together a priority.', '⏰', 'big_idea', 'category_count', 5, 0, 'Quality Time'),
  ('Quality Time Expert', 'Completed 10 quality time actions. You''re consistently making time for each other.', '⏰', 'big_idea', 'category_count', 10, 0, 'Quality Time'),
  ('Quality Time Master', 'Completed 25 quality time actions. You''ve mastered prioritizing quality time.', '⏰', 'big_idea', 'category_count', 25, 0, 'Quality Time'),
  ('Quality Time Champion', 'Completed 50 quality time actions. You''re a quality time champion.', '⏰', 'big_idea', 'category_count', 50, 0, 'Quality Time'),
  ('Quality Time Legend', 'Completed 100 quality time actions. You''re a quality time legend.', '⏰', 'big_idea', 'category_count', 100, 0, 'Quality Time')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 9: GRATITUDE BADGES - Already have full progression (1, 5, 10, 25, 50, 100)
-- ============================================================================
-- Gratitude badges are already set up correctly in migration 061

-- ============================================================================
-- STEP 10: Update specialized badges to have correct categories
-- ============================================================================

-- Move Conflict Resolution specialized badges to correct category
UPDATE badges 
SET category = 'Conflict Resolution'
WHERE name IN ('Conflict Resolver', 'Peacemaker')
AND requirement_type = 'conflict_resolutions';

-- Ensure specialized badges keep their specific requirement types but have correct categories
-- Apology badges should be in Communication (they're a communication skill)
UPDATE badges 
SET category = 'Communication'
WHERE name = 'Apology Ace'
AND requirement_type = 'apology_actions';

-- ============================================================================
-- STEP 11: Add event completion badges for all categories (if they don't exist)
-- ============================================================================

-- Communication Event
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Communication Champion',
  'Completed the 7-Day Communication Event',
  '💬',
  'big_idea',
  'event_completion',
  1,
  0,
  'Communication'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Communication Champion' AND requirement_type = 'event_completion'
);

-- Intimacy Event
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Intimacy Champion',
  'Completed the 7-Day Intimacy Event',
  '💝',
  'big_idea',
  'event_completion',
  1,
  0,
  'Intimacy'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Intimacy Champion' AND requirement_type = 'event_completion'
);

-- Partnership Event
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Partnership Champion',
  'Completed the 7-Day Partnership Event',
  '🤝',
  'big_idea',
  'event_completion',
  1,
  0,
  'Partnership'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Partnership Champion' AND requirement_type = 'event_completion'
);

-- Romance Event
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Romance Champion',
  'Completed the 7-Day Romance Event',
  '💕',
  'big_idea',
  'event_completion',
  1,
  0,
  'Romance'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Romance Champion' AND requirement_type = 'event_completion'
);

-- Gratitude Event
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Gratitude Champion',
  'Completed the 7-Day Gratitude Event',
  '🙏',
  'big_idea',
  'event_completion',
  1,
  0,
  'Gratitude'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Gratitude Champion' AND requirement_type = 'event_completion'
);

-- Conflict Resolution Event
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Conflict Resolution Champion',
  'Completed the 7-Day Conflict Resolution Event',
  '⚖️',
  'big_idea',
  'event_completion',
  1,
  0,
  'Conflict Resolution'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Conflict Resolution Champion' AND requirement_type = 'event_completion'
);

-- Reconnection Event
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Reconnection Champion',
  'Completed the 7-Day Reconnection Event',
  '🔗',
  'big_idea',
  'event_completion',
  1,
  0,
  'Reconnection'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Reconnection Champion' AND requirement_type = 'event_completion'
);

-- Quality Time Event
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Quality Time Champion',
  'Completed the 7-Day Quality Time Event',
  '⏰',
  'big_idea',
  'event_completion',
  1,
  0,
  'Quality Time'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Quality Time Champion' AND requirement_type = 'event_completion'
);

-- ============================================================================
-- STEP 12: Update comment documenting badge structure
-- ============================================================================

COMMENT ON TABLE badges IS 'All action categories have standardized badge progressions: 1, 5, 10, 25, 50, 100 actions completed. Categories: Communication, Intimacy, Partnership, Romance, Gratitude, Conflict Resolution, Reconnection, Quality Time. Specialized badges (date nights, surprises, apologies, etc.) use specific requirement types with lower, more attainable thresholds. Badges do NOT affect Husband Health score - they are purely awards.';

