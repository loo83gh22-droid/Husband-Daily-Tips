import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Dismiss a follow-up survey (user chooses not to take it)
 * POST /api/survey/follow-up/dismiss
 * Body: { survey_type: 'day_3_feedback' | 'day_7_conversion' }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { survey_type } = body;

    if (!survey_type || !['day_3_feedback', 'day_7_conversion', 'day_30_checkin', 'day_90_nps'].includes(survey_type)) {
      return NextResponse.json({ error: 'Invalid survey type' }, { status: 400 });
    }

    const adminSupabase = getSupabaseAdmin();
    const auth0Id = session.user.sub;

    // Get user ID
    const { data: user } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mark survey as dismissed
    const { error: updateError } = await adminSupabase
      .from('user_follow_up_surveys')
      .update({
        dismissed: true,
      })
      .eq('user_id', user.id)
      .eq('survey_type', survey_type);

    if (updateError) {
      console.error('Error dismissing survey:', updateError);
      return NextResponse.json({ error: 'Failed to dismiss survey' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Survey dismissed',
    });
  } catch (error: any) {
    console.error('Error dismissing follow-up survey:', error);
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}

