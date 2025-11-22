import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';

// Initialize Resend - will be validated before use
const resend = new Resend(process.env.RESEND_API_KEY || '');

/**
 * Send daily action email to a user
 * This is called by the cron job for each user at 7pm in their timezone
 */
export async function POST(request: Request) {
  try {
    // Verify this is called from our cron job (add secret header for security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user data
    const adminSupabase = getSupabaseAdmin();
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, name, username, timezone, subscription_tier, calendar_preferences')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get tomorrow's action (same logic as dashboard)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Check if user already has tomorrow's action
    const { data: existingAction } = await adminSupabase
      .from('user_daily_actions')
      .select('*, actions(*)')
      .eq('user_id', user.id)
      .eq('date', tomorrowStr)
      .single();

    let action;
    if (existingAction) {
      action = existingAction.actions;
    } else {
      // Get actions user hasn't seen in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: recentActions } = await adminSupabase
        .from('user_daily_actions')
        .select('action_id')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgoStr);

      const seenActionIds = recentActions?.map((ra) => ra.action_id) || [];

      // Get available actions
      let { data: actions } = await adminSupabase
        .from('actions')
        .select('*')
        .limit(100);

      if (actions && seenActionIds.length > 0) {
        actions = actions.filter((action) => !seenActionIds.includes(action.id));
      }

      if (!actions || actions.length === 0) {
        // Fallback: get any action
        const { data: allActions } = await adminSupabase
          .from('actions')
          .select('*')
          .limit(100);

        if (allActions && allActions.length > 0) {
          action = allActions[Math.floor(Math.random() * allActions.length)];
        }
      } else {
        action = actions[Math.floor(Math.random() * actions.length)];
      }

      // Save to user_daily_actions
      if (action) {
        await adminSupabase.from('user_daily_actions').insert({
          user_id: user.id,
          action_id: action.id,
          date: tomorrowStr,
        });
      }
    }

    if (!action) {
      return NextResponse.json({ error: 'No action available' }, { status: 404 });
    }

    // Get display name
    const displayName = user.username || (user.name ? user.name.split(' ')[0] : 'there');

    // Check if user has auto-add to calendar enabled
    const prefs = (user.calendar_preferences as any) || {};
    const autoAddEnabled = prefs.auto_add_to_calendar || false;
    const calendarType = prefs.calendar_type || 'google';

    // Generate calendar link for tomorrow's action
    let calendarLink = '';
    if (autoAddEnabled) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startDate = new Date(tomorrow);
      startDate.setHours(9, 0, 0); // 9 AM default
      const endDate = new Date(startDate);
      endDate.setHours(10, 0, 0); // 1 hour event

      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      if (calendarType === 'google') {
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: action.name || 'Daily Action',
          dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
          details: action.description || '',
          sf: 'true',
          output: 'xml',
        });
        calendarLink = `https://calendar.google.com/calendar/render?${params.toString()}`;
      } else {
        const params = new URLSearchParams({
          subject: action.name || 'Daily Action',
          startdt: formatDate(startDate),
          enddt: formatDate(endDate),
          body: action.description || '',
          location: '',
        });
        calendarLink = `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
      }
    }

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever - Tomorrow\'s Action! <action@besthusbandever.com>',
      to: user.email,
      subject: `Tomorrow's Action: ${action.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0f172a; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #fbbf24; margin: 0; font-size: 24px;">Best Husband Ever</h1>
              <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 14px;">Your daily mission, delivered.</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #1e293b; margin-top: 0;">Hi ${displayName},</h2>
              
              <p style="color: #475569; font-size: 16px;">Here's your action for tomorrow:</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #1e293b;">
                  ${action.icon ? `${action.icon} ` : ''}${action.name}
                </p>
                <p style="margin: 10px 0 0 0; color: #64748b; font-size: 15px;">
                  ${action.description}
                </p>
                ${action.benefit ? `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 600; color: #fbbf24; text-transform: uppercase;">Why this matters:</p>
                    <p style="margin: 0; color: #475569; font-size: 14px;">${action.benefit}</p>
                  </div>
                ` : ''}
              </div>
              
              <div style="margin-top: 25px; display: flex; flex-direction: column; gap: 10px;">
                <a href="${process.env.AUTH0_BASE_URL || 'https://besthusbandever.com'}/dashboard" 
                   style="display: inline-block; background-color: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center;">
                  View in Dashboard →
                </a>
                
                ${autoAddEnabled && calendarLink ? `
                  <div style="margin-top: 15px;">
                    <a href="${calendarLink}" 
                       target="_blank"
                       style="display: inline-block; background-color: #0f172a; color: #fbbf24; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 2px solid #fbbf24; text-align: center; width: 100%;">
                      📅 Add to ${calendarType === 'google' ? 'Google' : 'Outlook'} Calendar
                    </a>
                    <p style="color: #64748b; font-size: 11px; margin-top: 8px; text-align: center;">
                      Auto-add enabled: Click to add tomorrow's action to your calendar
                    </p>
                  </div>
                ` : `
                  <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
                    <a href="${process.env.AUTH0_BASE_URL || 'https://besthusbandever.com'}/api/calendar/actions/download?days=1&userId=${user.id}" 
                       style="display: inline-block; background-color: #0f172a; color: #fbbf24; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 2px solid #fbbf24;">
                      📅 Download Tomorrow's Action
                    </a>
                    <a href="${process.env.AUTH0_BASE_URL || 'https://besthusbandever.com'}/api/calendar/actions/download?days=7&userId=${user.id}" 
                       style="display: inline-block; background-color: #0f172a; color: #fbbf24; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 2px solid #fbbf24;">
                      📅 Download 7 Days of Actions
                    </a>
                  </div>
                `}
              </div>
              
              <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                Completing this action boosts your relationship health bar. Consistency is what moves the needle.
              </p>
              <p style="color: #64748b; font-size: 12px; margin-top: 10px;">
                <strong>Tip:</strong> Download actions to your calendar to plan ahead and lock in your commitment! Pre-assigned actions take precedence over the daily algorithm.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
              <p>You&apos;re getting this because you signed up for Best Husband Ever. Your daily mission, delivered.</p>
              <p><a href="${process.env.AUTH0_BASE_URL || 'https://besthusbandever.com'}/dashboard/account" style="color: #64748b;">Manage email preferences</a></p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: emailData?.id });
  } catch (error: any) {
    console.error('Error sending daily action email:', error);
    return NextResponse.json({ error: error.message || 'Unexpected error' }, { status: 500 });
  }
}

