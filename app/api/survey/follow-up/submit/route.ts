import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface SurveyResponse {
  question_id: string;
  response_value?: string;
  response_text?: string;
}

/**
 * Submit follow-up survey responses
 * POST /api/survey/follow-up/submit
 * Body: { survey_type: 'day_3_feedback' | 'day_7_conversion', responses: SurveyResponse[] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { survey_type, responses } = body;

    if (!survey_type || !['day_3_feedback', 'day_7_conversion', 'day_30_checkin', 'day_90_nps'].includes(survey_type)) {
      return NextResponse.json({ error: 'Invalid survey type' }, { status: 400 });
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'Responses required' }, { status: 400 });
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

    // Verify survey is eligible and not completed
    const { data: surveyStatus } = await adminSupabase
      .from('user_follow_up_surveys')
      .select('*')
      .eq('user_id', user.id)
      .eq('survey_type', survey_type)
      .single();

    if (!surveyStatus) {
      return NextResponse.json({ error: 'Survey not available' }, { status: 404 });
    }

    if (surveyStatus.completed) {
      return NextResponse.json({ error: 'Survey already completed' }, { status: 400 });
    }

    // Save responses
    const responseInserts = responses.map((response: SurveyResponse) => ({
      user_id: user.id,
      survey_type,
      question_id: response.question_id,
      response_value: response.response_value || null,
      response_text: response.response_text || null,
    }));

    const { error: insertError } = await adminSupabase
      .from('follow_up_survey_responses')
      .upsert(responseInserts, {
        onConflict: 'user_id,survey_type,question_id',
      });

    if (insertError) {
      console.error('Error saving survey responses:', insertError);
      return NextResponse.json({ error: 'Failed to save responses' }, { status: 500 });
    }

    // Mark survey as completed
    const { error: updateError } = await adminSupabase
      .from('user_follow_up_surveys')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('survey_type', survey_type);

    if (updateError) {
      console.error('Error updating survey status:', updateError);
      // Don't fail the request, responses are saved
    }

    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully',
      survey_type,
    });
  } catch (error: any) {
    console.error('Error submitting follow-up survey:', error);
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}

