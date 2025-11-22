import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

/**
 * Get active weekly challenges
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Use admin client to bypass RLS (Auth0 context isn't set)
    const supabase = getSupabaseAdmin();

    // Get user for completion counts
    const session = await getSession();
    let userCompletionCounts = new Map<string, number>();

    if (session?.user) {
      const auth0Id = session.user.sub;
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth0_id', auth0Id)
        .single();

      if (user) {
        const { data: completedChallenges } = await supabase
          .from('user_challenges')
          .select('challenge_id, completion_count')
          .eq('user_id', user.id)
          .eq('completed', true);

        (completedChallenges || []).forEach((cc: any) => {
          const currentCount = userCompletionCounts.get(cc.challenge_id) || 0;
          userCompletionCounts.set(cc.challenge_id, currentCount + (cc.completion_count || 0));
        });
      }
    }

    // Get active challenges (current or upcoming)
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select(`
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
      `)
      .eq('is_active', true)
      .gte('end_date', today) // Not ended yet
      .order('start_date', { ascending: true })
      .limit(3);

    if (error) {
      console.error('Error fetching challenges:', error);
      return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }

    // Add completion counts to challenges
    const challengesWithCounts = (challenges || []).map((challenge: any) => ({
      ...challenge,
      userCompletionCount: userCompletionCounts.get(challenge.id) || 0,
    }));

    return NextResponse.json({ challenges: challengesWithCounts });
  } catch (error) {
    console.error('Unexpected error fetching challenges:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

