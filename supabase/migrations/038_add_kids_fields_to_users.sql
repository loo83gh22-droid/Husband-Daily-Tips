-- Add kids-related fields to users table
-- These fields help personalize action selection

ALTER TABLE users ADD COLUMN IF NOT EXISTS has_kids BOOLEAN DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kids_live_with_you BOOLEAN DEFAULT NULL;

