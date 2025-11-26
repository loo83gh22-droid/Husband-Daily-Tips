import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendTomorrowTipEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

/**
 * Cron endpoint to send tomorrow's tips at 5pm in each user's timezone
 * 
 * This endpoint runs every hour and checks which users should receive emails
 * based on their timezone (5pm in their local time).
 * 
 * Set up in Vercel (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-tomorrow-tips",
 *     "schedule": "0 * * * *"  // Every hour
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
  
  const cronSecret = process.env.CRON_SECRET;
  const expectedAuth = `Bearer ${cronSecret}`;
  
  // Allow Vercel Cron (has x-vercel-cron header) or bearer token
  if (cronSecret && authHeader !== expectedAuth) {
    // Check if it's from Vercel Cron (has specific header)
    const vercelCron = request.headers.get('x-vercel-cron');
    if (!vercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Check environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      logger.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json(
        { error: 'Database not configured', message: 'SUPABASE_SERVICE_ROLE_KEY missing' },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      logger.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured', message: 'RESEND_API_KEY missing' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();

    // Get all active users with their timezones
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, timezone')
      .not('email', 'is', null);

    if (usersError) {
      logger.error('Error fetching users:', usersError);
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

    // Filter users: only send to those where it's 5pm (17:00) in their timezone
    const usersToEmail = [];
    for (const user of users) {
      const timezone = user.timezone || 'America/New_York'; // Default timezone
      
      try {
        // Get current time in user's timezone
        const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const hour = userTime.getHours();

        // If it's 5pm (17:00) in their timezone, add to list
        if (hour === 17) {
          usersToEmail.push(user);
        }
      } catch (error) {
        logger.error(`Error processing timezone for user ${user.id}:`, error);
        // Skip this user if timezone is invalid
      }
    }

    if (usersToEmail.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        errors: 0,
        total: users.length,
        message: 'No users to email at this time (not 5pm in any user timezone)',
        checked: users.length,
        currentUtcTime: now.toISOString(),
      });
    }

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let sentCount = 0;
    let errorCount = 0;

    // For each user where it's 5pm, get an action for tomorrow
    for (const user of usersToEmail) {
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
              logger.error(`No actions available for user ${user.id}`);
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
      usersEmailed: usersToEmail.length,
      message: `Sent ${sentCount} emails to users where it's 5pm in their timezone`,
    });
  } catch (error: any) {
    logger.error('Unexpected error in cron job:', error);
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

