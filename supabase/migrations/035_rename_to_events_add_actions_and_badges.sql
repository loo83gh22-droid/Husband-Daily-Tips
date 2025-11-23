-- Rename challenges to events with more creative names
-- Add more actions where needed to ensure each category has at least 7
-- Create badges for completing each event

-- ============================================================================
-- UPDATE EXISTING CHALLENGES TO CREATIVE EVENT NAMES
-- ============================================================================

-- Communication Event: "The Conversation Upgrade"
UPDATE challenges 
SET name = 'The Conversation Upgrade',
    description = '7 days. 7 chances to stop talking AT her and start talking WITH her. Real conversations, not surface-level stuff. The guy who listens? That''s the guy who wins. Let''s upgrade your conversation game.'
WHERE theme = 'communication' AND name LIKE '%Communication%';

-- Intimacy Event: "The Deep Connection"
UPDATE challenges 
SET name = 'The Deep Connection',
    description = 'Rebuild the connection that got you here in the first place. 7 days of actions that bring you closer—emotionally and physically. Intimacy isn''t just about the bedroom. It''s about being truly seen and understood.'
WHERE theme = 'intimacy' AND name LIKE '%Intimacy%';

-- Partnership Event: "The True Partner"
UPDATE challenges 
SET name = 'The True Partner',
    description = 'Be a true partner, not just a roommate. 7 days of actions that show you''re in this together. From household stuff to big decisions, let''s make sure you''re actually partnering, not just co-existing.'
WHERE theme = 'partnership' AND name LIKE '%Partnership%';

-- Romance Event: "The Spark Revival"
UPDATE challenges 
SET name = 'The Spark Revival',
    description = 'Remember when you used to actually try? Yeah, her too. 7 days of small moves that make big impressions. Romance isn''t dead—it just needs a daily dose of intentional action. Let''s bring the spark back, one gesture at a time.'
WHERE theme = 'romance' AND name LIKE '%Romance%';

-- Gratitude Event: "The Appreciation Week"
UPDATE challenges 
SET name = 'The Appreciation Week',
    description = 'Appreciate what you have. Recognize what she does. 7 days of actions that show you notice and you care. Gratitude isn''t just saying thanks—it''s showing you see her. Let''s make appreciation a daily habit.'
WHERE theme = 'gratitude' AND name LIKE '%Gratitude%';

-- Conflict Resolution Event: "The Peacemaker Protocol"
UPDATE challenges 
SET name = 'The Peacemaker Protocol',
    description = 'Handle disagreements like partners, not opponents. 7 days of actions that turn arguments into understanding. Conflict happens. How you handle it? That''s what separates roommates from partners.'
WHERE theme = 'conflict_resolution' AND name LIKE '%Conflict%';

-- Reconnection Event: "The Roommate Recovery"
UPDATE challenges 
SET name = 'The Roommate Recovery',
    description = 'Newsflash: You''re not roommates. You''re partners. But somewhere along the way, that got blurry. 7 days to rediscover what you two actually are. Daily actions to move from "Hey, did you pay the electric bill?" back to "Hey, I actually missed you today."'
WHERE theme = 'reconnection' AND name LIKE '%Reconnection%';

-- Quality Time Event: "The Together Time"
UPDATE challenges 
SET name = 'The Together Time',
    description = 'Spend meaningful time together—indoors or outdoors, active or chill. 7 days of actions that prioritize "us" time. Quality time isn''t about what you do, it''s about being present. Let''s make time together actually count.'
WHERE theme = 'quality_time' AND name LIKE '%Quality Time%';

-- ============================================================================
-- ADD MORE ACTIONS WHERE NEEDED (ensure each category has at least 7)
-- ============================================================================

