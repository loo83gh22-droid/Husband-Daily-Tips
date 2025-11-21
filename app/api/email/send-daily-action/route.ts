import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      .select('id, email, name, username, timezone, subscription_tier')
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

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Best Husband Ever <onboarding@resend.dev>', // TODO: Update to your verified domain once SPF records are configured
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
              <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 14px;">Level up your marriage game</p>
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
              
              <a href="${process.env.AUTH0_BASE_URL || 'https://besthusbandever.com'}/dashboard" 
                 style="display: inline-block; background-color: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">
                View in Dashboard →
              </a>
              
              <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                Completing this action boosts your relationship health bar. Consistency is what moves the needle.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
              <p>You're receiving this because you signed up for Best Husband Ever.</p>
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

