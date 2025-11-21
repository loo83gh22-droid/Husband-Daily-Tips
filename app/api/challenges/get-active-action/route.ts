import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Get the current day's action from an active challenge
 * Used to display challenge action instead of tomorrow's action when user is in a challenge
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's active challenge
    const { data: activeChallenge, error: challengeError } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenges (
          *,
          challenge_actions (
            day_number,
            actions (
              id,
              name,
              description,
              icon,
              benefit,
              category
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('joined_date', { ascending: false })
      .limit(1)
      .single();

    if (challengeError || !activeChallenge) {
      // No active challenge
      return NextResponse.json({ activeChallenge: null });
    }

    const challenge = activeChallenge.challenges;
    const challengeActions = challenge?.challenge_actions || [];
    
    // Calculate which day of the challenge (1-7)
    // Day 1 = joined_date, Day 2 = joined_date + 1, etc.
    const today = new Date();
    const joinedDate = new Date(activeChallenge.joined_date);
    const daysSinceJoined = Math.floor((today.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentDay = Math.min(daysSinceJoined + 1, 7); // Cap at day 7

    // Get action for current day
    const todayAction = challengeActions.find(
      (ca: any) => ca.day_number === currentDay
    );

    if (!todayAction || !todayAction.actions) {
      return NextResponse.json({ activeChallenge: null });
    }

    const action = todayAction.actions;

    // Check if user already has this action assigned for today in user_daily_actions
    const todayStr = today.toISOString().split('T')[0];
    const { data: existingAction } = await supabase
      .from('user_daily_actions')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .single();

    // If action isn't assigned for today yet, assign it
    if (!existingAction) {
      await supabase.from('user_daily_actions').insert({
        user_id: user.id,
        action_id: action.id,
        date: todayStr,
      });
    }

    return NextResponse.json({
      activeChallenge: {
        challengeId: challenge.id,
        challengeName: challenge.name,
        currentDay,
        totalDays: challengeActions.length,
        completedDays: activeChallenge.completed_days || 0,
        action: {
          ...action,
          isAction: true,
          isChallengeAction: true,
          challengeDay: currentDay,
        },
      },
    });
  } catch (error) {
    console.error('Error getting active challenge action:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