-- Communication Actions (add if less than 7 exist)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Ask About Her Day (Actually Listen)', 'When she tells you about her day, put down your phone. Make eye contact. Ask follow-up questions. Show you''re actually interested, not just waiting for your turn to talk.', 'Communication', 'communication', 'daily', '👂', 'Research shows active listening increases relationship satisfaction and reduces misunderstandings.', 1),
  ('Share Something Vulnerable', 'Open up about something you''re feeling or experiencing. Be real. Vulnerability builds trust and deepens connection.', 'Communication', 'communication', 'daily', '💙', 'Vulnerability creates intimacy and shows you trust her with your real self.', 1),
  ('Weekly Relationship Check-In', 'Set aside 30 minutes to check in. What''s working? What isn''t? How can you both improve? Make it a regular thing.', 'Communication', 'communication', 'weekly', '💬', 'Regular check-ins prevent small issues from becoming big problems.', 1),
  ('Use "I" Statements', 'When discussing something difficult, use "I feel" instead of "You always." It''s less defensive and more productive.', 'Communication', 'communication', 'daily', '🗣️', 'I-statements reduce defensiveness and open up real dialogue.', 1),
  ('Apologize Without Excuses', 'When you mess up, apologize genuinely. No "but you also..." No excuses. Just own it and commit to doing better.', 'Communication', 'communication', 'daily', '🙏', 'Sincere apologies repair trust and show emotional maturity.', 1),
  ('Ask "How Can I Help?"', 'Instead of waiting to be asked, proactively ask how you can help. Show you''re paying attention and want to support her.', 'Communication', 'communication', 'daily', '🤝', 'Proactive support shows you''re a true partner, not just a helper when asked.', 1),
  ('Express Appreciation Verbally', 'Tell her something specific you appreciate about her. Not just "thanks"—be specific about what and why.', 'Communication', 'communication', 'daily', '💬', 'Specific appreciation makes her feel seen and valued.', 1)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'communication' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'communication') < 7;

-- Intimacy Actions (add if less than 7 exist)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Physical Touch Throughout the Day', 'Give her 5 meaningful touches today—hug, kiss, hand hold, back rub. Physical touch builds connection.', 'Intimacy', 'intimacy', 'daily', '💝', 'Physical touch releases oxytocin, the bonding hormone, strengthening your connection.', 2),
  ('Deep Conversation About Dreams', 'Ask about her dreams, goals, or fears. Go beyond surface level. Show you want to know her deeply.', 'Intimacy', 'intimacy', 'daily', '💭', 'Deep conversations create emotional intimacy and strengthen your bond.', 2),
  ('Surprise Affection', 'Randomly hug her, kiss her forehead, or hold her hand. No reason needed. Just because.', 'Intimacy', 'intimacy', 'daily', '💕', 'Unexpected affection shows you think about her even when she''s not asking for it.', 2),
  ('Eye Contact During Conversation', 'When she''s talking, look her in the eyes. Not at your phone. Not at the TV. At her. Show she has your full attention.', 'Intimacy', 'intimacy', 'daily', '👀', 'Eye contact shows respect and creates deeper connection during conversations.', 2),
  ('Share a Memory Together', 'Reminisce about a favorite memory. Laugh about it. Relive it. Remind yourselves why you''re together.', 'Intimacy', 'intimacy', 'daily', '📸', 'Shared memories reinforce your bond and remind you of your history together.', 2),
  ('Ask About Her Feelings', 'Check in on how she''s feeling—not just what she''s doing. Show you care about her emotional state.', 'Intimacy', 'intimacy', 'daily', '💙', 'Emotional check-ins show you care about her inner world, not just surface stuff.', 2),
  ('Cuddle Without Expectation', 'Cuddle her with zero expectation of it leading anywhere. Just be close. Just enjoy the connection.', 'Intimacy', 'intimacy', 'daily', '🤗', 'Non-sexual physical intimacy builds trust and emotional closeness.', 2)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'intimacy' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'intimacy') < 7;

