# Database Migration Steps - Supabase

Follow these steps **in order** to set up your database. Each migration builds on the previous one.

---

## Step 1: Open Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

---

## Step 2: Run Migration 002 - Badges and Reflections

**Copy and paste this ENTIRE block into the SQL Editor:**

```sql
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
```

**Then:**
1. Click **"Run"** button (or press Ctrl+Enter)
2. Wait for "Success" message
3. You should see "Success. No rows returned" or similar

---

## Step 3: Run Migration 003 - Recurring Tips and Calendar

**Copy and paste this ENTIRE block into a NEW query:**

```sql
-- Add recurring tip fields to tips table
ALTER TABLE tips ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'monthly', 'yearly'));
ALTER TABLE tips ADD COLUMN IF NOT EXISTS recurrence_day INTEGER; -- Day of week (0=Sunday) or day of month
ALTER TABLE tips ADD COLUMN IF NOT EXISTS recurrence_time TIME; -- Optional time of day

-- Track recurring tip completions
CREATE TABLE IF NOT EXISTS recurring_tip_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tip_id, scheduled_date)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_recurring_tip_completions_user_id ON recurring_tip_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tip_completions_tip_id ON recurring_tip_completions(tip_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tip_completions_scheduled_date ON recurring_tip_completions(scheduled_date);

-- Update the Weekly Relationship Check-In tip to be recurring (Sundays)
UPDATE tips 
SET is_recurring = TRUE, 
    recurrence_type = 'weekly', 
    recurrence_day = 0 
WHERE title = 'Weekly Relationship Check-In';

-- User calendar preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS calendar_preferences JSONB DEFAULT '{}'::jsonb;
```

**Then:**
1. Click **"Run"** button
2. Wait for "Success" message

---

## Step 4: Run Migration 004 - Challenges

**Copy and paste this ENTIRE block into a NEW query:**

```sql
-- Challenges table (individual tasks users can complete to earn badges)
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  theme TEXT NOT NULL,
  requirement_type TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User challenge completions (track which challenges users have completed)
CREATE TABLE IF NOT EXISTS user_challenge_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT, -- Optional notes about completion
  UNIQUE(user_id, challenge_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_theme ON challenges(theme);
CREATE INDEX IF NOT EXISTS idx_challenges_requirement_type ON challenges(requirement_type);
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_user_id ON user_challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_challenge_id ON user_challenge_completions(challenge_id);

-- Insert challenges organized by theme/category
-- Communication Challenges
INSERT INTO challenges (name, description, category, theme, requirement_type, icon) VALUES
('Active Listening Session', 'Spend 15 minutes listening to your partner without offering solutions or advice. Just listen and understand.', 'Communication', 'communication', 'category_count', '👂'),
('Express Gratitude', 'Tell your partner one specific thing you''re grateful for about them today.', 'Communication', 'gratitude', 'gratitude_actions', '🙏'),
('Apologize Sincerely', 'Apologize for something specific without making excuses. Acknowledge the impact.', 'Communication', 'communication', 'apology_actions', '💬'),
('Daily Check-In', 'Ask your partner: "How was your day?" and genuinely listen to their response.', 'Communication', 'communication', 'category_count', '💭'),
('Share Your Feelings', 'Open up about something you''re feeling or experiencing. Be vulnerable.', 'Communication', 'communication', 'category_count', '💙');

-- Romance Challenges
INSERT INTO challenges (name, description, category, theme, requirement_type, icon) VALUES
('Plan a Surprise Date', 'Plan and execute a surprise date or activity for your partner.', 'Romance', 'romance', 'surprise_actions', '🎁'),
('Write a Love Note', 'Write a handwritten note expressing your love and appreciation.', 'Romance', 'romance', 'category_count', '💕'),
('Date Night', 'Plan and execute a quality date night together.', 'Romance', 'romance', 'date_nights', '🍷'),
('Physical Affection', 'Give your partner 5 meaningful touches throughout the day (hug, kiss, hand hold, etc.).', 'Romance', 'romance', 'category_count', '💋'),
('Compliment Your Partner', 'Give your partner a genuine, specific compliment about their character or actions.', 'Romance', 'romance', 'category_count', '✨');

-- Gratitude Challenges
INSERT INTO challenges (name, description, category, theme, requirement_type, icon) VALUES
('Gratitude List', 'List 5 things you''re grateful for about your partner today.', 'Gratitude', 'gratitude', 'gratitude_actions', '📝'),
('Thank You for Chores', 'Thank your partner for something they did around the house without being asked.', 'Gratitude', 'gratitude', 'gratitude_actions', '🙌'),
('Appreciate Their Effort', 'Acknowledge and appreciate a specific effort your partner made recently.', 'Gratitude', 'gratitude', 'gratitude_actions', '🌟'),
('Gratitude Text', 'Send your partner a text expressing gratitude for something they did.', 'Gratitude', 'gratitude', 'gratitude_actions', '📱'),
('Morning Gratitude', 'Start the day by telling your partner one thing you appreciate about them.', 'Gratitude', 'gratitude', 'gratitude_actions', '🌅');

-- Partnership Challenges
INSERT INTO challenges (name, description, category, theme, requirement_type, icon) VALUES
('Take Over a Chore', 'Do one of your partner''s regular chores without being asked.', 'Partnership', 'partnership', 'category_count', '🧹'),
('Support Their Goal', 'Ask about and actively support one of your partner''s personal or professional goals.', 'Partnership', 'partnership', 'support_actions', '💪'),
('Handle a Responsibility', 'Take on one of your partner''s responsibilities to give them a break.', 'Partnership', 'partnership', 'category_count', '🤝'),
('Plan Together', 'Sit down and plan something together (vacation, home project, weekend, etc.).', 'Partnership', 'partnership', 'category_count', '📅'),
('Be Proactive', 'Notice something that needs to be done and do it without being asked.', 'Partnership', 'partnership', 'category_count', '⚡');

-- Intimacy Challenges
INSERT INTO challenges (name, description, category, theme, requirement_type, icon) VALUES
('Love Language Practice', 'Practice one of the 5 love languages intentionally today.', 'Intimacy', 'intimacy', 'love_languages', '💝'),
('Quality Time', 'Spend 30 minutes of uninterrupted quality time with your partner (no phones).', 'Intimacy', 'intimacy', 'category_count', '⏰'),
('Physical Touch', 'Initiate physical affection (hug, kiss, cuddle) without expecting anything in return.', 'Intimacy', 'intimacy', 'category_count', '🤗'),
('Acts of Service', 'Do something helpful for your partner as an act of service.', 'Intimacy', 'intimacy', 'love_languages', '🛠️'),
('Words of Affirmation', 'Give your partner specific words of affirmation about who they are.', 'Intimacy', 'intimacy', 'love_languages', '💬');

-- Conflict Resolution Challenges
INSERT INTO challenges (name, description, category, theme, requirement_type, icon) VALUES
('Resolve a Disagreement', 'Successfully resolve a disagreement using "I" statements and active listening.', 'Conflict Resolution', 'conflict', 'conflict_resolutions', '⚖️'),
('Take Responsibility', 'Take responsibility for your part in a conflict without blaming.', 'Conflict Resolution', 'conflict', 'conflict_resolutions', '🙋'),
('Find Common Ground', 'Find common ground in a disagreement and work toward a solution together.', 'Conflict Resolution', 'conflict', 'conflict_resolutions', '🤝'),
('Stay Calm', 'Stay calm and respectful during a disagreement, even when emotions run high.', 'Conflict Resolution', 'conflict', 'conflict_resolutions', '🧘'),
('Apologize and Make Amends', 'Apologize for a mistake and take concrete steps to make amends.', 'Conflict Resolution', 'conflict', 'conflict_resolutions', '💚');

-- Update updated_at trigger
-- Drop trigger if it exists first (to avoid errors on re-run)
DROP TRIGGER IF EXISTS update_challenges_updated_at ON challenges;
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Then:**
1. Click **"Run"** button
2. Wait for "Success" message
3. This will create 30 challenges

---

## Step 5: Run Migration 005 - Multiple Challenge Completions

**Copy and paste this ENTIRE block into a NEW query:**

```sql
-- Allow multiple completions of the same challenge
-- Remove the UNIQUE constraint and add notes field

