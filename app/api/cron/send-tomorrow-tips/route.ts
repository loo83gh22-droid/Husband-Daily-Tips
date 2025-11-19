import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendTomorrowTipEmail } from '@/lib/email';

/**
 * Cron endpoint to send tomorrow's tips at 12pm
 * 
 * Set up in Vercel:
 * 1. Go to Project Settings → Cron Jobs
 * 2. Add new cron job:
 *    - Path: /api/cron/send-tomorrow-tips
 *    - Schedule: 0 12 * * * (12pm daily)
 * 
 * Or use vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-tomorrow-tips",
 *     "schedule": "0 12 * * *"
 *   }]
 * }
 */

export async function GET(request: Request) {
  // Verify this is a cron request
  // Vercel's proxy may strip/modify Authorization header, so check multiple sources:
  // 1. Standard Authorization header
  // 2. Query parameter (for testing)
  // 3. Custom header that Vercel might preserve
  
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  
  let authHeader = 
    request.headers.get('authorization') || 
    request.headers.get('Authorization') ||
    request.headers.get('AUTHORIZATION') ||
    request.headers.get('x-cron-secret') ||
    (querySecret ? `Bearer ${querySecret}` : null);
  
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json(
        { error: 'Database not configured', message: 'SUPABASE_SERVICE_ROLE_KEY missing' },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured', message: 'RESEND_API_KEY missing' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get all active users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .not('email', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      console.warn('No users found in database');
      return NextResponse.json({
        success: true,
        sent: 0,
        errors: 0,
        total: 0,
        message: 'No users found in database',
      });
    }

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let sentCount = 0;
    let errorCount = 0;

    // For each user, get an action for tomorrow
    for (const user of users) {
      try {
        // Check if user already has an action for tomorrow
        const { data: existingAction } = await supabase
          .from('user_daily_actions')
          .select('action_id, actions(*)')
          .eq('user_id', user.id)
          .eq('date', tomorrowStr)
          .single();

        let action;
        if (existingAction?.actions) {
          action = existingAction.actions;
        } else {
          // Get actions user hasn't seen in the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

          // Get actions user has seen in the last 30 days
          const { data: recentActions } = await supabase
            .from('user_daily_actions')
            .select('action_id')
            .eq('user_id', user.id)
            .gte('date', thirtyDaysAgoStr);

          const seenActionIds = recentActions?.map((ra) => ra.action_id) || [];

          // Get available actions - all actions are available to all tiers
          let { data: actions } = await supabase
            .from('actions')
            .select('*')
            .limit(100);

          // Filter out actions seen in last 30 days
          if (actions && seenActionIds.length > 0) {
            actions = actions.filter((action) => !seenActionIds.includes(action.id));
          }

          if (!actions || actions.length === 0) {
            // Fallback: if no actions available, get any action anyway
            const { data: allActions } = await supabase
              .from('actions')
              .select('*')
              .limit(100);

            if (!allActions || allActions.length === 0) {
              console.error(`No actions available for user ${user.id}`);
              errorCount++;
              continue;
            }
            action = allActions[Math.floor(Math.random() * allActions.length)];
          } else {
            action = actions[Math.floor(Math.random() * actions.length)];
          }

          // Pre-assign action for tomorrow
          await supabase.from('user_daily_actions').insert({
            user_id: user.id,
            action_id: action.id,
            date: tomorrowStr,
            completed: false,
          });
        }

        // Send email with tomorrow's action
        // Note: Resend free tier only allows sending to the account owner's email
        // To send to all users, verify a domain at resend.com/domains
        const success = await sendTomorrowTipEmail(
          user.email,
          user.name || user.email.split('@')[0],
          {
            title: action.name,
            content: `${action.description}\n\nWhy this matters: ${action.benefit || 'Every action strengthens your relationship.'}`,
            category: action.category,
          },
        );

        if (success) {
          sentCount++;
          console.log(`✅ Email sent to ${user.email}`);
        } else {
          errorCount++;
          // Check if it's a Resend domain verification issue
          const isDomainIssue = user.email !== process.env.RESEND_VERIFIED_EMAIL;
          if (isDomainIssue) {
            console.warn(`⚠️  Skipped ${user.email} - Resend free tier only allows sending to verified email. Verify a domain to send to all users.`);
          } else {
            console.error(`❌ Failed to send email to ${user.email}`);
          }
        }
      } catch (error: any) {
        console.error(`Error processing user ${user.id} (${user.email}):`, error?.message || error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: users.length,
    });
  } catch (error: any) {
    console.error('Unexpected error in cron job:', error);
    return NextResponse.json(
      { 
        error: 'Unexpected error',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

