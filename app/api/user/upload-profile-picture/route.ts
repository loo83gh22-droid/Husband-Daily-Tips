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
    const filePath = `profile-pictures/${fileName}`;

    // Get current profile picture URL before uploading new one
    const { data: currentUser } = await adminSupabase
      .from('users')
      .select('profile_picture')
      .eq('id', user.id)
      .single();

    // Delete old profile picture if it exists and is in our storage
    if (currentUser?.profile_picture) {
      try {
        // Extract file path from URL if it's a Supabase Storage URL
        const oldUrl = currentUser.profile_picture;
        if (oldUrl.includes('/storage/v1/object/public/profile-pictures/')) {
          const oldFileName = oldUrl.split('/profile-pictures/')[1]?.split('?')[0];
          if (oldFileName && oldFileName !== fileName) {
            // Only delete if it's a different file (not the same one we're about to upload)
            // Note: remove() expects just the file path, not the full path with bucket name
            const { error: removeError } = await adminSupabase.storage
              .from('profile-pictures')
              .remove([oldFileName]);
            
            if (removeError) {
              console.error('Error removing old file:', removeError);
            } else {
              console.log(`Deleted old profile picture: ${oldFileName}`);
            }
          }
        }
      } catch (deleteError) {
        // Log but don't fail - old file cleanup is not critical
        console.error('Error deleting old profile picture:', deleteError);
      }
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
    const { data: urlData } = adminSupabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

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

