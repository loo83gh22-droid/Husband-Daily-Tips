-- Clean up and restructure Communication badges
-- Remove duplicate/conflicting communication badges first
-- Then add the new clean structure

-- Step 1: Remove all existing communication-related badges
-- We'll recreate them with a clean structure
DELETE FROM badges 
WHERE name IN (
  'Communication Champion',
  'Active Listener',
  'Communication Rebuilder',
  'Emotional Intelligence',
  'Master Listener',
  'Apology Ace',
  'Conflict Resolver',
  'Peacemaker'
)
OR (category = 'Communication' AND badge_type = 'big_idea')
OR (name LIKE '%Communication%' AND requirement_type = 'category_count')
OR (name LIKE '%Communication%' AND requirement_type = 'challenge_completed');

-- Step 2: Add Milestone Badges (Action Count)
-- These celebrate consistent effort in communication actions

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('First Steps', 'Completed your first communication action. You''re starting to get it.', '💬', 'big_idea', 'category_count', 1, 5, 'Communication'),
  ('Communication Rookie', 'Completed 10 communication actions. You''re getting good at this talking thing.', '💬', 'big_idea', 'category_count', 10, 15, 'Communication'),
  ('Communication Pro', 'Completed 25 communication actions. You actually listen now. Impressive.', '💬', 'big_idea', 'category_count', 25, 30, 'Communication'),
  ('Communication Master', 'Completed 50 communication actions. You''ve mastered the art of connection.', '💬', 'big_idea', 'category_count', 50, 50, 'Communication'),
  ('Communication Legend', 'Completed 100 communication actions. You''re a communication legend. She notices.', '💬', 'big_idea', 'category_count', 100, 100, 'Communication')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name AND requirement_type = v.requirement_type AND requirement_value = v.requirement_value
);

-- Step 3: Add Event Completion Badge
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  '7-Day Communication Champion',
  'Completed the 7-Day Communication Event',
  '💬',
  'big_idea',
  'event_completion',
  1,
  15,
  'Communication'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = '7-Day Communication Champion' AND requirement_type = 'event_completion'
);

-- Step 4: Add Specialized Communication Badges

-- Listening Skills
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Active Listener', 'Completed 5 active listening actions. You''re actually hearing her now.', '👂', 'big_idea', 'category_count', 5, 20, 'Communication'),
  ('Master Listener', 'Completed 20 listening actions. You don''t just hear—you understand.', '👂', 'big_idea', 'category_count', 20, 40, 'Communication')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name AND requirement_type = v.requirement_type AND requirement_value = v.requirement_value
);

-- Apology & Repair
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Apology Ace', 'Sincerely apologized and made amends 3 times. That''s maturity.', '🙏', 'big_idea', 'apology_actions', 3, 25, 'Communication'),
  ('Conflict Resolver', 'Successfully resolved 5 conflicts constructively. You turn arguments into understanding.', '⚖️', 'big_idea', 'conflict_resolutions', 5, 35, 'Communication')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name AND requirement_type = v.requirement_type AND requirement_value = v.requirement_value
);

-- Emotional Intelligence
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  'Emotional Intelligence',
  'Completed 15 communication and intimacy actions. You''re learning to connect on a deeper level.',
  '🧠',
  'big_idea',
  'category_count',
  15,
  45,
  'Communication'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Emotional Intelligence' AND requirement_type = 'category_count' AND requirement_value = 15
);

-- Vulnerability
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  'Vulnerability Master',
  'Shared something vulnerable 10 times. Real connection requires real openness.',
  '💙',
  'big_idea',
  'vulnerability_actions',
  10,
  30,
  'Communication'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Vulnerability Master'
);

-- Check-Ins
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 
  'Weekly Check-In Pro',
  'Completed 10 weekly relationship check-ins. Consistency in communication builds trust.',
  '📅',
  'big_idea',
  'check_in_actions',
  10,
  40,
  'Communication'
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Weekly Check-In Pro'
);

-- Add comment to document the clean structure
COMMENT ON TABLE badges IS 'Communication badges follow a clean structure: 5 milestone badges (1, 10, 25, 50, 100 actions), 1 event completion badge, and 6 specialized badges for different communication skills.';

