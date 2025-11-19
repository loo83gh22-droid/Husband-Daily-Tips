-- Badges table (definitions of all available badges)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji or icon identifier
  badge_type TEXT NOT NULL CHECK (badge_type IN ('consistency', 'big_idea')),
  requirement_type TEXT NOT NULL, -- e.g., 'streak_days', 'total_actions', 'specific_action'
  requirement_value INTEGER, -- e.g., 7 for 7-day streak
  requirement_metadata JSONB, -- flexible data for complex requirements
  health_bonus INTEGER DEFAULT 0, -- health points awarded when earned
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (track which badges users have earned)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Reflections table (private journal entries when completing tips)
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_tip_id UUID REFERENCES user_tips(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  shared_to_forum BOOLEAN DEFAULT FALSE, -- if user chose to share to Deep Thoughts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deep Thoughts table (shared reflections/forum posts)
CREATE TABLE IF NOT EXISTS deep_thoughts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reflection_id UUID REFERENCES reflections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT, -- optional title for the post
  content TEXT NOT NULL,
  tip_category TEXT, -- category of the tip that inspired this
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments on Deep Thoughts
CREATE TABLE IF NOT EXISTS deep_thoughts_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deep_thought_id UUID NOT NULL REFERENCES deep_thoughts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_deep_thoughts_user_id ON deep_thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_deep_thoughts_created_at ON deep_thoughts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deep_thoughts_comments_deep_thought_id ON deep_thoughts_comments(deep_thought_id);

-- Insert 20 badge definitions
INSERT INTO badges (name, description, icon, badge_type, requirement_type, requirement_value, health_bonus) VALUES
  -- Consistency badges (10)
  ('First Steps', 'Complete your first daily action', '🌱', 'consistency', 'total_actions', 1, 5),
  ('Week Warrior', 'Complete actions for 7 days straight', '🔥', 'consistency', 'streak_days', 7, 15),
  ('Month Master', 'Complete actions for 30 days straight', '💪', 'consistency', 'streak_days', 30, 50),
  ('Century Club', 'Complete 100 total actions', '💯', 'consistency', 'total_actions', 100, 30),
  ('Daily Dedication', 'Complete actions for 14 days straight', '⭐', 'consistency', 'streak_days', 14, 25),
  ('Quarter Champion', 'Complete actions for 90 days straight', '🏆', 'consistency', 'streak_days', 90, 75),
  ('Year Warrior', 'Complete actions for 365 days straight', '👑', 'consistency', 'streak_days', 365, 100),
  ('Early Bird', 'Complete your action before 9 AM for 7 days', '🌅', 'consistency', 'early_morning_streak', 7, 20),
  ('Night Owl', 'Complete your action after 8 PM for 7 days', '🦉', 'consistency', 'evening_streak', 7, 20),
  ('Steady Hand', 'Complete 50 actions without missing a day', '🎯', 'consistency', 'total_actions', 50, 20),
  
  -- Big Idea badges (10)
  ('Romance Rookie', 'Complete 5 romance-focused actions', '💕', 'big_idea', 'category_count', 5, 25),
  ('Communication Champion', 'Complete 10 communication-focused actions', '💬', 'big_idea', 'category_count', 10, 30),
  ('Surprise Specialist', 'Plan and execute 3 surprise dates/activities', '🎁', 'big_idea', 'surprise_actions', 3, 40),
  ('Apology Ace', 'Sincerely apologize and make amends 3 times', '🙏', 'big_idea', 'apology_actions', 3, 35),
  ('Support System', 'Support your partner through a major goal or challenge', '🤝', 'big_idea', 'support_actions', 1, 50),
  ('Date Night Pro', 'Plan and execute 5 quality date nights', '🍷', 'big_idea', 'date_nights', 5, 45),
  ('Gratitude Guru', 'Express specific gratitude 20 times', '🙌', 'big_idea', 'gratitude_actions', 20, 30),
  ('Conflict Resolver', 'Successfully resolve 5 conflicts constructively', '⚖️', 'big_idea', 'conflict_resolutions', 5, 50),
  ('Love Language Learner', 'Actively practice all 5 love languages', '💝', 'big_idea', 'love_languages', 5, 60),
  ('Relationship Architect', 'Complete a major relationship milestone or goal together', '🏗️', 'big_idea', 'milestone_actions', 1, 75);

-- Function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
-- Drop triggers if they exist first (to avoid errors on re-run)
DROP TRIGGER IF EXISTS update_reflections_updated_at ON reflections;
CREATE TRIGGER update_reflections_updated_at BEFORE UPDATE ON reflections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deep_thoughts_updated_at ON deep_thoughts;
CREATE TRIGGER update_deep_thoughts_updated_at BEFORE UPDATE ON deep_thoughts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deep_thoughts_comments_updated_at ON deep_thoughts_comments;
CREATE TRIGGER update_deep_thoughts_comments_updated_at BEFORE UPDATE ON deep_thoughts_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