-- Partnership Actions (add if less than 7 exist)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Do a Chore Without Being Asked', 'Notice something that needs doing. Do it. Don''t wait to be asked. Show you''re paying attention.', 'Partnership', 'partnership', 'daily', '🧹', 'Proactive household help shows you''re a true partner, not just a helper when asked.', 3),
  ('Handle a Responsibility', 'Take on one of her regular responsibilities today. Give her a break. Show you''re in this together.', 'Partnership', 'partnership', 'daily', '🤝', 'Sharing responsibilities reduces her mental load and shows true partnership.', 3),
  ('Make a Decision Together', 'For something that affects both of you, ask her opinion. Make the decision together. Show you value her input.', 'Partnership', 'partnership', 'daily', '🤝', 'Shared decision-making shows respect and creates true partnership.', 3),
  ('Support Her Goals', 'Ask about her goals. Celebrate progress. Help her overcome obstacles. Show you''re her biggest cheerleader.', 'Partnership', 'partnership', 'daily', '🎯', 'Supporting her goals shows you care about her as an individual, not just as your partner.', 3),
  ('Plan Something Together', 'Plan a date, a trip, or a project together. Collaborate. Show you value her ideas and input.', 'Partnership', 'partnership', 'daily', '📅', 'Collaborative planning builds teamwork and shows you''re true partners.', 3),
  ('Take Initiative on Household Task', 'See something that needs doing? Do it. Don''t wait. Don''t ask. Just handle it.', 'Partnership', 'partnership', 'daily', '🏠', 'Taking initiative reduces her mental load and shows you''re an equal partner.', 3),
  ('Ask "What Do You Need?"', 'Check in on what she needs today. Not what you think she needs—ask her. Then do it.', 'Partnership', 'partnership', 'daily', '❓', 'Asking what she needs shows you care about her actual needs, not your assumptions.', 3)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'partnership' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'partnership') < 7;

-- Romance Actions (add if less than 7 exist)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Write a Love Note', 'Write her a handwritten note. Tell her something specific you love about her. Leave it where she''ll find it.', 'Romance', 'romance', 'daily', '💌', 'Handwritten notes show thoughtfulness and effort, making her feel special.', 4),
  ('Plan a Surprise Date', 'Plan something special for just the two of you. It doesn''t have to be expensive—thoughtful matters more.', 'Romance', 'romance', 'weekly', '💕', 'Surprise dates show you''re thinking about her and prioritizing your relationship.', 4),
  ('Give a Genuine Compliment', 'Compliment her on something specific—her character, her actions, her qualities. Be genuine and specific.', 'Romance', 'romance', 'daily', '✨', 'Specific compliments make her feel seen and appreciated for who she is.', 4),
  ('Bring Her a Small Gift', 'Bring her something small—her favorite coffee, a flower, a snack she likes. Show you''re thinking about her.', 'Romance', 'romance', 'daily', '🎁', 'Small gifts show thoughtfulness and that you pay attention to what she likes.', 4),
  ('Dress Up for Her', 'Put in a little extra effort with your appearance. Show you still want to look good for her.', 'Romance', 'romance', 'daily', '👔', 'Making an effort with your appearance shows you still care about impressing her.', 4),
  ('Recreate a First Date', 'Recreate your first date or a favorite early memory. Relive the magic. Remind yourselves why you fell in love.', 'Romance', 'romance', 'weekly', '💑', 'Recreating special moments reinforces your bond and reminds you of your love story.', 4),
  ('Tell Her Why You Love Her', 'Tell her something specific you love about her. Not just "I love you"—be specific about what and why.', 'Romance', 'romance', 'daily', '💝', 'Specific expressions of love make her feel deeply valued and understood.', 4)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'romance' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'romance') < 7;

-- Gratitude Actions (add if less than 7 exist)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Thank Her for Something Specific', 'Thank her for something specific she did today. Be specific about what and why it mattered.', 'Gratitude', 'gratitude', 'daily', '🙏', 'Specific gratitude shows you notice and appreciate her efforts.', 5),
  ('Write a Gratitude List', 'Write down 5 things you''re grateful for about her or your relationship. Share it with her.', 'Gratitude', 'gratitude', 'daily', '📝', 'Gratitude lists shift focus to the positive and strengthen appreciation.', 5),
  ('Celebrate Her Win', 'Did she accomplish something? Celebrate it. Make a big deal. Show you''re proud of her.', 'Gratitude', 'gratitude', 'daily', '🎉', 'Celebrating her wins shows you''re her biggest supporter and cheerleader.', 5),
  ('Acknowledge Her Effort', 'Notice something she did that took effort. Acknowledge it. Show you see the work she puts in.', 'Gratitude', 'gratitude', 'daily', '👏', 'Acknowledging effort shows you appreciate not just results, but the work behind them.', 5),
  ('Express Appreciation Publicly', 'Tell someone else (friend, family) something you appreciate about her. Let her overhear or tell her about it.', 'Gratitude', 'gratitude', 'weekly', '📢', 'Public appreciation shows you''re proud of her and value her highly.', 5),
  ('Thank Her for Being Her', 'Thank her for who she is, not just what she does. Show you appreciate her as a person.', 'Gratitude', 'gratitude', 'daily', '💝', 'Appreciating her essence, not just her actions, makes her feel deeply valued.', 5),
  ('Notice and Mention Small Things', 'Notice the small things she does—making coffee, picking up after you, whatever. Mention it. Show you see her.', 'Gratitude', 'gratitude', 'daily', '👀', 'Noticing small things shows you pay attention and don''t take her for granted.', 5)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'gratitude' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'gratitude') < 7;

