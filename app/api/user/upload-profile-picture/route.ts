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

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;

    // Upload to Supabase Storage using admin client to bypass RLS
    // Note: You'll need to create a 'profile-pictures' bucket in Supabase Storage
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('profile-pictures')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Replace if exists
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

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Unexpected error uploading profile picture:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

