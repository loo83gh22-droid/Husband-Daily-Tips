-- Add more actions to reach at least 12 per category
-- Categories: conflict_resolution, romance, gratitude, partnership, intimacy, communication

-- ============================================================================
-- COMMUNICATION ACTIONS (add to reach 12+)
-- ============================================================================
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Validate Her Feelings', 'When she shares something difficult, validate her feelings. Say "That makes sense" or "I can see why you feel that way." Don''t try to fix it—just acknowledge it.', 'Communication', 'communication', 'daily', '💬', 'Validation makes her feel heard and understood, which is often more important than solutions.', 1),
  ('Ask Open-Ended Questions', 'Instead of "How was your day?" ask "What was the best part of your day?" or "What''s on your mind?" Open-ended questions invite real conversation.', 'Communication', 'communication', 'daily', '❓', 'Open-ended questions create space for deeper conversations and real connection.', 1),
  ('Put Your Phone Down', 'When she''s talking, physically put your phone away. Not on the table. Not in your pocket. In another room. Show she has your full attention.', 'Communication', 'communication', 'daily', '📵', 'Removing distractions shows you prioritize her and value what she has to say.', 1),
  ('Repeat Back What You Heard', 'After she tells you something, repeat it back in your own words. "So what I''m hearing is..." This shows you actually listened.', 'Communication', 'communication', 'daily', '🔄', 'Reflecting back what you heard confirms understanding and prevents misunderstandings.', 1),
  ('Ask "What Do You Need From Me?"', 'When she''s upset or stressed, ask what she needs. Not what you think she needs—ask her. Then do that thing.', 'Communication', 'communication', 'daily', '🤔', 'Asking what she needs shows you care about her actual needs, not your assumptions.', 1),
  ('Share Your Day Without Complaining', 'Tell her about your day, but focus on what happened, not just what went wrong. Share the good stuff too.', 'Communication', 'communication', 'daily', '📖', 'Sharing positive aspects of your day creates connection and balances the conversation.', 1),
  ('Have a "No Problem Solving" Conversation', 'Set a timer for 20 minutes. Talk about anything—except problems. No solutions. No fixing. Just connection.', 'Communication', 'communication', 'daily', '💭', 'Problem-free conversations create space for intimacy without the pressure of solving things.', 1),
  ('Tell Her Something You Appreciate', 'Tell her something specific you appreciate about her today. Not generic—be specific about what and why.', 'Communication', 'communication', 'daily', '💝', 'Specific appreciation makes her feel seen and valued for who she is, not just what she does.', 1)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'communication' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'communication') < 12;

-- ============================================================================
-- INTIMACY ACTIONS (add to reach 12+)
-- ============================================================================
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Hold Hands While Walking', 'Hold her hand when you walk together. Not just crossing the street—actually hold hands. It''s simple but powerful.', 'Intimacy', 'intimacy', 'daily', '🤝', 'Physical touch throughout the day builds connection and shows affection without expectation.', 2),
  ('Ask About Her Dreams', 'Ask about her dreams—not just career goals, but her actual dreams. What does she want for herself? For you both?', 'Intimacy', 'intimacy', 'daily', '💭', 'Learning about her dreams shows you care about her as an individual, not just as your partner.', 2),
  ('Give Her a Back Rub', 'Give her a back rub or shoulder massage. No strings attached. Just because she might need it.', 'Intimacy', 'intimacy', 'daily', '💆', 'Non-sexual physical touch builds trust and shows you care about her comfort and wellbeing.', 2),
  ('Tell Her Why You Fell in Love', 'Tell her something specific about why you fell in love with her. Be specific. Make it real.', 'Intimacy', 'intimacy', 'daily', '💕', 'Reminding her (and yourself) why you fell in love reinforces your bond and connection.', 2),
  ('Kiss Her Goodbye and Hello', 'Kiss her when you leave and when you come back. Not a peck—a real kiss. Show you missed her.', 'Intimacy', 'intimacy', 'daily', '💋', 'Ritual kisses create connection points throughout the day and show you think about her.', 2),
  ('Ask "How Are You Really?"', 'Ask how she''s really doing. Not the surface answer. Go deeper. Show you want to know her inner world.', 'Intimacy', 'intimacy', 'daily', '💙', 'Deep check-ins show you care about her emotional state, not just surface-level stuff.', 2),
  ('Share a Vulnerable Moment', 'Share something you''re struggling with or feeling. Be real. Vulnerability creates intimacy.', 'Intimacy', 'intimacy', 'daily', '💔', 'Sharing your own vulnerability invites her to do the same and deepens emotional intimacy.', 2),
  ('Create a "Us" Memory', 'Do something together that creates a new shared memory. Take a photo. Talk about it later. Build your story.', 'Intimacy', 'intimacy', 'daily', '📸', 'Creating new shared memories builds your relationship history and strengthens your bond.', 2)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'intimacy' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'intimacy') < 12;