-- Conflict Resolution Actions (add if less than 7 exist)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Use "I" Statements in Disagreement', 'When you disagree, use "I feel" instead of "You always." It''s less defensive and opens dialogue.', 'Conflict Resolution', 'conflict_resolution', 'daily', '🗣️', 'I-statements reduce defensiveness and create space for understanding.', 6),
  ('Take a Break When Heated', 'If things get too heated, suggest a break. Cool down. Come back to it when you can both think clearly.', 'Conflict Resolution', 'conflict_resolution', 'daily', '🧘', 'Taking breaks prevents saying things you''ll regret and allows for calmer resolution.', 6),
  ('Apologize First', 'Even if you think you''re both wrong, apologize first. Take responsibility for your part. Show maturity.', 'Conflict Resolution', 'conflict_resolution', 'daily', '🙏', 'Apologizing first breaks the cycle of blame and opens the door to resolution.', 6),
  ('Listen Without Defending', 'When she''s upset, listen. Don''t defend. Don''t explain. Just hear her. Show you understand her perspective.', 'Conflict Resolution', 'conflict_resolution', 'daily', '👂', 'Listening without defending shows you value her feelings over being right.', 6),
  ('Find Common Ground', 'In a disagreement, find what you both agree on. Build from there. Show you''re on the same team.', 'Conflict Resolution', 'conflict_resolution', 'daily', '🤝', 'Finding common ground shifts focus from opposition to collaboration.', 6),
  ('Take Responsibility', 'Own your part in the conflict. Don''t make excuses. Show you can take responsibility.', 'Conflict Resolution', 'conflict_resolution', 'daily', '✅', 'Taking responsibility shows maturity and creates space for resolution.', 6),
  ('Propose a Solution', 'After understanding the issue, propose a solution. Show you''re committed to fixing things, not just talking about them.', 'Conflict Resolution', 'conflict_resolution', 'daily', '💡', 'Proposing solutions shows you''re committed to resolution, not just discussion.', 6)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'conflict_resolution' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'conflict_resolution') < 7;

-- Reconnection Actions (add if less than 7 exist)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Tech-Free Time Together', 'Put away phones, tablets, everything. Spend 30 minutes just being together. No distractions.', 'Reconnection', 'reconnection', 'daily', '📵', 'Tech-free time creates space for real connection without distractions.', 7),
  ('Ask "How Are You Really?"', 'Ask how she''s really doing. Not the surface answer. Go deeper. Show you want to know.', 'Reconnection', 'reconnection', 'daily', '💭', 'Deep check-ins show you care about her inner world, not just surface stuff.', 7),
  ('Do Something New Together', 'Try something new together—a new restaurant, activity, or experience. Create new shared memories.', 'Reconnection', 'reconnection', 'weekly', '🆕', 'New experiences create shared memories and break out of routine.', 7),
  ('Reminisce About Good Times', 'Look at old photos or talk about favorite memories. Remind yourselves why you''re together.', 'Reconnection', 'reconnection', 'daily', '📸', 'Reminiscing reinforces your bond and reminds you of your shared history.', 7),
  ('Have a Real Conversation', 'Have a conversation that''s not about logistics or kids or work. Talk about dreams, fears, hopes.', 'Reconnection', 'reconnection', 'daily', '💬', 'Real conversations create emotional intimacy and deepen connection.', 7),
  ('Show Interest in Her Interests', 'Ask about something she''s interested in. Show genuine curiosity. Learn about what matters to her.', 'Reconnection', 'reconnection', 'daily', '🎯', 'Showing interest in her interests shows you care about her as an individual.', 7),
  ('Be Present', 'When you''re together, be there. Not thinking about work. Not on your phone. Just present with her.', 'Reconnection', 'reconnection', 'daily', '🧘', 'Being present shows you value your time together and prioritize the relationship.', 7)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'reconnection' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'reconnection') < 7;

