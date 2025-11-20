-- Add Roommate Syndrome questions to survey and create Roommate Syndrome Recovery actions
-- This addresses the common issue of couples living together but feeling disconnected

-- ============================================================================
-- ADD ROOMMATE SYNDROME QUESTIONS TO SURVEY (3 new questions)
-- ============================================================================

-- Add 3 new questions about Roommate Syndrome (questions 11-13)
INSERT INTO survey_questions (id, question_text, category, response_type, order_index) VALUES
(11, 'I feel like my partner and I are more like roommates than romantic partners', 'connection', 'scale', 11),
(12, 'We have meaningful conversations regularly (not just logistics)', 'connection', 'scale', 12),
(13, 'I feel emotionally connected and close to my partner', 'connection', 'scale', 13);

-- ============================================================================
-- CREATE ROOMMATE SYNDROME RECOVERY ACTIONS (15+ actions)
-- ============================================================================

-- Roommate Syndrome Recovery Category Actions
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit) VALUES
-- Reconnection Actions
('Have a 20-Minute Conversation', 'Set aside 20 minutes with no phones or distractions. Ask your partner about their day and actually listen without offering solutions.', 'Roommate Syndrome Recovery', 'reconnection', 'connection_actions', '💬', 'Creates space for meaningful connection. Undistracted time rebuilds emotional intimacy that gets lost in daily routines.'),

('Ask About Their Inner World', 'Ask your partner 5 questions about their thoughts, feelings, dreams, or concerns. Listen with curiosity, not judgment.', 'Roommate Syndrome Recovery', 'reconnection', 'connection_actions', '🤔', 'Shows you care about who they are, not just what they do. Deep questions rebuild the emotional connection that makes you partners, not roommates.'),

('State of the Union Conversation', 'Have a "state of the union" conversation about your relationship. Discuss what''s working, what isn''t, and how you can both improve.', 'Roommate Syndrome Recovery', 'reconnection', 'connection_actions', '📊', 'Prevents small issues from becoming big problems. Regular relationship check-ins keep you aligned and connected.'),

('Do Something You Used to Enjoy', 'Remember something you both used to love doing together. Do it again, even if it feels awkward at first.', 'Roommate Syndrome Recovery', 'reconnection', 'connection_actions', '🎭', 'Reconnects you to the fun, playful couple you used to be. Shared positive experiences rebuild emotional bonds.'),

('Plan a Surprise That Shows You Know Them', 'Plan something specific that shows you pay attention to your partner''s interests, preferences, or needs.', 'Roommate Syndrome Recovery', 'reconnection', 'connection_actions', '🎁', 'Demonstrates you see them as an individual, not just a roommate. Thoughtful surprises rebuild romantic connection.'),

-- Communication Rebuilders
('Listen Without Fixing', 'When your partner shares something, listen to understand, not to solve. Ask follow-up questions instead of offering solutions.', 'Roommate Syndrome Recovery', 'communication', 'communication_actions', '👂', 'Shows you value their feelings over fixing problems. Emotional validation rebuilds trust and connection.'),

('Share One Feeling Today', 'Share one genuine feeling with your partner - something you''re happy about, worried about, or excited about.', 'Roommate Syndrome Recovery', 'communication', 'communication_actions', '💭', 'Vulnerability creates intimacy. Sharing feelings moves you from roommates to partners who know each other deeply.'),

('Ask: What Can I Do to Make You Feel More Loved?', 'Directly ask your partner what would make them feel more loved, appreciated, or connected to you.', 'Roommate Syndrome Recovery', 'communication', 'communication_actions', '❓', 'Gets specific, actionable answers. Your partner knows what they need - asking shows you care enough to find out.'),

('Practice the 5:1 Ratio', 'Make 5 positive comments or gestures before any criticism or complaint. Focus on what''s working.', 'Roommate Syndrome Recovery', 'communication', 'communication_actions', '⚖️', 'Research shows healthy relationships need 5 positive interactions for every negative one. This ratio rebuilds connection.'),

