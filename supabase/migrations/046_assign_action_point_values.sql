-- Assign health point values (1, 2, or 3) to all actions
-- Based on complexity, depth, and relationship impact
-- 
-- Point Assignment Logic:
-- 1 point: Simple/quick actions (texts, small gestures, basic tasks)
-- 2 points: Moderate/meaningful actions (require more effort or time)
-- 3 points: Significant/deep actions (require planning, vulnerability, or deep connection)

-- ============================================================================
-- COMMUNICATION ACTIONS
-- ============================================================================
UPDATE actions SET health_point_value = 2 WHERE name = 'Ask About Her Day (Actually Listen)';
UPDATE actions SET health_point_value = 3 WHERE name = 'Share Something Vulnerable';
UPDATE actions SET health_point_value = 3 WHERE name = 'Weekly Relationship Check-In';
UPDATE actions SET health_point_value = 1 WHERE name = 'Use "I" Statements';
UPDATE actions SET health_point_value = 2 WHERE name = 'Apologize Without Excuses';
UPDATE actions SET health_point_value = 1 WHERE name = 'Ask "How Can I Help?"';
UPDATE actions SET health_point_value = 1 WHERE name = 'Express Appreciation Verbally';

-- ============================================================================
-- INTIMACY ACTIONS
-- ============================================================================
UPDATE actions SET health_point_value = 2 WHERE name = 'Physical Touch Throughout the Day';
UPDATE actions SET health_point_value = 3 WHERE name = 'Deep Conversation About Dreams';
UPDATE actions SET health_point_value = 1 WHERE name = 'Surprise Affection';
UPDATE actions SET health_point_value = 1 WHERE name = 'Eye Contact During Conversation';
UPDATE actions SET health_point_value = 2 WHERE name = 'Share a Memory Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Ask About Her Feelings';
UPDATE actions SET health_point_value = 2 WHERE name = 'Cuddle Without Expectation';
UPDATE actions SET health_point_value = 3 WHERE name = 'Learn About Her Body';
UPDATE actions SET health_point_value = 2 WHERE name = 'Initiate Physical Intimacy Without Pressure';
UPDATE actions SET health_point_value = 3 WHERE name = 'Have a Conversation About Intimacy';
UPDATE actions SET health_point_value = 3 WHERE name = 'Focus on Her Pleasure';
UPDATE actions SET health_point_value = 2 WHERE name = 'Create Intimacy Without Sex';
UPDATE actions SET health_point_value = 3 WHERE name = 'Plan a Romantic Evening';

-- ============================================================================
-- PARTNERSHIP ACTIONS
-- ============================================================================
UPDATE actions SET health_point_value = 1 WHERE name = 'Do a Chore Without Being Asked';
UPDATE actions SET health_point_value = 1 WHERE name = 'Handle a Responsibility';
UPDATE actions SET health_point_value = 3 WHERE name = 'Make a Decision Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Support Her Goals';
UPDATE actions SET health_point_value = 3 WHERE name = 'Plan Something Together';
UPDATE actions SET health_point_value = 1 WHERE name = 'Take Initiative on Household Task';
UPDATE actions SET health_point_value = 1 WHERE name = 'Ask "What Do You Need?"';
UPDATE actions SET health_point_value = 3 WHERE name = 'Have a Complete Financial Conversation';
UPDATE actions SET health_point_value = 2 WHERE name = 'Review Your Budget Together';
UPDATE actions SET health_point_value = 3 WHERE name = 'Set Financial Goals Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Discuss Money Values';
UPDATE actions SET health_point_value = 2 WHERE name = 'Do a Deep Clean Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Tackle a Cleaning Project';
UPDATE actions SET health_point_value = 2 WHERE name = 'Organize a Cluttered Space';
UPDATE actions SET health_point_value = 2 WHERE name = 'Create a Cleaning Schedule Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Take Full Pet Responsibility for a Week';
UPDATE actions SET health_point_value = 1 WHERE name = 'Handle Pet Poop Patrol Completely';
UPDATE actions SET health_point_value = 2 WHERE name = 'Research Pet Care Before Getting One';
UPDATE actions SET health_point_value = 2 WHERE name = 'Create a Pet Care Plan Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Make Mom Breakfast in Bed';
UPDATE actions SET health_point_value = 2 WHERE name = 'Write and Read a Poem About Her';
UPDATE actions SET health_point_value = 2 WHERE name = 'Take the Kids Out So Mom Gets a Break';
UPDATE actions SET health_point_value = 2 WHERE name = 'Plan a Family Activity for Mom';
UPDATE actions SET health_point_value = 2 WHERE name = 'Create a Mom Appreciation Day';
UPDATE actions SET health_point_value = 1 WHERE name = 'Handle Bedtime Routine So Mom Can Relax';