-- Quality Time Actions (add if less than 7 exist)
INSERT INTO actions (name, description, category, theme, requirement_type, icon, benefit, display_order)
SELECT * FROM (VALUES
  ('Go for a Walk Together', 'Take a walk together. No agenda. Just be together. Talk. Connect. Enjoy each other''s company.', 'Quality Time', 'quality_time', 'daily', '🚶', 'Walking together creates space for conversation and connection.', 8),
  ('Cook a Meal Together', 'Cook something together. Collaborate. Have fun. Enjoy the process, not just the result.', 'Quality Time', 'quality_time', 'daily', '👨‍🍳', 'Cooking together is collaborative and creates shared accomplishment.', 8),
  ('Watch a Show Together', 'Pick something you both want to watch. Actually watch it together. No phones. Just together.', 'Quality Time', 'quality_time', 'daily', '📺', 'Shared entertainment creates common experiences and conversation topics.', 8),
  ('Play a Game Together', 'Play a board game, card game, or video game together. Have fun. Be playful. Enjoy each other.', 'Quality Time', 'quality_time', 'daily', '🎲', 'Playing together brings out playfulness and creates fun shared memories.', 8),
  ('Go on a Date', 'Plan a date. It doesn''t have to be fancy. Just intentional time together doing something you both enjoy.', 'Quality Time', 'quality_time', 'weekly', '💑', 'Regular dates keep the relationship fresh and show you prioritize time together.', 8),
  ('Work on a Project Together', 'Do a home project, plan something, or work on a shared goal together. Collaborate and connect.', 'Quality Time', 'quality_time', 'weekly', '🔨', 'Collaborative projects build teamwork and create shared accomplishment.', 8),
  ('Just Sit and Talk', 'Sit together. No agenda. No TV. No phones. Just talk. See where the conversation goes.', 'Quality Time', 'quality_time', 'daily', '💬', 'Unstructured time together allows for natural connection and deeper conversations.', 8)
) AS v(name, description, category, theme, requirement_type, icon, benefit, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM actions WHERE theme = 'quality_time' AND name = v.name
)
AND (SELECT COUNT(*) FROM actions WHERE theme = 'quality_time') < 7;

-- ============================================================================
-- CREATE BADGES FOR EACH EVENT COMPLETION
-- ============================================================================

-- Communication Event Badge
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 'Conversation Master', 'Completed The Conversation Upgrade event', '💬', 'event', 'event_completion', 1, 10, 'Communication'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Conversation Master' AND requirement_type = 'event_completion');

-- Intimacy Event Badge
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 'Deep Connection Champion', 'Completed The Deep Connection event', '💝', 'event', 'event_completion', 1, 10, 'Intimacy'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Deep Connection Champion' AND requirement_type = 'event_completion');

-- Partnership Event Badge
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 'True Partner', 'Completed The True Partner event', '🤝', 'event', 'event_completion', 1, 10, 'Partnership'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'True Partner' AND requirement_type = 'event_completion');

-- Romance Event Badge
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 'Spark Reviver', 'Completed The Spark Revival event', '💕', 'event', 'event_completion', 1, 10, 'Romance'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Spark Reviver' AND requirement_type = 'event_completion');

-- Gratitude Event Badge
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 'Appreciation Expert', 'Completed The Appreciation Week event', '🙏', 'event', 'event_completion', 1, 10, 'Gratitude'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Appreciation Expert' AND requirement_type = 'event_completion');

-- Conflict Resolution Event Badge
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 'Peacemaker', 'Completed The Peacemaker Protocol event', '⚖️', 'event', 'event_completion', 1, 10, 'Conflict Resolution'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Peacemaker' AND requirement_type = 'event_completion');

-- Reconnection Event Badge
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 'Reconnection Pro', 'Completed The Roommate Recovery event', '🔗', 'event', 'event_completion', 1, 10, 'Reconnection'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Reconnection Pro' AND requirement_type = 'event_completion');

-- Quality Time Event Badge
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category)
SELECT 'Together Time Champion', 'Completed The Together Time event', '⏰', 'event', 'event_completion', 1, 10, 'Quality Time'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE name = 'Together Time Champion' AND requirement_type = 'event_completion');