-- Emotional Intimacy Builders
('Create a Love Map', 'Ask your partner 20 questions about their inner world - hopes, fears, dreams, stresses, joys. Build your "love map" of who they are.', 'Roommate Syndrome Recovery', 'intimacy', 'intimacy_actions', '🗺️', 'Based on Gottman research. Knowing your partner''s inner world is the foundation of emotional intimacy and connection.'),

('Practice Turning Toward', 'When your partner makes a "bid" for attention (comment, question, gesture), respond positively. Turn toward them, not away.', 'Roommate Syndrome Recovery', 'intimacy', 'intimacy_actions', '🔄', 'Gottman research shows turning toward bids is crucial for connection. Small positive responses build big emotional bonds.'),

('Share Gratitude for Who They Are', 'Tell your partner something you appreciate about their character, not just what they do. Focus on who they are as a person.', 'Roommate Syndrome Recovery', 'intimacy', 'intimacy_actions', '💝', 'Appreciating character, not just actions, shows you see them deeply. This moves you from transactional to relational.'),

-- Quality Time Actions
('Tech-Free Quality Time', 'Spend 30 minutes together with phones put away. No TV, no distractions. Just be present with each other.', 'Roommate Syndrome Recovery', 'quality_time', 'quality_time_actions', '📵', 'Removes the distractions that create roommate syndrome. Undistracted presence rebuilds the connection that got lost in busyness.'),

('Weekly Date Night Conversation', 'Have a weekly "date night" that''s just conversation - not an activity. Talk about your relationship, dreams, or just catch up deeply.', 'Roommate Syndrome Recovery', 'quality_time', 'quality_time_actions', '🗣️', 'Regular deep conversations prevent roommate syndrome. Talking about more than logistics keeps you emotionally connected.'),

('Morning or Evening Ritual', 'Create a small daily ritual together - morning coffee, evening walk, or bedtime check-in. Consistency builds connection.', 'Roommate Syndrome Recovery', 'quality_time', 'quality_time_actions', '☕', 'Small daily rituals create predictable connection points. Consistency rebuilds the rhythm of partnership.'),

-- Physical Connection
('Non-Sexual Physical Touch', 'Give your partner physical affection that isn''t sexual - hugs, hand-holding, back rubs, cuddling. Rebuild physical connection.', 'Roommate Syndrome Recovery', 'intimacy', 'intimacy_actions', '🤗', 'Physical touch releases oxytocin (bonding hormone). Non-sexual touch rebuilds the physical connection that makes you feel like partners.'),

('Sit Close and Talk', 'Instead of sitting across from each other, sit side-by-side and have a conversation. Physical proximity increases emotional connection.', 'Roommate Syndrome Recovery', 'intimacy', 'intimacy_actions', '👫', 'Physical proximity increases emotional intimacy. Side-by-side conversations feel more connected than face-to-face.');

-- ============================================================================
-- ADD BADGES FOR ROOMMATE SYNDROME RECOVERY
-- ============================================================================

-- Add category column to badges table if it doesn't exist
ALTER TABLE badges ADD COLUMN IF NOT EXISTS category TEXT;

-- Roommate Syndrome Recovery Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category) VALUES
('Connection Builder', 'Completed 5 reconnection actions', '🔗', 'consistency', 'category_count', 5, 5, 'Roommate Syndrome Recovery'),
('Communication Rebuilder', 'Completed 5 communication rebuilders', '💬', 'consistency', 'category_count', 5, 5, 'Roommate Syndrome Recovery'),
('Intimacy Restorer', 'Completed 5 emotional intimacy builders', '💕', 'consistency', 'category_count', 5, 5, 'Roommate Syndrome Recovery'),
('Roommate Syndrome Survivor', 'Completed 10 Roommate Syndrome Recovery actions', '🏆', 'consistency', 'category_count', 10, 10, 'Roommate Syndrome Recovery'),
('Connection Champion', 'Completed 15 Roommate Syndrome Recovery actions', '👑', 'consistency', 'category_count', 15, 15, 'Roommate Syndrome Recovery');

