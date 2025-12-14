import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Get user's survey results for welcome modal
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
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

    // Get survey summary
    const { data: surveySummary } = await adminSupabase
      .from('survey_summary')
      .select('baseline_health, communication_score, romance_score, partnership_score, intimacy_score, conflict_score, gratitude_score, reconnection_score, quality_time_score')
      .eq('user_id', user.id)
      .single();

    if (!surveySummary) {
      return NextResponse.json({
        baselineHealth: 50,
        categoryScores: {},
      });
    }

    return NextResponse.json({
      baselineHealth: surveySummary.baseline_health || 50,
      categoryScores: {
        communication: surveySummary.communication_score || 50,
        romance: surveySummary.romance_score || 50,
        partnership: surveySummary.partnership_score || 50,
        intimacy: surveySummary.intimacy_score || 50,
        conflict: surveySummary.conflict_score || 50,
        gratitude: surveySummary.gratitude_score || 50,
        reconnection: surveySummary.reconnection_score || 50,
        quality_time: surveySummary.quality_time_score || 50,
      },
    });
  } catch (error) {
    console.error('Error fetching survey results:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

