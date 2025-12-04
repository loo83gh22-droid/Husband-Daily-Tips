import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/email-preferences
 * Get user's email preferences
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    const { data: user, error } = await adminSupabase
      .from('users')
      .select('email_preferences')
      .eq('auth0_id', auth0Id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return default preferences if none exist
    const preferences = user.email_preferences || {
      daily_actions: true,
      surveys: true,
      marketing: true,
      updates: true,
      challenges: true,
      trial_reminders: true,
    };

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

/**
 * PUT /api/user/email-preferences
 * Update user's email preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const body = await request.json();
    const { preferences } = body;

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences object' },
        { status: 400 }
      );
    }

    // Validate preference keys
    const validKeys = [
      'daily_actions',
      'surveys',
      'marketing',
      'updates',
      'challenges',
      'trial_reminders',
    ];

    const updatedPreferences: Record<string, boolean> = {};
    for (const key of validKeys) {
      if (key in preferences) {
        updatedPreferences[key] = Boolean(preferences[key]);
      }
    }

    // If no valid preferences provided, return error
    if (Object.keys(updatedPreferences).length === 0) {
      return NextResponse.json(
        { error: 'No valid preferences provided' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseAdmin();

    // Get current preferences
    const { data: user, error: fetchError } = await adminSupabase
      .from('users')
      .select('email_preferences')
      .eq('auth0_id', auth0Id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Merge with existing preferences
    const currentPreferences = (user.email_preferences as Record<string, boolean>) || {};
    const mergedPreferences = { ...currentPreferences, ...updatedPreferences };

    // Update preferences
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ email_preferences: mergedPreferences })
      .eq('auth0_id', auth0Id);

    if (updateError) {
      console.error('Error updating email preferences:', updateError);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: mergedPreferences,
    });
  } catch (error) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

