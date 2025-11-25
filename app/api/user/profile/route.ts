import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Update user profile (username, wedding_date, post_anonymously, timezone, profile_picture)
 * Supports both PUT and POST for backwards compatibility
 */
async function updateProfile(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { username, wedding_date, post_anonymously, timezone, profile_picture, has_kids, kids_live_with_you, country, partner_name } = await request.json();

    // Use admin client to bypass RLS (Auth0 context isn't set for RLS)
    const adminSupabase = getSupabaseAdmin();
    
    // Get user
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate username if provided
    if (username !== null && username !== undefined) {
      const trimmedUsername = username.trim();
      if (trimmedUsername && (trimmedUsername.length < 3 || trimmedUsername.length > 20)) {
        return NextResponse.json(
          { error: 'Username must be between 3 and 20 characters' },
          { status: 400 }
        );
      }

      // Check if username is already taken (by another user)
      if (trimmedUsername) {
        const { data: existingUser } = await adminSupabase
          .from('users')
          .select('id')
          .eq('username', trimmedUsername)
          .neq('id', user.id)
          .single();

        if (existingUser) {
          return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }
      }
    }

    // Validate wedding_date if provided
    if (wedding_date !== null && wedding_date !== undefined && wedding_date !== '') {
      const date = new Date(wedding_date);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Please enter a valid wedding date' },
          { status: 400 }
        );
      }
      // Check that date is not in the future
      if (date > new Date()) {
        return NextResponse.json(
          { error: 'Wedding date cannot be in the future' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updateData: any = {};
    if (username !== undefined) {
      updateData.username = username?.trim() || null;
    }
    if (wedding_date !== undefined) {
      updateData.wedding_date = wedding_date && wedding_date.trim() ? wedding_date.trim() : null;
    }
    if (post_anonymously !== undefined) {
      updateData.post_anonymously = post_anonymously;
    }
    if (timezone !== undefined) {
      updateData.timezone = timezone || 'America/New_York';
    }
    if (profile_picture !== undefined) {
      updateData.profile_picture = profile_picture || null;
    }
    if (has_kids !== undefined) {
      updateData.has_kids = has_kids;
    }
    if (kids_live_with_you !== undefined) {
      updateData.kids_live_with_you = kids_live_with_you;
    }
    if (country !== undefined) {
      updateData.country = country || null;
    }
    if (partner_name !== undefined) {
      // Trim and validate partner name
      const trimmedName = partner_name?.trim() || null;
      if (trimmedName && trimmedName.length > 50) {
        return NextResponse.json(
          { error: 'Partner name must be 50 characters or less' },
          { status: 400 }
        );
      }
      updateData.partner_name = trimmedName;
    }

    const { error: updateError } = await adminSupabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return updateProfile(request);
}

export async function POST(request: Request) {
  return updateProfile(request);
}

/**
 * Get user profile
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;

    // Use admin client to bypass RLS (Auth0 context isn't set for RLS)
    const adminSupabase = getSupabaseAdmin();
    
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('username, wedding_date, post_anonymously, name, timezone, profile_picture, has_kids, kids_live_with_you, country, partner_name')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

        return NextResponse.json({
          username: user.username,
          wedding_date: user.wedding_date,
          post_anonymously: user.post_anonymously || false,
          name: user.name,
          timezone: user.timezone || 'America/New_York',
          profile_picture: user.profile_picture,
          has_kids: user.has_kids,
          kids_live_with_you: user.kids_live_with_you,
          country: user.country,
          partner_name: user.partner_name,
        });
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

