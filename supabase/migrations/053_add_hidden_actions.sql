-- Create table to track actions that users have hidden (don't show again)
CREATE TABLE IF NOT EXISTS user_hidden_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  hidden_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_id) -- Each user can only hide an action once
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_hidden_actions_user_id ON user_hidden_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hidden_actions_action_id ON user_hidden_actions(action_id);

-- Enable RLS
ALTER TABLE user_hidden_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own hidden actions
CREATE POLICY "Users can read own hidden actions" ON user_hidden_actions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can insert own hidden actions" ON user_hidden_actions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

CREATE POLICY "Users can delete own hidden actions" ON user_hidden_actions
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth0_id = current_setting('app.auth0_id', true)
    )
  );

