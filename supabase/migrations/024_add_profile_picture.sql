-- Add profile_picture field to users table
-- This will store the URL/path to the uploaded profile picture in Supabase Storage

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add comment
COMMENT ON COLUMN users.profile_picture IS 'URL or path to user profile picture stored in Supabase Storage';

