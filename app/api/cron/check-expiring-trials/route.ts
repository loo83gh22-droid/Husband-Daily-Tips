import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

// This cron runs daily to check for trials expiring in 1-2 days
// Sends notification emails to remind users to subscribe

export async function GET(request: NextRequest) {
  // Verify this is a cron request (from Vercel Cron)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminSupabase = getSupabaseAdmin();
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Find users with trials expiring in 1-2 days who haven't been notified yet
    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const { data: expiringTrials, error } = await adminSupabase
      .from('users')
      .select('id, email, name, trial_ends_at, trial_notification_sent')
      .eq('subscription_tier', 'premium')
      .not('trial_ends_at', 'is', null)
      .eq('trial_notification_sent', false)
      .gte('trial_ends_at', now.toISOString())
      .lte('trial_ends_at', twoDaysFromNow.toISOString());

    if (error) {
      console.error('Error fetching expiring trials:', error);
      return NextResponse.json(
        { error: 'Failed to fetch expiring trials' },
        { status: 500 }
      );
    }

    if (!expiringTrials || expiringTrials.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expiring trials to notify',
        count: 0,
      });
    }

    let notifiedCount = 0;
    const errors: string[] = [];

    for (const user of expiringTrials) {
      try {
        const trialEndDate = new Date(user.trial_ends_at!);
        const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const userName = user.name || user.email?.split('@')[0] || 'there';

        // Send email notification
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
          to: user.email!,
          subject: `Your free trial ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} - Join Premium for $7/month`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0f172a; font-size: 28px; margin: 0 0 10px 0;">Your Free Trial Ends Soon</h1>
                    <p style="color: #64748b; font-size: 16px; margin: 0;">${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left to join Premium</p>
                  </div>
                  
                  <div style="background-color: #0f172a; border-radius: 8px; padding: 30px; margin-bottom: 30px; text-align: center;">
                    <p style="color: #cbd5e1; font-size: 18px; margin: 0 0 15px 0;">Hey ${userName},</p>
                    <p style="color: #cbd5e1; font-size: 16px; margin: 0 0 20px 0;">
                      Your 7-day free trial ends ${daysRemaining === 1 ? 'tomorrow' : `in ${daysRemaining} days`}. 
                      Don't lose access to all premium features!
                    </p>
                    <div style="background-color: #0ea5e9; color: #ffffff; font-size: 24px; font-weight: 600; padding: 15px; border-radius: 6px; margin: 20px 0;">
                      Join Premium for just $7/month
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; margin: 15px 0 0 0;">
                      Less than $0.25 per day. A no-brainer to level up your biggest win.
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://besthusbandever.com'}/dashboard/subscription" 
                       style="display: inline-block; background-color: #0ea5e9; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Join Premium Now →
                    </a>
                  </div>
                  
                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">What you'll keep with Premium:</h2>
                    <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 8px;">Daily personalized actions</li>
                      <li style="margin-bottom: 8px;">Full Husband Health tracking</li>
                      <li style="margin-bottom: 8px;">Achievement badges</li>
                      <li style="margin-bottom: 8px;">Private journal & Team Wins</li>
                      <li style="margin-bottom: 8px;">All features unlocked</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      If you don't subscribe, you'll be downgraded to the free tier after your trial ends.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        // Mark notification as sent
        await adminSupabase
          .from('users')
          .update({ trial_notification_sent: true })
          .eq('id', user.id);

        notifiedCount++;
      } catch (emailError: any) {
        console.error(`Error sending notification to ${user.email}:`, emailError);
        errors.push(`Failed to notify ${user.email}: ${emailError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      notified: notifiedCount,
      total: expiringTrials.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error checking expiring trials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check expiring trials' },
      { status: 500 }
    );
  }
}

