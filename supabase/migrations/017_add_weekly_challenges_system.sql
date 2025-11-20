-- Create weekly challenges system
-- Challenges are time-bound (7 days) and focus on specific relationship themes

-- ============================================================================
-- CREATE CHALLENGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL, -- e.g., 'communication', 'romance', 'connection', 'roommate_syndrome'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE USER CHALLENGES TABLE (tracks user participation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  joined_date DATE NOT NULL,
  completed_days INTEGER DEFAULT 0, -- Track how many days they've completed
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- ============================================================================
-- CREATE CHALLENGE ACTIONS TABLE (links actions to challenges)
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenge_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL, -- Which day of the challenge (1-7)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, day_number)
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_actions_challenge_id ON challenge_actions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_actions_day ON challenge_actions(challenge_id, day_number);

-- ============================================================================
-- INSERT INITIAL WEEKLY CHALLENGES
-- ============================================================================

-- Challenge 1: Communication Week (starts next Monday)
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Communication Challenge', 'Focus on rebuilding communication and connection. Each day includes a specific action to improve how you talk and listen to each other.', 'communication', 
  CURRENT_DATE + (8 - EXTRACT(DOW FROM CURRENT_DATE)::INT) % 7, -- Next Monday
  CURRENT_DATE + (8 - EXTRACT(DOW FROM CURRENT_DATE)::INT) % 7 + 6, -- Next Sunday
  TRUE);

-- Challenge 2: Roommate Syndrome Recovery (starts the Monday after)
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Roommate Syndrome Recovery', 'Escape roommate syndrome and rebuild your romantic connection. Daily actions to move from roommates back to partners.', 'roommate_syndrome',
  CURRENT_DATE + (8 - EXTRACT(DOW FROM CURRENT_DATE)::INT) % 7 + 7, -- Monday after next
  CURRENT_DATE + (8 - EXTRACT(DOW FROM CURRENT_DATE)::INT) % 7 + 13, -- Sunday after next
  TRUE);

-- Challenge 3: Romance Week (starts 2 weeks from now)
INSERT INTO challenges (name, description, theme, start_date, end_date, is_active) VALUES
('7-Day Romance Challenge', 'Rekindle the romance with daily gestures of love and affection. Small actions that make a big difference.', 'romance',
  CURRENT_DATE + (8 - EXTRACT(DOW FROM CURRENT_DATE)::INT) % 7 + 14, -- 2 weeks from Monday
  CURRENT_DATE + (8 - EXTRACT(DOW FROM CURRENT_DATE)::INT) % 7 + 20, -- Sunday 2 weeks out
  TRUE);

-- ============================================================================
-- LINK ACTIONS TO CHALLENGES
-- ============================================================================

