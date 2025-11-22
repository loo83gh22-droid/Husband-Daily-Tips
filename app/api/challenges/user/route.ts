import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

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

    // Use admin client to bypass RLS (Auth0 context isn't set)
    const supabase = getSupabaseAdmin();

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

    // Get ALL user's challenges (both active and completed) to properly detect enrollment
    const { data: allUserChallenges, error: allError } = await supabase
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
      .order('joined_date', { ascending: false });

    // Get user's active challenges (incomplete ones) for the main response
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

    // Also get completed challenges to get completion counts
    const { data: completedChallenges } = await supabase
      .from('user_challenges')
      .select('challenge_id, completion_count')
      .eq('user_id', user.id)
      .eq('completed', true);

    if (error) {
      console.error('Error fetching user challenges:', error);
      return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }

    // Create map of completion counts by challenge_id
    const completionCounts = new Map<string, number>();
    (completedChallenges || []).forEach((cc: any) => {
      const currentCount = completionCounts.get(cc.challenge_id) || 0;
      completionCounts.set(cc.challenge_id, currentCount + (cc.completion_count || 0));
    });

    // Calculate progress for each active challenge
    const challengesWithProgress = (userChallenges || []).map((uc: any) => {
      const challenge = uc.challenges;
      const totalDays = challenge?.challenge_actions?.length || 7;
      const completedDays = uc.completed_days || 0;
      const progress = (completedDays / totalDays) * 100;
      const completionCount = completionCounts.get(challenge.id) || 0;

      return {
        ...uc,
        progress,
        totalDays,
        remainingDays: totalDays - completedDays,
        completionCount,
      };
    });

    // Also include all challenges (active + completed) for enrollment detection
    const allChallengesWithProgress = (allUserChallenges || []).map((uc: any) => {
      const challenge = uc.challenges;
      const totalDays = challenge?.challenge_actions?.length || 7;
      const completedDays = uc.completed_days || 0;
      const progress = (completedDays / totalDays) * 100;
      const completionCount = completionCounts.get(challenge.id) || 0;

      return {
        ...uc,
        progress,
        totalDays,
        remainingDays: totalDays - completedDays,
        completionCount,
      };
    });

    return NextResponse.json({ 
      challenges: challengesWithProgress,
      allChallenges: allChallengesWithProgress // Include all for enrollment detection
    });
  } catch (error) {
    console.error('Unexpected error fetching user challenges:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