-- ============================================================================
-- PARTNERSHIP ACTIONS (add to reach 12+)
-- ============================================================================
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Notice What Needs Doing', 'Look around. What needs doing? Do it. Don''t wait to be asked. Show you''re paying attention.', 'Partnership', 'partnership', 'daily', '👀', 'Noticing and doing things without being asked reduces her mental load and shows true partnership.', 3),
  ('Take Over a Task Completely', 'Pick one of her regular tasks and take it over completely. Don''t ask how to do it—figure it out. Own it.', 'Partnership', 'partnership', 'daily', '✅', 'Taking complete ownership of a task shows you''re a true partner, not just a helper.', 3),
  ('Handle Something She Usually Does', 'Do something she normally handles—grocery shopping, scheduling, whatever. Give her a mental break.', 'Partnership', 'partnership', 'daily', '🛒', 'Handling her regular responsibilities gives her a break and shows you''re in this together.', 3),
  ('Make a Decision Without Asking', 'For something small, make the decision. Don''t ask "What do you want?" Show you can handle it.', 'Partnership', 'partnership', 'daily', '🎯', 'Making small decisions reduces decision fatigue and shows you can take initiative.', 3),
  ('Plan Something Together', 'Plan a date, a trip, or a project together. Actually collaborate. Value her ideas and input.', 'Partnership', 'partnership', 'daily', '📅', 'Collaborative planning builds teamwork and shows you value her as an equal partner.', 3),
  ('Handle a Problem Before She Notices', 'See a problem? Fix it before she even knows it exists. Show you''re proactive, not reactive.', 'Partnership', 'partnership', 'daily', '🔧', 'Solving problems proactively shows you''re paying attention and taking responsibility.', 3),
  ('Ask About Her Work/Projects', 'Ask about her work or projects. Not just "How was work?"—ask specific questions. Show real interest.', 'Partnership', 'partnership', 'daily', '💼', 'Showing interest in her work shows you care about her as an individual, not just as your partner.', 3),
  ('Take Initiative on Household Maintenance', 'Notice something that needs fixing or maintaining? Handle it. Don''t wait. Show you''re responsible.', 'Partnership', 'partnership', 'daily', '🔨', 'Taking initiative on maintenance shows you''re invested in your shared life together.', 3)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'partnership' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'partnership') < 12;

-- ============================================================================
-- ROMANCE ACTIONS (add to reach 12+)
-- ============================================================================
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Leave a Love Note', 'Write her a note and leave it where she''ll find it. Tell her something specific you love about her.', 'Romance', 'romance', 'daily', '💌', 'Handwritten notes show thoughtfulness and effort, making her feel special and loved.', 4),
  ('Bring Her Favorite Treat', 'Bring her something she loves—coffee, snack, whatever. Show you know what she likes.', 'Romance', 'romance', 'daily', '☕', 'Remembering her favorites shows you pay attention and think about her throughout the day.', 4),
  ('Compliment Her Character', 'Compliment something about her character—her kindness, her strength, her humor. Not just appearance.', 'Romance', 'romance', 'daily', '✨', 'Character compliments make her feel valued for who she is, not just how she looks.', 4),
  ('Plan a Surprise', 'Plan something small and surprising. It doesn''t have to be big—thoughtful matters more than expensive.', 'Romance', 'romance', 'weekly', '🎁', 'Surprises show you''re thinking about her and want to make her happy, even when it''s not expected.', 4),
  ('Tell Her She''s Beautiful', 'Tell her she''s beautiful. Not just when she''s dressed up—tell her when she''s in sweats too.', 'Romance', 'romance', 'daily', '💝', 'Complimenting her in everyday moments shows you find her attractive all the time, not just on special occasions.', 4),
  ('Recreate a Favorite Memory', 'Recreate your first date or a favorite early memory. Relive the magic. Remind yourselves why you fell in love.', 'Romance', 'romance', 'weekly', '💑', 'Recreating special moments reinforces your bond and reminds you of your love story.', 4),
  ('Give Her Your Full Attention', 'Spend 30 minutes giving her your complete, undivided attention. No phone. No TV. Just her.', 'Romance', 'romance', 'daily', '👁️', 'Full attention is one of the most romantic things you can give—it shows she''s your priority.', 4),
  ('Tell Her Why You Love Her', 'Tell her something specific you love about her. Not just "I love you"—be specific about what and why.', 'Romance', 'romance', 'daily', '💕', 'Specific expressions of love make her feel deeply valued and understood.', 4)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'romance' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'romance') < 12;