-- Communication Challenge Actions (Day 1-7)
-- Get challenge IDs (we'll use a subquery)
DO $$
DECLARE
  comm_challenge_id UUID;
  roommate_challenge_id UUID;
  romance_challenge_id UUID;
BEGIN
  -- Get Communication Challenge ID
  SELECT id INTO comm_challenge_id FROM challenges WHERE name = '7-Day Communication Challenge' LIMIT 1;
  
  -- Day 1: Active Listening
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT comm_challenge_id, id, 1 FROM actions WHERE name = 'Active Listening Session' LIMIT 1;
  
  -- Day 2: Express Gratitude
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT comm_challenge_id, id, 2 FROM actions WHERE name = 'Express Gratitude' LIMIT 1;
  
  -- Day 3: Share Your Feelings
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT comm_challenge_id, id, 3 FROM actions WHERE name = 'Share Your Feelings' LIMIT 1;
  
  -- Day 4: Daily Check-In
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT comm_challenge_id, id, 4 FROM actions WHERE name = 'Daily Check-In' LIMIT 1;
  
  -- Day 5: Ask About Their Inner World
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT comm_challenge_id, id, 5 FROM actions WHERE name = 'Ask About Their Inner World' LIMIT 1;
  
  -- Day 6: Listen Without Fixing
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT comm_challenge_id, id, 6 FROM actions WHERE name = 'Listen Without Fixing' LIMIT 1;
  
  -- Day 7: State of the Union Conversation
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT comm_challenge_id, id, 7 FROM actions WHERE name = 'State of the Union Conversation' LIMIT 1;
  
  -- Roommate Syndrome Challenge Actions
  SELECT id INTO roommate_challenge_id FROM challenges WHERE name = '7-Day Roommate Syndrome Recovery' LIMIT 1;
  
  -- Day 1: 20-Minute Conversation
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT roommate_challenge_id, id, 1 FROM actions WHERE name = 'Have a 20-Minute Conversation' LIMIT 1;
  
  -- Day 2: Tech-Free Quality Time
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT roommate_challenge_id, id, 2 FROM actions WHERE name = 'Tech-Free Quality Time' LIMIT 1;
  
  -- Day 3: Ask About Inner World
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT roommate_challenge_id, id, 3 FROM actions WHERE name = 'Ask About Their Inner World' LIMIT 1;
  
  -- Day 4: Create a Love Map
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT roommate_challenge_id, id, 4 FROM actions WHERE name = 'Create a Love Map' LIMIT 1;
  
  -- Day 5: Do Something You Used to Enjoy
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT roommate_challenge_id, id, 5 FROM actions WHERE name = 'Do Something You Used to Enjoy' LIMIT 1;
  
  -- Day 6: Practice Turning Toward
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT roommate_challenge_id, id, 6 FROM actions WHERE name = 'Practice Turning Toward' LIMIT 1;
  
  -- Day 7: Plan a Surprise That Shows You Know Them
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT roommate_challenge_id, id, 7 FROM actions WHERE name = 'Plan a Surprise That Shows You Know Them' LIMIT 1;
  
  -- Romance Challenge Actions
  SELECT id INTO romance_challenge_id FROM challenges WHERE name = '7-Day Romance Challenge' LIMIT 1;
  
  -- Day 1: Write a Love Note
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT romance_challenge_id, id, 1 FROM actions WHERE name = 'Write a Love Note' LIMIT 1;
  
  -- Day 2: Compliment Your Partner
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT romance_challenge_id, id, 2 FROM actions WHERE name = 'Compliment Your Partner' LIMIT 1;
  
  -- Day 3: Physical Affection
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT romance_challenge_id, id, 3 FROM actions WHERE name = 'Physical Affection' LIMIT 1;
  
  -- Day 4: Plan a Surprise Date
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT romance_challenge_id, id, 4 FROM actions WHERE name = 'Plan a Surprise Date' LIMIT 1;
  
  -- Day 5: Date Night
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT romance_challenge_id, id, 5 FROM actions WHERE name = 'Date Night' LIMIT 1;
  
  -- Day 6: Love Language Practice
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT romance_challenge_id, id, 6 FROM actions WHERE name = 'Love Language Practice' LIMIT 1;
  
  -- Day 7: Quality Time
  INSERT INTO challenge_actions (challenge_id, action_id, day_number)
  SELECT romance_challenge_id, id, 7 FROM actions WHERE name = 'Quality Time' LIMIT 1;
END $$;

-- ============================================================================
-- ADD CHALLENGE COMPLETION BADGES
-- ============================================================================

-- Add category column to badges table if it doesn't exist
ALTER TABLE badges ADD COLUMN IF NOT EXISTS category TEXT;

INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus, category) VALUES
('Challenge Starter', 'Joined your first weekly challenge', '🎯', 'consistency', 'challenge_joined', 1, 5, 'Challenges'),
('Communication Champion', 'Completed the 7-Day Communication Challenge', '💬', 'consistency', 'challenge_completed', 1, 15, 'Challenges'),
('Connection Restorer', 'Completed the 7-Day Roommate Syndrome Recovery Challenge', '🔗', 'consistency', 'challenge_completed', 1, 15, 'Challenges'),
('Romance Reviver', 'Completed the 7-Day Romance Challenge', '💕', 'consistency', 'challenge_completed', 1, 15, 'Challenges'),
('Challenge Master', 'Completed 3 weekly challenges', '🏆', 'consistency', 'challenge_completed', 3, 25, 'Challenges'),
('Challenge Legend', 'Completed 5 weekly challenges', '👑', 'consistency', 'challenge_completed', 5, 50, 'Challenges');

-- ============================================================================
-- UPDATE FUNCTION FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

