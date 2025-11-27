-- Ensure all category_count badges exist for all 8 categories
-- This migration adds any missing badges that should exist based on the standard progression
-- Progression: 1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend

-- ============================================================================
-- STEP 1: Ensure Gratitude category_count badges exist (they use gratitude_actions, but should also have category_count)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Gratitude Starter', 'Completed your first gratitude action. Appreciation starts here.', '🙏', 'big_idea', 'category_count', 1, 0, 'Gratitude'),
  ('Gratitude Builder', 'Completed 5 gratitude actions. You''re building a habit of appreciation.', '🙌', 'big_idea', 'category_count', 5, 0, 'Gratitude'),
  ('Gratitude Expert', 'Completed 10 gratitude actions. You''re a gratitude expert.', '🌟', 'big_idea', 'category_count', 10, 0, 'Gratitude'),
  ('Gratitude Master', 'Completed 25 gratitude actions. You''re a gratitude master.', '✨', 'big_idea', 'category_count', 25, 0, 'Gratitude'),
  ('Gratitude Champion', 'Completed 50 gratitude actions. You''re a gratitude champion.', '💫', 'big_idea', 'category_count', 50, 0, 'Gratitude'),
  ('Gratitude Legend', 'Completed 100 gratitude actions. You''re a gratitude legend. She notices.', '👑', 'big_idea', 'category_count', 100, 0, 'Gratitude')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- ============================================================================
-- STEP 2: Ensure Intimacy category_count badges exist (check if Expert is missing)
-- ============================================================================

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Intimacy Starter', 'Completed your first intimacy action. Connection starts here.', '💝', 'big_idea', 'category_count', 1, 0, 'Intimacy'),
  ('Intimacy Builder', 'Completed 5 intimacy actions. You''re building deeper connection.', '💝', 'big_idea', 'category_count', 5, 0, 'Intimacy'),
  ('Intimacy Expert', 'Completed 10 intimacy actions. You''re an intimacy expert.', '💝', 'big_idea', 'category_count', 10, 0, 'Intimacy'),
  ('Intimacy Master', 'Completed 25 intimacy actions. You''re an intimacy master.', '💝', 'big_idea', 'category_count', 25, 0, 'Intimacy'),
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
-- STEP 3: Ensure all other categories have complete badge progressions
-- Check and add any missing badges for Communication, Partnership, Romance, Conflict Resolution, Reconnection, Quality Time
-- ============================================================================

-- Communication badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Communication Starter', 'Completed your first communication action. You''re learning to connect.', '💬', 'big_idea', 'category_count', 1, 0, 'Communication'),
  ('Communication Builder', 'Completed 5 communication actions. You''re building better communication.', '💬', 'big_idea', 'category_count', 5, 0, 'Communication'),
  ('Communication Expert', 'Completed 10 communication actions. You''re a communication expert.', '💬', 'big_idea', 'category_count', 10, 0, 'Communication'),
  ('Communication Master', 'Completed 25 communication actions. You''re a communication master.', '💬', 'big_idea', 'category_count', 25, 0, 'Communication'),
  ('Communication Champion', 'Completed 50 communication actions. You''re a communication champion.', '💬', 'big_idea', 'category_count', 50, 0, 'Communication'),
  ('Communication Legend', 'Completed 100 communication actions. You''re a communication legend.', '💬', 'big_idea', 'category_count', 100, 0, 'Communication')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges 
  WHERE name = v.name 
  AND requirement_type = v.requirement_type 
  AND requirement_value = v.requirement_value
  AND category = v.category
);

-- Partnership badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Partnership Starter', 'Completed your first partnership action. You''re becoming a true partner.', '🤝', 'big_idea', 'category_count', 1, 0, 'Partnership'),
  ('Partnership Builder', 'Completed 5 partnership actions. You''re building true partnership.', '🤝', 'big_idea', 'category_count', 5, 0, 'Partnership'),
  ('Partnership Expert', 'Completed 10 partnership actions. You''re a partnership expert.', '🤝', 'big_idea', 'category_count', 10, 0, 'Partnership'),
  ('Partnership Master', 'Completed 25 partnership actions. You''re a partnership master.', '🤝', 'big_idea', 'category_count', 25, 0, 'Partnership'),
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

