import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Get user's active challenges and progress
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

    const today = new Date().toISOString().split('T')[0];

    // Get user's active challenges
    const { data: userChallenges, error } = await supabase
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
              benefit
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('joined_date', { ascending: false });

    if (error) {
      console.error('Error fetching user challenges:', error);
      return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }

    // Calculate progress for each challenge
    const challengesWithProgress = (userChallenges || []).map((uc: any) => {
      const challenge = uc.challenges;
      const totalDays = challenge?.challenge_actions?.length || 7;
      const completedDays = uc.completed_days || 0;
      const progress = (completedDays / totalDays) * 100;

      return {
        ...uc,
        progress,
        totalDays,
        remainingDays: totalDays - completedDays,
      };
    });

    return NextResponse.json({ challenges: challengesWithProgress });
  } catch (error) {
    console.error('Unexpected error fetching user challenges:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

