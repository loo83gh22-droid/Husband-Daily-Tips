import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

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

    // Get user info (need email and name for notification)
    const { data: user } = await adminSupabase
      .from('users')
      .select('id, email, name, created_at')
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

    // Send email notification to admin with all responses
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        // Get the questions to format the email nicely
        const { data: questions } = await adminSupabase
          .from('follow_up_survey_questions')
          .select('id, question_text, question_type, order_index')
          .eq('survey_type', survey_type)
          .order('order_index', { ascending: true });

        // Build formatted responses
        const formattedResponses = responses.map((response: SurveyResponse) => {
          const question = questions?.find((q) => q.id === response.question_id);
          let formattedValue = '';
          
          if (response.response_text) {
            formattedValue = response.response_text;
          } else if (response.response_value) {
            if (question?.question_type === 'scale') {
              const numValue = parseInt(response.response_value);
              if (survey_type === 'day_90_nps' && question.order_index === 1) {
                // NPS scale 0-10
                formattedValue = `${numValue}/10`;
              } else {
                // Regular scale 1-5
                const labels: Record<number, string> = {
                  1: '1 (Poor)',
                  2: '2 (Fair)',
                  3: '3 (Good)',
                  4: '4 (Very Good)',
                  5: '5 (Excellent)',
                };
                formattedValue = labels[numValue] || numValue.toString();
              }
            } else if (question?.question_type === 'yes_no') {
              formattedValue = response.response_value === '1' ? 'Yes' : 'No';
            } else {
              formattedValue = response.response_value;
            }
          }

          return {
            question: question?.question_text || 'Question',
            answer: formattedValue || 'No response',
          };
        });

        const surveyTypeLabels: Record<string, string> = {
          day_3_feedback: '3-Day Feedback Survey',
          day_7_conversion: '7-Day Conversion Survey',
          day_30_checkin: '30-Day Check-In Survey',
          day_90_nps: '90-Day NPS Survey',
        };

        const surveyLabel = surveyTypeLabels[survey_type] || survey_type;
        const userDisplayName = user.name || user.email?.split('@')[0] || 'User';
        const daysSinceSignup = user.created_at 
          ? Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 'N/A';

        // Send email to admin
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
          to: process.env.ADMIN_EMAIL,
          replyTo: user.email || undefined,
          subject: `📊 ${surveyLabel} Response from ${userDisplayName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">📊 Survey Response</h1>
                    <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">${surveyLabel}</p>
                  </div>
                  
                  <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0;"><strong>User:</strong> ${userDisplayName}</p>
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0;"><strong>Email:</strong> ${user.email || 'N/A'}</p>
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0;"><strong>Days Since Signup:</strong> ${daysSinceSignup}</p>
                  </div>
                  
                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Responses:</h2>
                    ${formattedResponses.map((item, index) => `
                      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: ${index < formattedResponses.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                        <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">${index + 1}. ${item.question}</p>
                        <p style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 15px; border-left: 3px solid #0ea5e9;">${item.answer}</p>
                      </div>
                    `).join('')}
                  </div>
                  
                  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      Survey completed at ${new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`✅ Survey response email sent to admin for ${survey_type} from ${user.email}`);
      } catch (emailError: any) {
        // Don't fail the request if email fails
        console.error('Error sending survey response email:', emailError);
      }
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

