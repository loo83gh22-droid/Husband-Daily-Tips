-- Fix existing profile picture URLs in the database
-- This script updates URLs that have the old subfolder structure
-- Run this in Supabase SQL Editor

-- Update URLs that point to files in the profile-pictures subfolder
-- Old format: /storage/v1/object/public/profile-pictures/profile-pictures/filename.jpg
-- New format: /storage/v1/object/public/profile-pictures/filename.jpg
UPDATE users
SET profile_picture = REPLACE(
  profile_picture,
  '/storage/v1/object/public/profile-pictures/profile-pictures/',
  '/storage/v1/object/public/profile-pictures/'
)
WHERE profile_picture LIKE '%/profile-pictures/profile-pictures/%';

-- Also handle case where file is in subfolder but URL doesn't include it
-- If URL is missing the subfolder path, we need to check if file exists there
-- This is more complex and might require manual verification

-- Check current profile picture URLs
SELECT 
  id,
  email,
  profile_picture,
  CASE 
    WHEN profile_picture LIKE '%/profile-pictures/profile-pictures/%' THEN 'Has duplicate path'
    WHEN profile_picture LIKE '%/profile-pictures/%' AND profile_picture NOT LIKE '%/profile-pictures/profile-pictures/%' THEN 'Looks correct'
    ELSE 'Unknown format'
  END as url_status
FROM users
WHERE profile_picture IS NOT NULL;