-- ============================================================================
-- GRATITUDE ACTIONS (add to reach 12+)
-- ============================================================================
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Thank Her for Something Specific', 'Thank her for something specific she did today. Be specific about what and why it mattered to you.', 'Gratitude', 'gratitude', 'daily', '🙏', 'Specific gratitude shows you notice and appreciate her efforts, not just take them for granted.', 5),
  ('Write Down What You''re Grateful For', 'Write down 5 things you''re grateful for about her or your relationship. Share it with her.', 'Gratitude', 'gratitude', 'daily', '📝', 'Gratitude lists shift focus to the positive and strengthen appreciation for what you have.', 5),
  ('Celebrate Her Accomplishment', 'Did she accomplish something? Celebrate it. Make a big deal. Show you''re proud of her.', 'Gratitude', 'gratitude', 'daily', '🎉', 'Celebrating her wins shows you''re her biggest supporter and cheerleader.', 5),
  ('Acknowledge Her Effort', 'Notice something she did that took effort. Acknowledge it. Show you see the work she puts in.', 'Gratitude', 'gratitude', 'daily', '👏', 'Acknowledging effort shows you appreciate not just results, but the work behind them.', 5),
  ('Thank Her for Who She Is', 'Thank her for who she is, not just what she does. Show you appreciate her as a person.', 'Gratitude', 'gratitude', 'daily', '💝', 'Appreciating her essence, not just her actions, makes her feel deeply valued.', 5),
  ('Notice the Small Things', 'Notice the small things she does—making coffee, picking up after you, whatever. Mention it. Show you see her.', 'Gratitude', 'gratitude', 'daily', '👀', 'Noticing small things shows you pay attention and don''t take her for granted.', 5),
  ('Express Gratitude Publicly', 'Tell someone else (friend, family) something you appreciate about her. Let her overhear or tell her about it.', 'Gratitude', 'gratitude', 'weekly', '📢', 'Public appreciation shows you''re proud of her and value her highly.', 5),
  ('Send a Gratitude Text', 'Send her a text during the day telling her something you''re grateful for about her. Make her smile.', 'Gratitude', 'gratitude', 'daily', '📱', 'Unexpected gratitude messages brighten her day and show you think about her.', 5)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'gratitude' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'gratitude') < 12;

-- ============================================================================
-- CONFLICT RESOLUTION ACTIONS (add to reach 12+)
-- ============================================================================
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Use "I Feel" Instead of "You Always"', 'When you disagree, use "I feel" instead of "You always." It''s less defensive and opens dialogue.', 'Conflict Resolution', 'conflict_resolution', 'daily', '🗣️', 'I-statements reduce defensiveness and create space for understanding instead of blame.', 6),
  ('Take a Break When Things Get Heated', 'If things get too heated, suggest a break. Cool down. Come back to it when you can both think clearly.', 'Conflict Resolution', 'conflict_resolution', 'daily', '🧘', 'Taking breaks prevents saying things you''ll regret and allows for calmer resolution.', 6),
  ('Apologize First', 'Even if you think you''re both wrong, apologize first. Take responsibility for your part. Show maturity.', 'Conflict Resolution', 'conflict_resolution', 'daily', '🙏', 'Apologizing first breaks the cycle of blame and opens the door to resolution.', 6),
  ('Listen Without Defending', 'When she''s upset, listen. Don''t defend. Don''t explain. Just hear her. Show you understand her perspective.', 'Conflict Resolution', 'conflict_resolution', 'daily', '👂', 'Listening without defending shows you value her feelings over being right.', 6),
  ('Find Common Ground', 'In a disagreement, find what you both agree on. Build from there. Show you''re on the same team.', 'Conflict Resolution', 'conflict_resolution', 'daily', '🤝', 'Finding common ground shifts focus from opposition to collaboration.', 6),
  ('Take Responsibility for Your Part', 'Own your part in the conflict. Don''t make excuses. Show you can take responsibility.', 'Conflict Resolution', 'conflict_resolution', 'daily', '✅', 'Taking responsibility shows maturity and creates space for resolution.', 6),
  ('Propose a Solution', 'After understanding the issue, propose a solution. Show you''re committed to fixing things, not just talking.', 'Conflict Resolution', 'conflict_resolution', 'daily', '💡', 'Proposing solutions shows you''re committed to resolution, not just discussion.', 6),
  ('Stay Calm and Speak Softly', 'Even when you''re frustrated, stay calm. Speak softly. Your tone matters as much as your words.', 'Conflict Resolution', 'conflict_resolution', 'daily', '😌', 'Staying calm prevents escalation and creates space for productive conversation.', 6)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'conflict_resolution' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'conflict_resolution') < 12;