-- Romance badges (category_count - separate from date_nights and surprise_actions)
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Romance Starter', 'Completed your first romance action. The spark starts here.', '💕', 'big_idea', 'category_count', 1, 0, 'Romance'),
  ('Romance Builder', 'Completed 5 romance actions. You''re building romance.', '💕', 'big_idea', 'category_count', 5, 0, 'Romance'),
  ('Romance Expert', 'Completed 10 romance actions. You''re a romance expert.', '💕', 'big_idea', 'category_count', 10, 0, 'Romance'),
  ('Romance Master', 'Completed 25 romance actions. You''re a romance master.', '💕', 'big_idea', 'category_count', 25, 0, 'Romance'),
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

-- Conflict Resolution badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Conflict Resolution Starter', 'Completed your first conflict resolution action. You''re learning to navigate disagreements.', '⚖️', 'big_idea', 'category_count', 1, 0, 'Conflict Resolution'),
  ('Conflict Resolution Builder', 'Completed 5 conflict resolution actions. You''re building healthier conflict skills.', '⚖️', 'big_idea', 'category_count', 5, 0, 'Conflict Resolution'),
  ('Conflict Resolution Expert', 'Completed 10 conflict resolution actions. You''re a conflict resolution expert.', '⚖️', 'big_idea', 'category_count', 10, 0, 'Conflict Resolution'),
  ('Conflict Resolution Master', 'Completed 25 conflict resolution actions. You''re a conflict resolution master.', '⚖️', 'big_idea', 'category_count', 25, 0, 'Conflict Resolution'),
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

-- Reconnection badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Reconnection Starter', 'Completed your first reconnection action. You''re rebuilding the connection.', '🔗', 'big_idea', 'category_count', 1, 0, 'Reconnection'),
  ('Reconnection Builder', 'Completed 5 reconnection actions. You''re actively rebuilding your bond.', '🔗', 'big_idea', 'category_count', 5, 0, 'Reconnection'),
  ('Reconnection Expert', 'Completed 10 reconnection actions. You''re a reconnection expert.', '🔗', 'big_idea', 'category_count', 10, 0, 'Reconnection'),
  ('Reconnection Master', 'Completed 25 reconnection actions. You''re a reconnection master.', '🔗', 'big_idea', 'category_count', 25, 0, 'Reconnection'),
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

-- Quality Time badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Quality Time Starter', 'Completed your first quality time action. You''re prioritizing time together.', '⏰', 'big_idea', 'category_count', 1, 0, 'Quality Time'),
  ('Quality Time Builder', 'Completed 5 quality time actions. You''re making time together a priority.', '⏰', 'big_idea', 'category_count', 5, 0, 'Quality Time'),
  ('Quality Time Expert', 'Completed 10 quality time actions. You''re a quality time expert.', '⏰', 'big_idea', 'category_count', 10, 0, 'Quality Time'),
  ('Quality Time Master', 'Completed 25 quality time actions. You''re a quality time master.', '⏰', 'big_idea', 'category_count', 25, 0, 'Quality Time'),
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
-- STEP 4: Update comment
-- ============================================================================

COMMENT ON TABLE badges IS 'All 8 categories (Communication, Intimacy, Partnership, Romance, Gratitude, Conflict Resolution, Reconnection, Quality Time) have complete category_count badge progressions: 1=Starter, 5=Builder, 10=Expert, 25=Master, 50=Champion, 100=Legend. Specialized badges (apology_actions, gratitude_actions, date_nights, surprise_actions, outdoor_activities, adventure_activities) use specific requirement types. Badges are awards and do NOT affect Husband Health score.';

