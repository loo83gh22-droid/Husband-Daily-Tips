-- First, remove any duplicate badges (keep the one with the lowest ID)
DELETE FROM badges
WHERE id NOT IN (
  SELECT MIN(id)
  FROM badges
  GROUP BY name, requirement_type, requirement_value
);

-- Now add badges that align with action categories/themes
-- These badges will be earned by completing actions in each category

-- Communication Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Communication Champion',
  'Complete 10 communication-focused actions or tips',
  '💬',
  'big_idea',
  'category_count',
  10,
  30
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Communication Champion' AND requirement_type = 'category_count'
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Active Listener',
  'Complete 5 active listening actions',
  '👂',
  'big_idea',
  'category_count',
  5,
  25
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Active Listener' AND requirement_type = 'category_count'
);

-- Romance Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Romance Master',
  'Complete 10 romance-focused actions or tips',
  '💕',
  'big_idea',
  'category_count',
  10,
  35
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Romance Master' AND requirement_type = 'category_count'
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Date Night Pro',
  'Plan and execute 5 quality date nights',
  '🍷',
  'big_idea',
  'date_nights',
  5,
  45
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Date Night Pro' AND requirement_type = 'date_nights'
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Surprise Specialist',
  'Plan and execute 3 surprise dates or activities',
  '🎁',
  'big_idea',
  'surprise_actions',
  3,
  40
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Surprise Specialist' AND requirement_type = 'surprise_actions'
);

-- Gratitude Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Gratitude Guru',
  'Express specific gratitude 20 times',
  '🙌',
  'big_idea',
  'gratitude_actions',
  20,
  30
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Gratitude Guru' AND requirement_type = 'gratitude_actions'
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Gratitude Champion',
  'Complete 15 gratitude actions',
  '🌟',
  'big_idea',
  'gratitude_actions',
  15,
  25
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Gratitude Champion' AND requirement_type = 'gratitude_actions'
);

-- Partnership Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Partnership Pro',
  'Complete 10 partnership-focused actions or tips',
  '🤝',
  'big_idea',
  'category_count',
  10,
  35
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Partnership Pro' AND requirement_type = 'category_count'
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Support System',
  'Support your partner through a major goal or difficult time',
  '💪',
  'big_idea',
  'support_actions',
  1,
  50
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Support System' AND requirement_type = 'support_actions'
);

-- Intimacy Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Intimacy Expert',
  'Complete 10 intimacy-focused actions or tips',
  '💝',
  'big_idea',
  'category_count',
  10,
  40
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Intimacy Expert' AND requirement_type = 'category_count'
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Love Language Learner',
  'Actively practice all 5 love languages',
  '💖',
  'big_idea',
  'love_languages',
  5,
  60
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Love Language Learner' AND requirement_type = 'love_languages'
);

-- Conflict Resolution Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Conflict Resolver',
  'Successfully resolve 5 conflicts constructively',
  '⚖️',
  'big_idea',
  'conflict_resolutions',
  5,
  50
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Conflict Resolver' AND requirement_type = 'conflict_resolutions'
);

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Peacemaker',
  'Resolve 3 conflicts using healthy communication',
  '🕊️',
  'big_idea',
  'conflict_resolutions',
  3,
  35
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Peacemaker' AND requirement_type = 'conflict_resolutions'
);

-- Apology Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus)
SELECT 
  'Apology Ace',
  'Sincerely apologize and make amends 3 times',
  '🙏',
  'big_idea',
  'apology_actions',
  3,
  35
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = 'Apology Ace' AND requirement_type = 'apology_actions'
);

-- Add a unique constraint to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_unique_name_requirement 
ON badges(name, requirement_type, requirement_value);

