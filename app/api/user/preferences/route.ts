import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

/**
 * Update user calendar preferences
 */
export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const preferences = await request.json();

    const supabase = getSupabaseAdmin();

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, calendar_preferences')
      .eq('auth0_id', auth0Id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Merge with existing preferences
    const existingPrefs = (user.calendar_preferences as any) || {};
    const updatedPrefs = { ...existingPrefs, ...preferences };

    // Update user preferences
    const { error } = await supabase
      .from('users')
      .update({ calendar_preferences: updatedPrefs })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating preferences:', error);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({ success: true, preferences: updatedPrefs });
  } catch (error) {
    console.error('Unexpected error updating preferences:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

/**
 * Get user calendar preferences
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;

    const supabaseClient = getSupabaseAdmin();
    const { data: user } = await supabaseClient
      .from('users')
      .select('calendar_preferences, subscription_tier')
      .eq('auth0_id', auth0Id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      preferences: user.calendar_preferences || {},
      subscriptionTier: user.subscription_tier || 'free',
    });
  } catch (error) {
    console.error('Unexpected error fetching preferences:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

