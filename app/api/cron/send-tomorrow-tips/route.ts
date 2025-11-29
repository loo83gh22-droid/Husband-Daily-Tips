import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendTomorrowTipEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

// Helper function to get Monday of current week (ISO week start)
const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

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
      .select('id, email, name, timezone, subscription_tier, has_kids, kids_live_with_you, country, work_days')
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
    // Also determine the day of week for each user to format emails accordingly
    const usersToEmail = [];
    for (const user of users) {
      const timezone = user.timezone || 'America/New_York'; // Default timezone
      
      try {
        // Get current time in user's timezone
        const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const hour = userTime.getHours();
        const dayOfWeek = userTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        // If it's 12pm (12:00) in their timezone, add to list with day of week
        if (hour === 12) {
          usersToEmail.push({ ...user, dayOfWeek, timezone });
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
        const dayOfWeek = user.dayOfWeek; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const isMonday = dayOfWeek === 1;
        const isSunday = dayOfWeek === 0;
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday-Friday

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
          work_days: user.work_days ?? null,
        };

        // For Sunday-Thursday, only select weekly_routine actions for daily action
        // For Friday-Saturday, use normal selection (planning_required allowed)
        const { selectTomorrowAction } = await import('@/lib/action-selection');
        const weeklyRoutineOnly = dayOfWeek >= 0 && dayOfWeek <= 4; // Sunday-Thursday
        
        const dailyAction = await selectTomorrowAction(
          user.id,
          user.subscription_tier || 'free',
          categoryScores,
          userProfile,
          weeklyRoutineOnly
        );

        if (!dailyAction) {
          logger.error(`No action selected for user ${user.id}`);
          errorCount++;
          continue;
        }

        // Handle weekly planning actions
        let weeklyPlanningActions = [];
        let weekStartDate: string | null = null;

        if (isSunday || isMonday) {
          // Sunday or Monday: Select 5 planning actions for the week
          const { selectWeeklyPlanningActions } = await import('@/lib/action-selection');
          weeklyPlanningActions = await selectWeeklyPlanningActions(
            user.id,
            user.subscription_tier || 'free',
            categoryScores,
            userProfile
          );

          if (weeklyPlanningActions.length > 0) {
            // Store planning actions for the week
            const mondayDate = getMondayOfWeek(new Date());
            weekStartDate = mondayDate.toISOString().split('T')[0];
            
            await supabase
              .from('user_weekly_planning_actions')
              .upsert({
                user_id: user.id,
                week_start_date: weekStartDate,
                action_ids: weeklyPlanningActions.map(a => a.id),
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id,week_start_date',
              });
          }
        } else if (isWeekday) {
          // Tuesday-Friday: Retrieve stored planning actions
          const mondayDate = getMondayOfWeek(new Date());
          weekStartDate = mondayDate.toISOString().split('T')[0];
          
          const { data: weeklyPlan } = await supabase
            .from('user_weekly_planning_actions')
            .select('action_ids')
            .eq('user_id', user.id)
            .eq('week_start_date', weekStartDate)
            .single();

          if (weeklyPlan?.action_ids && weeklyPlan.action_ids.length > 0) {
            // Fetch the actual action details
            const { data: actions } = await supabase
              .from('actions')
              .select('*')
              .in('id', weeklyPlan.action_ids);
            
            weeklyPlanningActions = actions || [];
          }
        }

        // Get all actions served last week for weekly review (Sunday only)
        // Last week = previous Monday through Sunday (7-13 days ago)
        let allActionsLastWeek = [];
        if (isSunday) {
          // Get last week's Monday (7 days ago, then get that week's Monday)
          const today = new Date();
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(today.getDate() - 7); // Go back 7 days
          const lastWeekMonday = getMondayOfWeek(lastWeekStart);
          const lastWeekStartStr = lastWeekMonday.toISOString().split('T')[0];
          
          // Last week's Sunday (6 days after Monday)
          const lastWeekEnd = new Date(lastWeekMonday);
          lastWeekEnd.setDate(lastWeekMonday.getDate() + 6);
          const lastWeekEndStr = lastWeekEnd.toISOString().split('T')[0];

          // Get ALL actions served last week (from user_daily_actions)
          const { data: servedActions } = await supabase
            .from('user_daily_actions')
            .select('action_id, date, completed, actions(*)')
            .eq('user_id', user.id)
            .gte('date', lastWeekStartStr)
            .lte('date', lastWeekEndStr)
            .order('date', { ascending: true });

          // If no actions in exact week range, try to get recent actions (last 14 days) as fallback
          if (!servedActions || servedActions.length === 0) {
            const today = new Date();
            const twoWeeksAgo = new Date(today);
            twoWeeksAgo.setDate(today.getDate() - 14);
            const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];
            
            const { data: recentActions } = await supabase
              .from('user_daily_actions')
              .select('action_id, date, completed, actions(*)')
              .eq('user_id', user.id)
              .gte('date', twoWeeksAgoStr)
              .lte('date', todayStr)
              .order('date', { ascending: false })
              .limit(7); // Get up to 7 most recent actions
            
            if (recentActions && recentActions.length > 0) {
              // Use recent actions as fallback
              const recentActionIds = new Set(recentActions.map((ra: any) => ra.action_id));
              const { data: recentCompletions } = await supabase
                .from('user_action_completions')
                .select('action_id')
                .eq('user_id', user.id)
                .in('action_id', Array.from(recentActionIds));
              
              const completedActionIds = new Set(recentCompletions?.map(c => c.action_id) || []);
              
              allActionsLastWeek = recentActions
                .map((sa: any) => {
                  const action = sa.actions;
                  if (!action || Array.isArray(action) || !action.id) return null;
                  return {
                    id: action.id,
                    name: action.name,
                    description: action.description,
                    benefit: action.benefit,
                    category: action.category,
                    date: sa.date,
                    completed: sa.completed || completedActionIds.has(sa.action_id),
                  };
                })
                .filter((a: any): a is any => a !== null && typeof a === 'object' && 'id' in a);
            }
          } else {
            // Get completed action IDs from last week
            const { data: completions } = await supabase
              .from('user_action_completions')
              .select('action_id')
              .eq('user_id', user.id)
              .gte('completed_at', lastWeekStartStr)
              .lte('completed_at', lastWeekEndStr);

            const completedActionIds = new Set(completions?.map(c => c.action_id) || []);

            // Map served actions with completion status
            allActionsLastWeek = servedActions
              .map((sa: any) => {
                const action = sa.actions;
                if (!action || Array.isArray(action) || !action.id) return null;
                return {
                  id: action.id,
                  name: action.name,
                  description: action.description,
                  benefit: action.benefit,
                  category: action.category,
                  date: sa.date,
                  completed: sa.completed || completedActionIds.has(sa.action_id),
                };
              })
              .filter((a: any): a is any => a !== null && typeof a === 'object' && 'id' in a); // Filter out any null actions
          }
        }

        // Get a random quote to include in the email
        const { getRandomQuote } = await import('@/lib/quotes');
        const quote = await getRandomQuote();

        // Send email with new format
        // For planning actions, include action IDs and user ID for "Mark as Done" buttons
        const planningActionsWithIds = (isMonday ? weeklyPlanningActions : (isWeekday ? weeklyPlanningActions : [])).map(action => ({
          ...action,
          id: action.id, // Ensure ID is included
        }));

        const success = await sendTomorrowTipEmail(
          user.email,
          user.name || user.email.split('@')[0],
          {
            title: dailyAction.name,
            content: `${dailyAction.description}\n\nWhy this matters: ${dailyAction.benefit || 'Every action strengthens your relationship.'}`,
            category: dailyAction.category,
            quote: quote || undefined,
            actionId: dailyAction.id,
            userId: user.id,
            dayOfWeek,
            weeklyPlanningActions: planningActionsWithIds,
            allActionsLastWeek: isSunday ? allActionsLastWeek : [],
          },
        );

        if (success) {
          sentCount++;
          logger.log(`✅ Email sent to ${user.email} (Day: ${dayOfWeek})`);
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

