-- Add email preferences to users table
-- These preferences allow users to control what types of emails they receive

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{
  "daily_actions": true,
  "surveys": true,
  "marketing": true,
  "updates": true,
  "challenges": true,
  "trial_reminders": true
}'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email_preferences ON users USING GIN (email_preferences);

-- Add comment explaining the email preferences structure
COMMENT ON COLUMN users.email_preferences IS 'JSONB object containing email preference flags:
- daily_actions: Receive daily action emails (default: true)
- surveys: Receive survey invitation emails (default: true)
- marketing: Receive marketing/promotional emails (default: true)
- updates: Receive product updates and announcements (default: true)
- challenges: Receive challenge/event emails (default: true)
- trial_reminders: Receive trial expiration reminders (default: true)';

-- Create a function to check if a user should receive a specific email type
CREATE OR REPLACE FUNCTION should_send_email(p_user_id UUID, p_email_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  v_preferences JSONB;
  v_value BOOLEAN;
BEGIN
  SELECT email_preferences INTO v_preferences
  FROM public.users
  WHERE id = p_user_id;
  
  IF v_preferences IS NULL THEN
    -- Default to true if preferences don't exist (backward compatibility)
    RETURN true;
  END IF;
  
  -- Get the value for the specific email type
  v_value := COALESCE((v_preferences->>p_email_type)::boolean, true);
  
  RETURN v_value;
END;
$$;

COMMENT ON FUNCTION should_send_email(UUID, TEXT) IS 'Checks if a user should receive a specific type of email based on their preferences. Returns true by default for backward compatibility.';

