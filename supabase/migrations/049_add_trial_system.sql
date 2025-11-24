-- Add trial tracking fields to users table
-- This enables a true "no credit card required" 7-day free trial

ALTER TABLE users
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_notification_sent BOOLEAN DEFAULT FALSE;

-- Add comment explaining the trial system
COMMENT ON COLUMN users.trial_started_at IS 'When the user started their 7-day free trial (no credit card required)';
COMMENT ON COLUMN users.trial_ends_at IS 'When the trial expires and user will be downgraded to free tier';
COMMENT ON COLUMN users.trial_notification_sent IS 'Whether we have sent a notification about trial expiring soon';

-- Create index for efficient trial expiration queries
CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON users(trial_ends_at) WHERE trial_ends_at IS NOT NULL;

