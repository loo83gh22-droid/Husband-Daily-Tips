-- Create profile-pictures storage bucket
-- Note: This migration creates the bucket structure, but you still need to:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a bucket named "profile-pictures"
-- 3. Set it to Public (not private)
-- 4. Configure RLS policies if needed

-- Storage buckets cannot be created via SQL migrations in Supabase
-- They must be created through the Supabase Dashboard or Storage API

-- This file serves as documentation for the required bucket setup

/*
SETUP INSTRUCTIONS:

1. Go to your Supabase Dashboard
2. Navigate to Storage (left sidebar)
3. Click "New bucket"
4. Name it: "profile-pictures"
5. Set it to "Public" (not private)
6. Click "Create bucket"

OPTIONAL: Set up RLS policies for the bucket:

1. Go to Storage → profile-pictures bucket → Policies
2. Create a policy for SELECT (read access):
   - Policy name: "Public read access"
   - Allowed operation: SELECT
   - Policy definition: true (allow all authenticated users to read)

3. Create a policy for INSERT (upload access):
   - Policy name: "Users can upload own profile pictures"
   - Allowed operation: INSERT
   - Policy definition: 
     auth.uid()::text = (storage.foldername(name))[1]
     (This ensures users can only upload files with their user ID as the filename)

4. Create a policy for UPDATE (replace access):
   - Policy name: "Users can update own profile pictures"
   - Allowed operation: UPDATE
   - Policy definition:
     auth.uid()::text = (storage.foldername(name))[1]

5. Create a policy for DELETE (delete access):
   - Policy name: "Users can delete own profile pictures"
   - Allowed operation: DELETE
   - Policy definition:
     auth.uid()::text = (storage.foldername(name))[1]

NOTE: Since we're using the admin client (service role) for uploads,
RLS policies are bypassed. However, it's still good practice to set them up
for future direct client-side uploads if needed.
*/

