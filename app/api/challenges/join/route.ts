import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Join a weekly challenge
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { challengeId } = await request.json();

    if (!challengeId) {
      return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if challenge exists and is active
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found or not active' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if user already joined
    const { data: existing } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already joined challenge' });
    }

    // Join challenge
    const { data: userChallenge, error: joinError } = await supabase
      .from('user_challenges')
      .insert({
        user_id: user.id,
        challenge_id: challengeId,
        joined_date: today,
        completed_days: 0,
        completed: false,
      })
      .select()
      .single();

    if (joinError) {
      console.error('Error joining challenge:', joinError);
      return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
    }

    // Check if this is their first challenge (for badge)
    const { data: allChallenges } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id);

    if (allChallenges && allChallenges.length === 1) {
      // First challenge - award "Challenge Starter" badge
      const { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('name', 'Challenge Starter')
        .single();

      if (badge) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_id: badge.id,
          earned_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true, userChallenge });
  } catch (error) {
    console.error('Unexpected error joining challenge:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

