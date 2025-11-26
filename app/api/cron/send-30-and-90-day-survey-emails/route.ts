import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY || '');

/**
 * Cron endpoint to send 30-day and 90-day survey email notifications
 * 
 * Schedule: Run daily (e.g., "0 10 * * *" at 10am UTC)
 * This sends emails to users who are eligible for 30-day or 90-day surveys
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
    const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';

    // Get users eligible for 30-day survey who haven't been emailed yet
    const { data: eligible30Day, error: error30 } = await adminSupabase
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
      .eq('survey_type', 'day_30_checkin')
      .eq('completed', false)
      .eq('dismissed', false)
      .eq('email_sent', false)
      .lte('eligible_at', now.toISOString());

    // Get users eligible for 90-day survey who haven't been emailed yet
    const { data: eligible90Day, error: error90 } = await adminSupabase
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
      .eq('survey_type', 'day_90_nps')
      .eq('completed', false)
      .eq('dismissed', false)
      .eq('email_sent', false)
      .lte('eligible_at', now.toISOString());

    if (error30 || error90) {
      logger.error('Error fetching eligible users:', error30 || error90);
      return NextResponse.json({ error: 'Failed to fetch eligible users' }, { status: 500 });
    }

    let sentCount30 = 0;
    let sentCount90 = 0;
    let errorCount = 0;

    // Send 30-day survey emails
    if (eligible30Day && eligible30Day.length > 0) {
      for (const surveyRecord of eligible30Day) {
        const user = (surveyRecord as any).users;
        if (!user || !user.email) continue;

        try {
          const { data, error: emailError } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
            to: user.email,
            subject: '30 Days In - How\'s It Going?',
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
                        You've been with us for 30 days!
                      </h2>
                      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0;">
                        We'd love to hear about your experience so far and how your relationship has improved.
                      </p>
                    </div>
                    
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <a href="${baseUrl}/dashboard" 
                         style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-bottom: 10px;">
                        Take 30-Day Survey →
                      </a>
                      <p style="color: #6b7280; font-size: 12px; margin: 15px 0 0 0;">
                        Takes 2 minutes • Your feedback helps us improve
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });

          if (emailError) {
            console.error(`Error sending 30-day email to ${user.email}:`, emailError);
            errorCount++;
          } else {
            await adminSupabase
              .from('user_follow_up_surveys')
              .update({ email_sent: true })
              .eq('id', surveyRecord.id);
            sentCount30++;
            console.log(`✅ 30-day survey email sent to ${user.email}`);
          }
        } catch (error: any) {
          console.error(`Error processing 30-day user ${user.id}:`, error);
          errorCount++;
        }
      }
    }

    // Send 90-day NPS survey emails
    if (eligible90Day && eligible90Day.length > 0) {
      for (const surveyRecord of eligible90Day) {
        const user = (surveyRecord as any).users;
        if (!user || !user.email) continue;

        try {
          const { data, error: emailError } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
            to: user.email,
            subject: '90 Days In - How Are We Doing?',
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
                        You've been with us for 90 days!
                      </h2>
                      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0;">
                        We'd love to know: How likely are you to recommend Best Husband Ever to a friend? Your feedback helps us improve and reach more husbands who want to be better partners.
                      </p>
                    </div>
                    
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <a href="${baseUrl}/dashboard" 
                         style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-bottom: 10px;">
                        Take 90-Day Survey →
                      </a>
                      <p style="color: #6b7280; font-size: 12px; margin: 15px 0 0 0;">
                        Quick 1-minute survey • Your opinion matters
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });

          if (emailError) {
            console.error(`Error sending 90-day email to ${user.email}:`, emailError);
            errorCount++;
          } else {
            await adminSupabase
              .from('user_follow_up_surveys')
              .update({ email_sent: true })
              .eq('id', surveyRecord.id);
            sentCount90++;
            console.log(`✅ 90-day survey email sent to ${user.email}`);
          }
        } catch (error: any) {
          console.error(`Error processing 90-day user ${user.id}:`, error);
          errorCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent_30_day: sentCount30,
      sent_90_day: sentCount90,
      errors: errorCount,
      total_30_day: eligible30Day?.length || 0,
      total_90_day: eligible90Day?.length || 0,
    });
  } catch (error: any) {
    logger.error('Error in 30/90-day survey email cron:', error);
    return NextResponse.json(
      { error: error.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}

