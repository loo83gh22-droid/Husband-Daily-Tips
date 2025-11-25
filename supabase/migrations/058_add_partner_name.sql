-- Add partner_name column to users table for personalization
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_name TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN users.partner_name IS 'Partner/wife name for personalizing action cards (e.g., "Take Sarah out..." instead of "Take your partner out...")';

