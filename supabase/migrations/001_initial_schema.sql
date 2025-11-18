-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (linked to Auth0)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tips table
CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'pro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User tips (track which tips users have received)
CREATE TABLE IF NOT EXISTS user_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  favorited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tip_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth0_id ON users(auth0_id);
CREATE INDEX IF NOT EXISTS idx_tips_tier ON tips(tier);
CREATE INDEX IF NOT EXISTS idx_user_tips_user_id ON user_tips(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tips_date ON user_tips(date);
CREATE INDEX IF NOT EXISTS idx_user_tips_user_date ON user_tips(user_id, date);

-- Insert sample tips
INSERT INTO tips (title, content, category, tier) VALUES
  ('Start Your Day Right', 'Begin each morning by asking your partner: "How can I make your day better today?" This simple question shows you care and sets a positive tone for the day.', 'Communication', 'free'),
  ('Listen Actively', 'When your partner is talking, put down your phone, make eye contact, and truly listen. Don''t just wait for your turn to speak—understand their perspective.', 'Communication', 'free'),
  ('Express Gratitude', 'Take a moment each day to thank your partner for something specific they did. Gratitude strengthens bonds and creates a positive atmosphere.', 'Appreciation', 'free'),
  ('Plan Surprise Dates', 'Regularly plan surprise dates or activities. It doesn''t have to be expensive—a picnic, a walk, or cooking together can be just as meaningful.', 'Romance', 'premium'),
  ('Share Household Responsibilities', 'Take initiative on household chores without being asked. Notice what needs to be done and do it. This shows you''re a true partner.', 'Partnership', 'premium'),
  ('Give Compliments', 'Compliment your partner daily—not just on appearance, but on their character, actions, and qualities you admire.', 'Appreciation', 'premium'),
  ('Create Tech-Free Time', 'Designate specific times (like meals or before bed) as phone-free zones. Give your partner your full, undivided attention.', 'Connection', 'premium'),
  ('Learn Their Love Language', 'Discover and speak your partner''s love language. Whether it''s words of affirmation, acts of service, gifts, quality time, or physical touch—speak their language.', 'Connection', 'premium'),
  ('Apologize Sincerely', 'When you make a mistake, apologize genuinely without excuses. Acknowledge the impact of your actions and commit to doing better.', 'Communication', 'premium'),
  ('Support Their Goals', 'Actively support your partner''s personal and professional goals. Ask about their progress, celebrate their wins, and help them overcome obstacles.', 'Support', 'premium'),
  ('Weekly Relationship Check-In', 'Set aside time each week to check in with your partner. Discuss what''s working, what isn''t, and how you can both improve.', 'Communication', 'pro'),
  ('Practice Emotional Intelligence', 'Learn to recognize and manage your emotions, and be attuned to your partner''s emotional needs. Emotional intelligence is key to a healthy relationship.', 'Growth', 'pro'),
  ('Create Shared Goals', 'Work together to set and achieve shared goals—whether financial, travel, or personal growth. Shared goals create unity and purpose.', 'Partnership', 'pro'),
  ('Resolve Conflicts Constructively', 'When disagreements arise, focus on understanding rather than winning. Use "I" statements and work together to find solutions.', 'Communication', 'pro'),
  ('Maintain Your Individuality', 'While being a great partner, don''t lose yourself. Maintain your hobbies, friendships, and personal growth. A whole person makes a better partner.', 'Growth', 'pro');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tips_updated_at BEFORE UPDATE ON tips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


