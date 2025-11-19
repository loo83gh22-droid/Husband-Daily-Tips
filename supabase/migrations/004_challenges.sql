-- Challenges table (individual tasks users can complete to earn badges)
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'Communication', 'Romance', 'Gratitude'
  theme TEXT NOT NULL, -- e.g., 'communication', 'romance', 'gratitude', 'partnership'
  requirement_type TEXT, -- Links to badge requirement_type (e.g., 'gratitude_actions', 'category_count')
  icon TEXT, -- Emoji or icon
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
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

