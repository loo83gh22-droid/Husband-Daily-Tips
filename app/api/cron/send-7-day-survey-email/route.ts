import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY || '');

/**
 * Cron endpoint to send 7-day survey email notifications
 * 
 * Schedule: Run daily (e.g., "0 10 * * *" at 10am UTC)
 * This sends emails to users who are eligible for the 7-day survey
 */
export async function GET(request: Request) {
  try {
    // Verify this is called from Vercel Cron or with proper auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow Vercel Cron (no auth header) or bearer token
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const vercelCron = request.headers.get('x-vercel-cron');
      if (!vercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const adminSupabase = getSupabaseAdmin();
    const now = new Date();

    // Get users eligible for 7-day survey who haven't been emailed yet
    const { data: eligibleUsers, error } = await adminSupabase
      .from('user_follow_up_surveys')
      .select(`
        *,
        users (
          id,
          email,
          name,
          subscription_tier
        )
      `)
      .eq('survey_type', 'day_7_conversion')
      .eq('completed', false)
      .eq('dismissed', false)
      .eq('email_sent', false)
      .lte('eligible_at', now.toISOString());

    if (error) {
      console.error('Error fetching eligible users:', error);
      return NextResponse.json({ error: 'Failed to fetch eligible users' }, { status: 500 });
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'No users eligible for 7-day survey email',
      });
    }

    const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';
    let sentCount = 0;
    let errorCount = 0;

    for (const surveyRecord of eligibleUsers) {
      const user = (surveyRecord as any).users;
      if (!user || !user.email) {
        continue;
      }

      try {
        const { data, error: emailError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
          to: user.email,
          subject: 'How\'s your first week going?',
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
                    <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">Best Husband Ever</h1>
                    <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Your daily mission, delivered.</p>
                  </div>
                  
                  <div style="background-color: #0f172a; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                    <h2 style="color: #f1f5f9; font-size: 22px; margin: 0 0 15px 0; font-weight: 600;">
                      How's your first week going?
                    </h2>
                    <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0;">
                      You've been with us for 7 days now. We'd love to hear about your experience and get your feedback on how we can make this even better for you.
                    </p>
                  </div>
                  
                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <p style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                      Quick 2-minute survey:
                    </p>
                    <ul style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px;">
                      <li>Share your experience so far</li>
                      <li>Tell us what's been most valuable</li>
                      <li>Help us improve</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <a href="${baseUrl}/dashboard" 
                       style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-bottom: 10px;">
                      Take Survey →
                    </a>
                    ${user.subscription_tier === 'free' ? `
                      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                          Ready to unlock daily actions?
                        </p>
                        <p style="color: #6b7280; font-size: 13px; margin: 0 0 15px 0;">
                          Start your premium trial and get personalized daily actions delivered to your inbox.
                        </p>
                        <a href="${baseUrl}/dashboard/subscription" 
                           style="display: inline-block; background-color: #0f172a; color: #0ea5e9; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; border: 2px solid #0ea5e9;">
                          Start Premium Trial →
                        </a>
                      </div>
                    ` : ''}
                    <p style="color: #6b7280; font-size: 12px; margin: 15px 0 0 0;">
                      You're receiving this because you signed up for Best Husband Ever.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        if (emailError) {
          console.error(`Error sending email to ${user.email}:`, emailError);
          errorCount++;
        } else {
          // Mark email as sent
          await adminSupabase
            .from('user_follow_up_surveys')
            .update({ email_sent: true })
            .eq('id', surveyRecord.id);

          sentCount++;
          console.log(`✅ 7-day survey email sent to ${user.email}`);
        }
      } catch (error: any) {
        console.error(`Error processing user ${user.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: eligibleUsers.length,
    });
  } catch (error: any) {
    console.error('Error in 7-day survey email cron:', error);
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}

