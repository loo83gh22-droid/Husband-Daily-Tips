-- Add wife-friendly marketing messages and badges
-- This ensures the product appeals to both husbands AND their wives

-- Add wife-friendly marketing messages
INSERT INTO marketing_messages (message, category, context, display_order) VALUES
  ('She''ll notice the difference. You''ll feel it too.', 'value', 'landing_page', 77),
  ('Real actions. Real results. Real connection.', 'value', 'landing_page', 78),
  ('Because your relationship deserves daily intention.', 'value', 'landing_page', 79),
  ('Small gestures. Big impact. Daily consistency.', 'value', 'landing_page', 80),
  ('Actions that show you see her, know her, and care.', 'value', 'landing_page', 81),
  ('Not about fixing. About showing up. Every day.', 'value', 'landing_page', 82),
  ('The husband she deserves. The partner you want to be.', 'value', 'landing_page', 83),
  ('Daily actions that rebuild connection, one moment at a time.', 'value', 'landing_page', 84),
  ('She''ll feel the difference. You''ll see the results.', 'value', 'subscription_page', 18),
  ('Actions that show genuine care, not just checking boxes.', 'value', 'landing_page', 85),
  ('The kind of husband who shows up. Every. Single. Day.', 'value', 'landing_page', 86),
  ('Because she deserves a partner who actually tries.', 'value', 'landing_page', 87)
ON CONFLICT DO NOTHING;

-- Add wife-appreciated badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Thoughtful Partner', 'Completed 20 actions that show genuine care and attention. She''ll notice the difference.', '💝', 'big_idea', 'total_count', 20, 40, NULL),
  ('Consistent Connection', 'Maintained a 30-day streak of daily actions. Consistency builds trust and shows you''re serious.', '🔥', 'consistency', 'streak', 30, 50, NULL),
  ('Emotional Intelligence', 'Completed 15 communication and intimacy actions. You''re learning to connect on a deeper level.', '🧠', 'big_idea', 'category_count', 15, 45, 'Communication'),
  ('Partner, Not Roommate', 'Completed 25 partnership and connection actions. You''re showing up as a true partner, not just a cohabitant.', '🤝', 'big_idea', 'category_count', 25, 50, 'Partnership'),
  ('The Husband She Deserves', 'Completed 100 total actions. You''ve shown consistent effort and genuine care. She''ll feel the difference.', '👑', 'milestone', 'total_count', 100, 100, NULL),
  ('She Feels Seen', 'Completed 10 actions focused on truly seeing and understanding her. Emotional awareness matters.', '👀', 'big_idea', 'category_count', 10, 35, 'Intimacy'),
  ('Genuine Effort', 'Completed 50 actions with genuine intention. Not performative—real. She''ll notice.', '💪', 'milestone', 'total_count', 50, 60, NULL)
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name
);

-- Update existing action benefits to include wife perspective (where appropriate)
-- Note: This is a sample - you may want to review all actions individually
UPDATE actions 
SET benefit = benefit || ' She''ll notice you''re paying attention and actually trying.'
WHERE name = 'Do a Chore Without Being Asked'
AND benefit NOT LIKE '%She''ll notice%';

UPDATE actions 
SET benefit = benefit || ' She''ll feel heard and valued when you truly listen.'
WHERE name = 'Ask About Her Day (Actually Listen)'
AND benefit NOT LIKE '%She''ll feel%';

UPDATE actions 
SET benefit = benefit || ' She''ll feel seen and appreciated for who she is, not just what she does.'
WHERE name = 'Write a Love Note'
AND benefit NOT LIKE '%She''ll feel%';

UPDATE actions 
SET benefit = benefit || ' She''ll notice you''re thinking about her even when she''s not asking.'
WHERE name = 'Bring Her a Small Gift'
AND benefit NOT LIKE '%She''ll notice%';

UPDATE actions 
SET benefit = benefit || ' She''ll feel supported and valued as an individual, not just as your partner.'
WHERE name = 'Support Her Goals'
AND benefit NOT LIKE '%She''ll feel%';

-- Add comment to document the wife-friendly approach
COMMENT ON TABLE actions IS 'Actions are designed to be wife-friendly: thoughtful, genuine, and focused on building connection. If a wife were to read through these, she should appreciate the effort and intention behind them.';

COMMENT ON TABLE badges IS 'Badges celebrate genuine relationship effort that wives would recognize and appreciate. Focus on partnership, consistency, and emotional intelligence.';

