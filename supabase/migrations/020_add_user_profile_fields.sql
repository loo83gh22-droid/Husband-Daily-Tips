-- Add user profile fields for Team Wins posting
-- username: Optional display name for Team Wins
-- years_married: Number of years married (can be shown in Team Wins)
-- post_anonymously: Whether to post anonymously to Team Wins

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_married INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS post_anonymously BOOLEAN DEFAULT FALSE;

-- Add unique constraint on username (allow nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username) WHERE username IS NOT NULL;

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

