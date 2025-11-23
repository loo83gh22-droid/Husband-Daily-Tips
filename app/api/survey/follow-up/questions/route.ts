import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Get follow-up survey questions by type
 * GET /api/survey/follow-up/questions?type=day_3_feedback|day_7_conversion
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const surveyType = searchParams.get('type') as 'day_3_feedback' | 'day_7_conversion' | null;

    if (!surveyType || !['day_3_feedback', 'day_7_conversion'].includes(surveyType)) {
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

    // Check if user is eligible for this survey
    const { data: surveyStatus } = await adminSupabase
      .from('user_follow_up_surveys')
      .select('*')
      .eq('user_id', user.id)
      .eq('survey_type', surveyType)
      .single();

    if (!surveyStatus) {
      return NextResponse.json({ error: 'Survey not available' }, { status: 404 });
    }

    if (surveyStatus.completed) {
      return NextResponse.json({ error: 'Survey already completed' }, { status: 400 });
    }

    if (surveyStatus.dismissed) {
      return NextResponse.json({ error: 'Survey was dismissed' }, { status: 400 });
    }

    // Check if user is eligible (eligible_at has passed)
    const now = new Date();
    const eligibleAt = new Date(surveyStatus.eligible_at);
    if (now < eligibleAt) {
      return NextResponse.json({ 
        error: 'Survey not yet available',
        eligible_at: surveyStatus.eligible_at 
      }, { status: 400 });
    }

    // Get questions for this survey type
    const { data: questions, error } = await adminSupabase
      .from('follow_up_survey_questions')
      .select('*')
      .eq('survey_type', surveyType)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching follow-up survey questions:', error);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    return NextResponse.json({
      survey_type: surveyType,
      questions: questions || [],
    });
  } catch (error: any) {
    console.error('Error in follow-up survey questions endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}