-- ============================================================================
-- ROMANCE ACTIONS
-- ============================================================================
UPDATE actions SET health_point_value = 2 WHERE name = 'Write a Love Note';
UPDATE actions SET health_point_value = 3 WHERE name = 'Plan a Surprise Date';
UPDATE actions SET health_point_value = 1 WHERE name = 'Give a Genuine Compliment';
UPDATE actions SET health_point_value = 1 WHERE name = 'Bring Her a Small Gift';
UPDATE actions SET health_point_value = 1 WHERE name = 'Dress Up for Her';
UPDATE actions SET health_point_value = 3 WHERE name = 'Recreate a First Date';
UPDATE actions SET health_point_value = 1 WHERE name = 'Tell Her Why You Love Her';
UPDATE actions SET health_point_value = 2 WHERE name = 'Cook Her Favorite Meal';
UPDATE actions SET health_point_value = 3 WHERE name = 'Have a Cooking Date Night';
UPDATE actions SET health_point_value = 2 WHERE name = 'Try The Adventure Challenge Couples Edition';

-- ============================================================================
-- GRATITUDE ACTIONS
-- ============================================================================
UPDATE actions SET health_point_value = 1 WHERE name = 'Thank Her for Something Specific';
UPDATE actions SET health_point_value = 2 WHERE name = 'Write a Gratitude List';
UPDATE actions SET health_point_value = 1 WHERE name = 'Celebrate Her Win';
UPDATE actions SET health_point_value = 1 WHERE name = 'Acknowledge Her Effort';
UPDATE actions SET health_point_value = 2 WHERE name = 'Express Appreciation Publicly';
UPDATE actions SET health_point_value = 2 WHERE name = 'Thank Her for Being Her';
UPDATE actions SET health_point_value = 1 WHERE name = 'Notice and Mention Small Things';

-- ============================================================================
-- CONFLICT RESOLUTION ACTIONS
-- ============================================================================
UPDATE actions SET health_point_value = 1 WHERE name = 'Use "I" Statements in Disagreement';
UPDATE actions SET health_point_value = 1 WHERE name = 'Take a Break When Heated';
UPDATE actions SET health_point_value = 2 WHERE name = 'Apologize First';
UPDATE actions SET health_point_value = 2 WHERE name = 'Listen Without Defending';
UPDATE actions SET health_point_value = 2 WHERE name = 'Find Common Ground';
UPDATE actions SET health_point_value = 2 WHERE name = 'Take Responsibility';
UPDATE actions SET health_point_value = 2 WHERE name = 'Propose a Solution';

-- ============================================================================
-- RECONNECTION ACTIONS
-- ============================================================================
UPDATE actions SET health_point_value = 2 WHERE name = 'Tech-Free Time Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Ask "How Are You Really?"';
UPDATE actions SET health_point_value = 3 WHERE name = 'Do Something New Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Reminisce About Good Times';
UPDATE actions SET health_point_value = 3 WHERE name = 'Have a Real Conversation';
UPDATE actions SET health_point_value = 2 WHERE name = 'Show Interest in Her Interests';
UPDATE actions SET health_point_value = 1 WHERE name = 'Be Present';
UPDATE actions SET health_point_value = 3 WHERE name = 'Cook a Meal Together';
UPDATE actions SET health_point_value = 3 WHERE name = 'Try a New Recipe Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Play We''re Not Really Strangers';
UPDATE actions SET health_point_value = 2 WHERE name = 'Try The Gottman Card Decks App';
UPDATE actions SET health_point_value = 2 WHERE name = 'Play TableTopics for Couples';
UPDATE actions SET health_point_value = 2 WHERE name = 'Play Intimacy Building Games';

