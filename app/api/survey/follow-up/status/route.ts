import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Get user's follow-up survey status
 * GET /api/survey/follow-up/status
 * Returns which surveys are available, completed, or dismissed
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = getSupabaseAdmin();
    const auth0Id = session.user.sub;

    // Get user ID
    const { data: user } = await adminSupabase
      .from('users')
      .select('id, created_at')
      .eq('auth0_id', auth0Id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all follow-up survey statuses for this user
    const { data: surveys, error } = await adminSupabase
      .from('user_follow_up_surveys')
      .select('*')
      .eq('user_id', user.id)
      .order('eligible_at', { ascending: true });

    if (error) {
      console.error('Error fetching survey status:', error);
      return NextResponse.json({ error: 'Failed to fetch survey status' }, { status: 500 });
    }

    const now = new Date();
    const availableSurveys = surveys?.filter((survey) => {
      const eligibleAt = new Date(survey.eligible_at);
      return !survey.completed && !survey.dismissed && now >= eligibleAt;
    }) || [];

    return NextResponse.json({
      surveys: surveys || [],
      available: availableSurveys,
      has_available: availableSurveys.length > 0,
    });
  } catch (error: any) {
    console.error('Error in follow-up survey status endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}

