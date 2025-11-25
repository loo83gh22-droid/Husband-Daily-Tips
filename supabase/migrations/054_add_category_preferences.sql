-- Create table to track user category preferences (from "Show me more like this")
-- This allows users to boost categories they want to see more of
CREATE TABLE IF NOT EXISTS user_category_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  preference_weight DECIMAL(3,1) DEFAULT 0.5, -- Each click adds 0.5, max 3.0 (6 clicks)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category) -- One preference per user per category
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_category_preferences_user_id ON user_category_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_preferences_category ON user_category_preferences(category);

-- Enable RLS
ALTER TABLE user_category_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own preferences
CREATE POLICY "Users can read own category preferences" ON user_category_preferences
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own category preferences" ON user_category_preferences
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can update own category preferences" ON user_category_preferences
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

-- Function to increment preference weight (with max cap of 3.0)
CREATE OR REPLACE FUNCTION increment_category_preference(
  p_user_id UUID,
  p_category TEXT
)
RETURNS DECIMAL(3,1) AS $$
DECLARE
  current_weight DECIMAL(3,1);
  new_weight DECIMAL(3,1);
BEGIN
  -- Get current weight or default to 0
  SELECT COALESCE(preference_weight, 0) INTO current_weight
  FROM user_category_preferences
  WHERE user_id = p_user_id AND category = p_category;
  
  -- Calculate new weight (add 0.5, cap at 3.0)
  new_weight := LEAST(COALESCE(current_weight, 0) + 0.5, 3.0);
  
  -- Upsert the preference
  INSERT INTO user_category_preferences (user_id, category, preference_weight, updated_at)
  VALUES (p_user_id, p_category, new_weight, NOW())
  ON CONFLICT (user_id, category)
  DO UPDATE SET
    preference_weight = new_weight,
    updated_at = NOW();
  
  RETURN new_weight;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