-- ============================================================================
-- QUALITY TIME ACTIONS
-- ============================================================================
UPDATE actions SET health_point_value = 2 WHERE name = 'Go for a Walk Together';
UPDATE actions SET health_point_value = 3 WHERE name = 'Cook a Meal Together';
UPDATE actions SET health_point_value = 1 WHERE name = 'Watch a Show Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Play a Game Together';
UPDATE actions SET health_point_value = 3 WHERE name = 'Go on a Date';
UPDATE actions SET health_point_value = 3 WHERE name = 'Work on a Project Together';
UPDATE actions SET health_point_value = 2 WHERE name = 'Just Sit and Talk';

-- ============================================================================
-- ROOMMATE SYNDROME RECOVERY ACTIONS
-- ============================================================================
UPDATE actions SET health_point_value = 2 WHERE name = 'Have a 20-Minute Conversation';
UPDATE actions SET health_point_value = 3 WHERE name = 'Ask About Their Inner World';
UPDATE actions SET health_point_value = 3 WHERE name = 'State of the Union Conversation';
UPDATE actions SET health_point_value = 2 WHERE name = 'Do Something You Used to Enjoy';
UPDATE actions SET health_point_value = 2 WHERE name = 'Plan a Surprise That Shows You Know Them';
UPDATE actions SET health_point_value = 2 WHERE name = 'Listen Without Fixing';
UPDATE actions SET health_point_value = 2 WHERE name = 'Share One Feeling Today';
UPDATE actions SET health_point_value = 2 WHERE name = 'Ask: What Can I Do to Make You Feel More Loved?';
UPDATE actions SET health_point_value = 1 WHERE name = 'Practice the 5:1 Ratio';
UPDATE actions SET health_point_value = 3 WHERE name = 'Create a Love Map';
UPDATE actions SET health_point_value = 1 WHERE name = 'Practice Turning Toward';
UPDATE actions SET health_point_value = 2 WHERE name = 'Share Gratitude for Who They Are';
UPDATE actions SET health_point_value = 2 WHERE name = 'Tech-Free Quality Time';
UPDATE actions SET health_point_value = 3 WHERE name = 'Weekly Date Night Conversation';
UPDATE actions SET health_point_value = 1 WHERE name = 'Morning or Evening Ritual';
UPDATE actions SET health_point_value = 2 WHERE name = 'Non-Sexual Physical Touch';
UPDATE actions SET health_point_value = 1 WHERE name = 'Sit Close and Talk';

-- ============================================================================
-- OUTDOOR/ACTIVE ACTIONS (if they exist)
-- ============================================================================
UPDATE actions SET health_point_value = 2 WHERE name = 'Go for a Hike Together';
UPDATE actions SET health_point_value = 1 WHERE name = 'Morning Walk';
UPDATE actions SET health_point_value = 1 WHERE name = 'Evening Stroll';
UPDATE actions SET health_point_value = 2 WHERE name = 'Go Streaking (Alone Together)';

-- ============================================================================
-- SET DEFAULT FOR ANY REMAINING ACTIONS
-- ============================================================================
-- If any actions don't have a point value assigned, default to 2 (moderate)
UPDATE actions SET health_point_value = 2 WHERE health_point_value IS NULL;

-- Add comment documenting the point system
COMMENT ON COLUMN actions.health_point_value IS 'Health points earned for completing this action: 1 = simple/quick, 2 = moderate/meaningful, 3 = significant/deep. Subject to daily (3) and weekly (15) caps, repetition penalties, and decay.';