-- Drop the unique constraint
ALTER TABLE user_challenge_completions DROP CONSTRAINT IF EXISTS user_challenge_completions_user_id_challenge_id_key;

-- Add notes field if it doesn't exist (it should already be there, but just in case)
ALTER TABLE user_challenge_completions ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add a journal_entry_id to link to reflections/journal
ALTER TABLE user_challenge_completions ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES reflections(id) ON DELETE SET NULL;

-- Create index for journal entries
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_journal_entry_id ON user_challenge_completions(journal_entry_id);

-- Add index for user + challenge for faster queries
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_user_challenge ON user_challenge_completions(user_id, challenge_id);
```

**Then:**
1. Click **"Run"** button
2. Wait for "Success" message

---

## ✅ Verification Steps

After running all migrations, verify everything worked:

1. **Check Tables Created:**
   - Go to **"Table Editor"** in Supabase
   - You should see these new tables:
     - `badges`
     - `user_badges`
     - `reflections`
     - `deep_thoughts`
     - `deep_thoughts_comments`
     - `recurring_tip_completions`
     - `challenges`
     - `user_challenge_completions`

2. **Check Badges:**
   - In Table Editor, click on `badges` table
   - You should see 20 badges

3. **Check Challenges:**
   - Click on `challenges` table
   - You should see 30 challenges

4. **Check Tips Table:**
   - Click on `tips` table
   - The "Weekly Relationship Check-In" tip should have `is_recurring = true`

---

## 🚨 Troubleshooting

**If you get an error about a table already existing:**
- That's okay! The `IF NOT EXISTS` clauses should handle this
- If it still errors, the table might already be set up correctly

**If you get an error about a constraint:**
- Some constraints might already exist
- The migration should handle this with `IF EXISTS` clauses

**If badges or challenges don't show up:**
- Check if they were inserted by looking at the table row count
- You can manually verify by running: `SELECT COUNT(*) FROM badges;` (should be 20)
- And: `SELECT COUNT(*) FROM challenges;` (should be 30)

---

## 🎉 Done!

Once all migrations are complete, your database is fully set up and ready to use!
