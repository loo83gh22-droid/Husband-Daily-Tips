import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

/**
 * Upload profile picture to Supabase Storage
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;

    // Use admin client to bypass RLS (Auth0 context isn't set for RLS)
    const adminSupabase = getSupabaseAdmin();

    // Get user ID
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - only allow safe image formats (no SVG for security)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    
    const isValidType = allowedTypes.includes(file.type.toLowerCase()) || 
                        allowedExtensions.includes(fileExtension);
    
    if (!isValidType) {
      return NextResponse.json(
        { error: 'File must be a JPG, PNG, or WebP image. SVG and other formats are not allowed for security reasons.' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB - profile pictures don't need to be huge)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File must be less than 2MB. Try compressing your image or using a smaller file.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use consistent filename per user (so upsert works and we can delete old files)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}.${fileExt}`;
    // Store files in profile-pictures folder (matches existing structure)
    const filePath = `profile-pictures/${fileName}`;

    // Get current profile picture URL before uploading new one
    const { data: currentUser } = await adminSupabase
      .from('users')
      .select('profile_picture')
      .eq('id', user.id)
      .single();

    // Delete old profile picture files for this user (handle different extensions)
    // Since files are stored as profile-pictures/user-id.jpg, list from that folder
    try {
      // List files from root of bucket (files are stored at root level)
      const { data: existingFiles, error: listError } = await adminSupabase.storage
        .from('profile-pictures')
        .list('', {
          limit: 1000,
        });

      if (!listError && existingFiles) {
        // Filter files that belong to this user (start with user.id) but aren't the new file
        const filesToDelete = existingFiles
          .filter(file => {
            // Match files like: user-id.jpg, user-id.png, etc.
            // Also handle old timestamped files: user-id-timestamp.jpg
            const startsWithUserId = file.name.startsWith(`${user.id}.`) || 
                                   file.name.startsWith(`${user.id}-`);
            return startsWithUserId && file.name !== fileName;
          })
          .map(file => file.name); // Just the filename for removal (stored at root)

        if (filesToDelete.length > 0) {
          console.log(`Found ${filesToDelete.length} old file(s) to delete for user ${user.id}`);
          console.log('Files to delete:', filesToDelete);
          
          const { error: removeError } = await adminSupabase.storage
            .from('profile-pictures')
            .remove(filesToDelete);
          
          if (removeError) {
            console.error('Error removing old files:', removeError);
          } else {
            console.log(`✅ Successfully deleted ${filesToDelete.length} old profile picture file(s)`);
          }
        } else {
          console.log(`No old files to delete for user ${user.id}`);
        }
      } else if (listError) {
        console.error('Error listing existing files:', listError);
        // Try listing from root as fallback
        console.log('Attempting to list from root...');
        const { data: rootFiles } = await adminSupabase.storage
          .from('profile-pictures')
          .list('', { limit: 1000 });
        console.log('Root files:', rootFiles);
      }
    } catch (deleteError) {
      // Log but don't fail - old file cleanup is not critical
      console.error('Error cleaning up old profile pictures:', deleteError);
    }

    // Upload to Supabase Storage using admin client to bypass RLS
    // Note: You'll need to create a 'profile-pictures' bucket in Supabase Storage
    // Using consistent filename so upsert replaces the old file
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('profile-pictures')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Replace if exists (same filename = same user)
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file. Please make sure the profile-pictures bucket exists in Supabase Storage.' },
        { status: 500 }
      );
    }

    // Get public URL using admin client
    // Note: getPublicUrl expects the path relative to the bucket root
    // The filePath is "profile-pictures/filename.jpg"
    const { data: urlData } = adminSupabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    let publicUrl = urlData.publicUrl;
    
    // Fix duplicate path issue - Supabase sometimes adds the folder name twice
    // If URL contains profile-pictures/profile-pictures, remove the duplicate
    if (publicUrl.includes('/profile-pictures/profile-pictures/')) {
      publicUrl = publicUrl.replace('/profile-pictures/profile-pictures/', '/profile-pictures/');
      console.log('Fixed duplicate path in URL');
    }
    
    console.log('Generated public URL:', publicUrl);

    // Verify the URL is valid
    if (!publicUrl) {
      console.error('Failed to generate public URL for profile picture');
      return NextResponse.json(
        { error: 'Failed to generate image URL' },
        { status: 500 }
      );
    }

    console.log(`Profile picture uploaded successfully for user ${user.id}: ${publicUrl}`);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Unexpected error uploading profile picture:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

