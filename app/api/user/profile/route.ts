import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Update user profile (username, wedding_date, post_anonymously)
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { username, wedding_date, post_anonymously, timezone } = await request.json();

    // Get user
    const { data: user, error: userError } = await supabase
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
        const { data: existingUser } = await supabase
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

    const { error: updateError } = await supabase
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

        const { data: user, error: userError } = await supabase
          .from('users')
          .select('username, wedding_date, post_anonymously, name, timezone')
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
        });
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