-- ============================================================================
-- CREATE BADGES FOR NEW ACTIONS (if they don't already exist)
-- ============================================================================

-- Communication Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Communication Champion', 'Completed 10 communication actions. You''re getting good at this talking thing.', '💬', 'big_idea', 'communication_actions', 10, 5, 'Communication'),
  ('Master Listener', 'Completed 20 communication actions. You actually listen now. Impressive.', '👂', 'big_idea', 'communication_actions', 20, 10, 'Communication')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name AND requirement_type = v.requirement_type
)
ON CONFLICT DO NOTHING;

-- Intimacy Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Intimacy Expert', 'Completed 10 intimacy actions. You''re building real connection.', '💝', 'big_idea', 'intimacy_actions', 10, 5, 'Intimacy'),
  ('Deep Connection Master', 'Completed 20 intimacy actions. You know how to connect on a deeper level.', '💕', 'big_idea', 'intimacy_actions', 20, 10, 'Intimacy')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name AND requirement_type = v.requirement_type
)
ON CONFLICT DO NOTHING;

-- Partnership Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('True Partner', 'Completed 10 partnership actions. You''re a real partner, not just a helper.', '🤝', 'big_idea', 'partnership_actions', 10, 5, 'Partnership'),
  ('Partnership Pro', 'Completed 20 partnership actions. You''ve mastered the art of true partnership.', '🏆', 'big_idea', 'partnership_actions', 20, 10, 'Partnership')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name AND requirement_type = v.requirement_type
)
ON CONFLICT DO NOTHING;

-- Romance Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Romance Revivalist', 'Completed 10 romance actions. You''re bringing the spark back.', '💕', 'big_idea', 'romance_actions', 10, 5, 'Romance'),
  ('Romance Master', 'Completed 20 romance actions. You''ve got this romance thing figured out.', '💑', 'big_idea', 'romance_actions', 20, 10, 'Romance')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name AND requirement_type = v.requirement_type
)
ON CONFLICT DO NOTHING;

-- Gratitude Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Gratitude Guru', 'Completed 10 gratitude actions. You know how to show appreciation.', '🙏', 'big_idea', 'gratitude_actions', 10, 5, 'Gratitude'),
  ('Appreciation Master', 'Completed 20 gratitude actions. You never take her for granted.', '💝', 'big_idea', 'gratitude_actions', 20, 10, 'Gratitude')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name AND requirement_type = v.requirement_type
)
ON CONFLICT DO NOTHING;

-- Conflict Resolution Badges
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT * FROM (VALUES
  ('Peacemaker', 'Completed 10 conflict resolution actions. You handle disagreements like a pro.', '⚖️', 'big_idea', 'conflict_resolution_actions', 10, 5, 'Conflict Resolution'),
  ('Conflict Resolution Master', 'Completed 20 conflict resolution actions. You turn arguments into understanding.', '🕊️', 'big_idea', 'conflict_resolution_actions', 20, 10, 'Conflict Resolution')
) AS v(name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
WHERE NOT EXISTS (
  SELECT 1 FROM badges WHERE name = v.name AND requirement_type = v.requirement_type
)
ON CONFLICT DO NOTHING;

