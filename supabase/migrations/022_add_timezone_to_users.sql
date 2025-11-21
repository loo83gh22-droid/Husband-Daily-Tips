-- Add timezone field to users table for email scheduling
-- Timezone is stored as IANA timezone identifier (e.g., 'America/New_York', 'Europe/London')

ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Add index for timezone lookups (useful for email scheduling)
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);

-- Add comment
COMMENT ON COLUMN users.timezone IS 'IANA timezone identifier for email scheduling (e.g., America/New_York)';

