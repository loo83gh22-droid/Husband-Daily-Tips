import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Debug endpoint to check profile picture status
 * GET /api/user/profile-picture-debug
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    // Get user with profile picture
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, profile_picture')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if profile picture URL exists
    const hasProfilePicture = !!user.profile_picture;

    // Try to verify the file exists in storage
    let fileExists = false;
    let fileAccessible = false;
    
    if (user.profile_picture) {
      try {
        // Extract filename from URL
        const url = user.profile_picture;
        if (url.includes('/storage/v1/object/public/profile-pictures/')) {
          const fileName = url.split('/profile-pictures/')[1]?.split('?')[0];
          if (fileName) {
            // Try to list files to see if it exists
            const { data: files, error: listError } = await adminSupabase.storage
              .from('profile-pictures')
              .list('profile-pictures', {
                search: fileName,
              });

            fileExists = !listError && files && files.length > 0;

            // Try to fetch the file to see if it's accessible
            try {
              const response = await fetch(user.profile_picture, { method: 'HEAD' });
              fileAccessible = response.ok;
            } catch (fetchError) {
              console.error('Error fetching profile picture:', fetchError);
            }
          }
        }
      } catch (error) {
        console.error('Error checking file:', error);
      }
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      profilePictureUrl: user.profile_picture,
      hasProfilePicture,
      fileExists,
      fileAccessible,
      debug: {
        urlFormat: user.profile_picture ? 'valid' : 'missing',
        isSupabaseUrl: user.profile_picture?.includes('/storage/v1/object/public/') || false,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

