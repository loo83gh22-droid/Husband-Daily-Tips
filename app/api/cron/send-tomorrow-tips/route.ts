import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendTomorrowTipEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

/**
 * Cron endpoint to send tomorrow's tips at 12pm (noon) in each user's timezone
 * 
 * This endpoint runs every hour and checks which users should receive emails
 * based on their timezone (12pm in their local time).
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

    // Get all active users with their timezones and profile data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, timezone, subscription_tier, has_kids, kids_live_with_you, country')
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

    // Filter users: only send to those where it's 12pm (12:00) in their timezone
    const usersToEmail = [];
    for (const user of users) {
      const timezone = user.timezone || 'America/New_York'; // Default timezone
      
      try {
        // Get current time in user's timezone
        const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const hour = userTime.getHours();

        // If it's 12pm (12:00) in their timezone, add to list
        if (hour === 12) {
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
        message: 'No users to email at this time (not 12pm in any user timezone)',
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

    // For each user where it's 12pm, get an action for tomorrow
    for (const user of usersToEmail) {
      try {
        // Get user's category scores from survey_summary for personalized action selection
        const { data: surveySummary } = await supabase
          .from('survey_summary')
          .select('communication_score, romance_score, partnership_score, intimacy_score, conflict_score')
          .eq('user_id', user.id)
          .single();

        const categoryScores = surveySummary ? {
          communication_score: surveySummary.communication_score,
          romance_score: surveySummary.romance_score,
          partnership_score: surveySummary.partnership_score,
          intimacy_score: surveySummary.intimacy_score,
          conflict_score: surveySummary.conflict_score,
        } : undefined;

        // Get user profile data
        const userProfile = {
          has_kids: user.has_kids ?? null,
          kids_live_with_you: user.kids_live_with_you ?? null,
          country: user.country ?? null,
        };

        // Use the shared action selection function (same logic as dashboard)
        // This ensures the email matches what will appear on the dashboard
        const { selectTomorrowAction } = await import('@/lib/action-selection');
        const action = await selectTomorrowAction(
          user.id,
          user.subscription_tier || 'free',
          categoryScores,
          userProfile
        );

        if (!action) {
          logger.error(`No action selected for user ${user.id}`);
          errorCount++;
          continue;
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
          logger.log(`✅ Email sent to ${user.email}`);
        } else {
          errorCount++;
          // Check if it's a Resend domain verification issue
          const isDomainIssue = user.email !== process.env.RESEND_VERIFIED_EMAIL;
          if (isDomainIssue) {
            logger.warn(`⚠️  Skipped ${user.email} - Resend free tier only allows sending to verified email. Verify a domain to send to all users.`);
          } else {
            logger.error(`❌ Failed to send email to ${user.email}`);
          }
        }
      } catch (error: any) {
        logger.error(`Error processing user ${user.id} (${user.email}):`, error?.message || error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: users.length,
      usersEmailed: usersToEmail.length,
      message: `Sent ${sentCount} emails to users where it's 12pm in their timezone`,
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

