import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
import DailyActionCard from '@/components/DailyActionCard';
import StatsCard from '@/components/StatsCard';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import HealthBar from '@/components/HealthBar';
import BadgesDisplay from '@/components/BadgesDisplay';
import DashboardNav from '@/components/DashboardNav';
import SurveyAndWelcomeHandler from '@/components/SurveyAndWelcomeHandler';
import FirstWeekExperience from '@/components/FirstWeekExperience';
import OutstandingActions from '@/components/OutstandingActions';
import OnboardingTour, { TourButton } from '@/components/OnboardingTour';
import QuickActions from '@/components/QuickActions';
import NotificationSystem from '@/components/NotificationSystem';
import ProgressCharts from '@/components/ProgressCharts';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import FollowUpSurveyChecker from '@/components/FollowUpSurveyChecker';
import SurveyPromptChecker from '@/components/SurveyPromptChecker';
import SurveyBanner from '@/components/SurveyBanner';
import TrialExpirationBanner from '@/components/TrialExpirationBanner';
import ReferralTracker from '@/components/ReferralTracker';
import HashScrollHandler from '@/components/HashScrollHandler';
import ReferralCard from '@/components/ReferralCard';
import GettingStarted from '@/components/GettingStarted';
import FreeFloatingQuote from '@/components/FreeFloatingQuote';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import Link from 'next/link';

async function getUserData(auth0Id: string) {
  // Use admin client (service role) to bypass RLS for user lookup during login
  // RLS policies check auth0_id context which isn't set with Auth0 authentication
  const adminSupabase = getSupabaseAdmin();
  const { data: user, error } = await adminSupabase
    .from('users')
      .select('*, subscription_tier, username, name, email, has_kids, kids_live_with_you, trial_started_at, trial_ends_at, country, partner_name, spouse_birthday, work_days, survey_completed, show_all_country_actions, timezone')
    .eq('auth0_id', auth0Id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
  }

  return user;
}

async function getTodayAction(userId: string | null, subscriptionTier: string, timezone?: string | null, categoryScores?: any, userProfile?: { has_kids?: boolean | null; kids_live_with_you?: boolean | null; country?: string | null; work_days?: number[] | null; spouse_birthday?: string | Date | null; show_all_country_actions?: boolean }) {
  if (!userId) return null;

  // Get today's date in the user's timezone (same as email cron)
  // This ensures email and dashboard use the same date
  const userTimezone = timezone || 'America/New_York';
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayInTimezone = dateFormatter.format(now);
  const [year, month, day] = todayInTimezone.split('-').map(Number);
  const today = new Date(year, month - 1, day); // month is 0-indexed
  today.setHours(0, 0, 0, 0); // Set to start of day
  const todayStr = today.toISOString().split('T')[0];
  
  // Get day of week in user's timezone (same as email cron)
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    weekday: 'long',
  });
  const weekdayName = dayFormatter.format(now);
  const weekdayMap: Record<string, number> = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6
  };
  const dayOfWeek = weekdayMap[weekdayName] ?? new Date().getDay();
  
  // For Sunday-Thursday, only select weekly_routine actions (same as email cron)
  const weeklyRoutineOnly = dayOfWeek >= 0 && dayOfWeek <= 4;

  // Use the shared action selection function (same logic as email cron)
  // This ensures consistency between email and dashboard
  // Use selectActionForDate with the timezone-aware date and weeklyRoutineOnly parameter
  const { selectActionForDate } = await import('@/lib/action-selection');
  const action = await selectActionForDate(userId, subscriptionTier, categoryScores, userProfile, weeklyRoutineOnly, today);

  if (!action) {
    return null;
  }

  // Get the user_daily_actions record to include favorited and completed status
  const adminSupabase = getSupabaseAdmin();

  const { data: existingAction } = await adminSupabase
    .from('user_daily_actions')
    .select('id, favorited, completed')
    .eq('user_id', userId)
    .eq('date', todayStr)
    .single();

  return {
    ...action,
    favorited: existingAction?.favorited || false,
    userActionId: existingAction?.id,
    isAction: true, // Flag to indicate this is an action, not a tip
    completed: existingAction?.completed || false, // Include completion status
  };
}

async function getUserStats(userId: string | null) {
  if (!userId) {
    return {
      totalTips: 0,
      currentStreak: 0,
      totalDays: 0,
      totalCompletions: 0,
      badgesCompleted: 0,
      healthScore: 0,
      baselineHealth: null,
    };
  }

  // Use admin client to bypass RLS (Auth0 context isn't set)
  const adminSupabase = getSupabaseAdmin();

  // Get survey summary (baseline health and category scores)
  const { data: surveySummary } = await adminSupabase
    .from('survey_summary')
    .select('baseline_health, communication_score, romance_score, partnership_score, intimacy_score, conflict_score')
    .eq('user_id', userId)
    .single();
  
  const baselineHealth = surveySummary?.baseline_health || null;

  const { data: tips, error } = await adminSupabase
    .from('user_tips')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error || !tips) {
    // Get badge count even if tips fail
    const { data: userBadges } = await adminSupabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId);
    
    const badgesCompleted = userBadges?.length || 0;

    return {
      totalTips: 0,
      currentStreak: 0,
      totalDays: 0,
      totalCompletions: 0,
      badgesCompleted,
      healthScore: baselineHealth || 0,
      baselineHealth,
    };
  }

  const totalTips = tips.length;
  const uniqueDays = new Set(tips.map((t) => t.date)).size;

  // Calculate weekly streak (consecutive weeks with at least one action)
  // Week is defined as Monday-Sunday
  let weeklyStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all unique dates with actions
  const actionDates = new Set(tips.map((t) => t.date));
  
  // Helper to get the Monday of the week for a given date
  const getWeekStart = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0]; // Return YYYY-MM-DD of Monday
  };
  
  // Get all weeks (by Monday date) that have at least one action
  const weeksWithActions = new Set<string>();
  actionDates.forEach(dateStr => {
    const date = new Date(dateStr + 'T00:00:00');
    const weekStart = getWeekStart(date);
    weeksWithActions.add(weekStart);
  });
  
  // Calculate current week's Monday
  const currentWeekStart = getWeekStart(today);
  
  // Check consecutive weeks backwards from current week
  let checkDate = new Date(currentWeekStart + 'T00:00:00');
  
  while (true) {
    const weekStartStr = checkDate.toISOString().split('T')[0];
    if (weeksWithActions.has(weekStartStr)) {
      weeklyStreak++;
      // Go to previous week (subtract 7 days)
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
    
    // Safety limit (100 weeks = ~2 years)
    if (weeklyStreak > 100) break;
  }

  // Get last action date for decay
  const lastActionDate = tips.length > 0 ? tips[0].date : undefined;

  // Get unique actions count (unique tips + unique actions completed)
  // Count unique tips completed
  const { data: completedTips } = await adminSupabase
    .from('user_tips')
    .select('tip_id')
    .eq('user_id', userId)
    .eq('completed', true);

  const uniqueTipIds = new Set(completedTips?.map((t) => t.tip_id) || []);
  
  // Count unique actions completed
  const { data: completedActions } = await adminSupabase
    .from('user_action_completions')
    .select('action_id')
    .eq('user_id', userId);

  const uniqueActionIds = new Set(completedActions?.map((a) => a.action_id) || []);
  
  // Total unique actions = unique tips + unique actions
  const uniqueActions = uniqueTipIds.size + uniqueActionIds.size;

  // Count total days where daily action was completed (capped at 6 points per day)
  const { data: dailyActionCompletions } = await adminSupabase
    .from('user_daily_actions')
    .select('date')
    .eq('user_id', userId)
    .eq('completed', true);

  const totalDailyActionCompletions = dailyActionCompletions?.length || 0;

  // Badges no longer provide health bonuses - they are just awards

  // Calculate health score using new algorithm (async)
  // Includes action points, daily/weekly caps, decay, and repetition penalties
  const { calculateHealthScore } = await import('@/lib/health');
  let healthScore = baselineHealth || 50; // Default to 50 if no baseline
  
  try {
    // Use new async health calculation
    healthScore = await calculateHealthScore({
      baselineHealth,
      userId,
      supabase: adminSupabase,
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    // Fallback to baseline if calculation fails
    healthScore = baselineHealth || 50;
  }

  // Extract category scores for personalization
  const categoryScores = surveySummary ? {
    communication_score: surveySummary.communication_score,
    romance_score: surveySummary.romance_score,
    partnership_score: surveySummary.partnership_score,
    intimacy_score: surveySummary.intimacy_score,
    conflict_score: surveySummary.conflict_score,
  } : null;

  // Get badge count
  const { data: userBadges } = await adminSupabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId);

  let badgesCompleted = userBadges?.length || 0;

  // Calculate total unique completions (tips + actions)
  const totalCompletions = uniqueTipIds.size + uniqueActionIds.size;

  // If user has significantly more badges than completions, there's a mismatch
  // Recalculate badges to ensure they match actual completions
  // This handles cases where completions were deleted but badges weren't updated
  // Also handles cases where badges were awarded incorrectly (e.g., for joining but not completing events)
  if (badgesCompleted > totalCompletions) {
    try {
      const { recalculateUserBadges } = await import('@/lib/recalculate-badges');
      const result = await recalculateUserBadges(adminSupabase as any, userId);
      if (result.success) {
        // Re-fetch badge count after recalculation
        const { data: updatedBadges } = await adminSupabase
          .from('user_badges')
          .select('id')
          .eq('user_id', userId);
        badgesCompleted = updatedBadges?.length || 0;
      }
    } catch (error) {
      console.error('Error recalculating badges on dashboard load:', error);
      // Continue with existing badge count if recalculation fails
    }
  }

  return { 
    totalTips, 
    currentStreak: weeklyStreak, 
    totalDays: uniqueDays,
    totalCompletions, // Add total completions to return value
    badgesCompleted,
    healthScore, 
    baselineHealth,
    categoryScores,
  };
}

export default async function Dashboard() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  
  // Get or create user
  let user = await getUserData(auth0Id);
  
  if (!user) {
    // Create new user - use admin client (service role) to bypass RLS
    // RLS would block user creation with anon key since auth0_id context isn't set
    const adminSupabase = getSupabaseAdmin();
    const { data: newUser, error } = await adminSupabase
      .from('users')
      .insert({
        auth0_id: auth0Id,
        email: session.user.email!,
        name: session.user.name || session.user.email || null,
        subscription_tier: 'free',
        survey_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user in dashboard:', error);
      // If user already exists (duplicate key), try to fetch them
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        console.log('User already exists, fetching...');
        const { data: existingUser } = await adminSupabase
          .from('users')
          .select('*')
          .eq('auth0_id', auth0Id)
          .single();
        if (existingUser) {
          user = existingUser;
        } else {
          // Still can't find user after duplicate error - this is unusual
          // Log it but don't redirect to logout - let them see the page
          console.error('User creation failed with duplicate error but user not found. This should not happen.');
          // Try one more time with upsert
          const { data: upsertedUser } = await adminSupabase
            .from('users')
            .upsert({
              auth0_id: auth0Id,
              email: session.user.email!,
              name: session.user.name || session.user.email || null,
              subscription_tier: 'free',
              survey_completed: false,
            }, {
              onConflict: 'auth0_id'
            })
            .select()
            .single();
          if (upsertedUser) {
            user = upsertedUser;
          }
        }
      } else {
        // Other error - try upsert as fallback
        console.log('Trying upsert as fallback...');
        const { data: upsertedUser, error: upsertError } = await adminSupabase
          .from('users')
          .upsert({
            auth0_id: auth0Id,
            email: session.user.email!,
            name: session.user.name || session.user.email || null,
            subscription_tier: 'free',
            survey_completed: false,
          }, {
            onConflict: 'auth0_id'
          })
          .select()
          .single();
        if (upsertedUser) {
          user = upsertedUser;
          console.log('User created via upsert fallback');
        } else {
          console.error('All user creation attempts failed:', upsertError);
          // Don't redirect to logout - show error message instead
          // User can still use the app, we'll retry on next page load
        }
      }
    } else {
      user = newUser;

      // Send welcome email for new free users
      try {
        if (process.env.RESEND_API_KEY && user.email) {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          const displayName = user.name ? user.name.split(' ')[0] : 'there';
          const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
            to: user.email,
            subject: 'Welcome to Best Husband Ever! 🎉',
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
                      <h1 style="color: #0f172a; font-size: 28px; margin: 0 0 10px 0;">Welcome to Best Husband Ever! 🎉</h1>
                      <p style="color: #64748b; font-size: 16px; margin: 0;">You're all set to start your journey</p>
                    </div>
                    
                    <div style="background-color: #0f172a; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                      <p style="color: #cbd5e1; font-size: 18px; margin: 0 0 15px 0;">Hey ${displayName},</p>
                      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                        Thanks for joining! You're all set to start receiving daily personalized actions that will help you become the husband your partner deserves.
                      </p>
                      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0;">
                        You're starting with a free account, which gives you access to daily actions and all the core features.
                      </p>
                    </div>
                    
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                      <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">What to expect:</h2>
                      <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;"><strong>Daily Action Emails:</strong> You'll receive your action every day at 6am in your timezone (you can set this in your Account Settings)</li>
                        <li style="margin-bottom: 8px;"><strong>Personalized Actions:</strong> Based on your survey, relationship goals, and preferences</li>
                        <li style="margin-bottom: 8px;"><strong>Progress Tracking:</strong> Track your Husband Health score, streaks, and badges</li>
                        <li style="margin-bottom: 8px;"><strong>Private Journal:</strong> Log your wins and see your progress over time</li>
                        <li style="margin-bottom: 8px;"><strong>Team Wins:</strong> Share your completed actions with your partner</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                      <h2 style="color: #1e40af; font-size: 18px; margin: 0 0 12px 0;">✨ Get the Most Out of Your Account:</h2>
                      <p style="color: #1e3a8a; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                        <strong>Personalize your experience</strong> by updating your Account Settings with:
                      </p>
                      <ul style="color: #1e3a8a; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li style="margin-bottom: 6px;">Your partner's name (for personalized action messages)</li>
                        <li style="margin-bottom: 6px;">Your partner's birthday (for birthday-specific actions and reminders)</li>
                        <li style="margin-bottom: 6px;">Your wedding date (to track years married in Team Wins and serve time-appropriate anniversary actions)</li>
                        <li style="margin-bottom: 6px;">Your timezone (so daily emails arrive at the perfect time)</li>
                        <li style="margin-bottom: 6px;">Your work days (so we're mindful of when we're serving specific actions, especially those that require some more planning)</li>
                      </ul>
                      <p style="color: #1e3a8a; font-size: 13px; margin: 12px 0 0 0; font-style: italic;">
                        The more details you share, the more personalized and relevant your daily actions will be!
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="${baseUrl}/dashboard" 
                         style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 15px;">
                        Go to Dashboard →
                      </a>
                      <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">
                        Complete your survey if you haven't already to get personalized actions
                      </p>
                    </div>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                      <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600; margin-bottom: 5px;">💡 Pro Tip:</p>
                      <p style="color: #78350f; font-size: 13px; margin: 0;">
                        Consistency is key. Small daily actions compound into big relationship improvements. Show up every day, even when it's hard.
                      </p>
                    </div>
                    
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                        Questions? Just reply to this email—we're here to help.
                      </p>
                      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                        You're receiving this because you signed up for Best Husband Ever.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
          console.log(`✅ Welcome email sent to ${user.email}`);
        }
      } catch (emailError: any) {
        // Don't fail user creation if email fails
        console.error('Error sending welcome email:', emailError);
      }

      // Check for referral code and track it (client-side will store it in sessionStorage)
      // We'll handle this in a client component that calls the API
    }
  }

  // Don't redirect - show optional survey prompt modal instead
  // Survey is now optional and can be skipped

  // If user is still null after all creation attempts, redirect to login
  // This should rarely happen, but prevents crashes
  if (!user) {
    console.error('Dashboard: User is null after all creation attempts. Redirecting to login.');
    redirect('/api/auth/login');
  }

  const subscriptionTier = user.subscription_tier || 'free';
  
  // Check if user has premium access (paid subscription or active trial)
  const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const now = new Date();
  const hasActiveTrial = user?.subscription_tier === 'premium' && 
                        trialEndsAt && 
                        trialEndsAt > now && 
                        !user?.stripe_subscription_id;
  const hasSubscription = !!user?.stripe_subscription_id;
  const isOnPremium = user?.subscription_tier === 'premium' && hasSubscription;
  const hasPremiumAccess: boolean = !!(isOnPremium || hasActiveTrial);
  
  // Get stats first to get category scores for personalization
  const stats = await getUserStats(user.id);
  
  // Check if user has an active 7-day event - if so, show event action instead of today's action
  // Use admin client to bypass RLS (Auth0 context isn't set)
  const adminSupabase = getSupabaseAdmin();
  const { data: activeChallengeData } = await adminSupabase
    .from('user_challenges')
    .select(`
      *,
      challenges (
        *,
        challenge_actions (
          day_number,
          actions (
            id,
            name,
            description,
            icon,
            benefit,
            category
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('completed', false)
    .order('joined_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  let displayAction = null;
  let isChallengeAction = false;
  let activeChallenge = null;

  if (activeChallengeData && activeChallengeData.challenges) {
    // User has an active 7-day event - show event action
    isChallengeAction = true;
    activeChallenge = activeChallengeData;
    const challenge = activeChallengeData.challenges;
    const challengeActions = challenge?.challenge_actions || [];
    
    // Calculate which day of the 7-day event (1-7)
    const today = new Date();
    const joinedDate = new Date(activeChallengeData.joined_date + 'T00:00:00');
    const daysSinceJoined = Math.floor((today.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentDay = Math.min(Math.max(daysSinceJoined + 1, 1), 7); // Cap at day 1-7

    // Get action for current day
    const todayAction = challengeActions.find(
      (ca: any) => ca.day_number === currentDay
    );

    if (todayAction && todayAction.actions) {
      const action = todayAction.actions;
      const todayStr = today.toISOString().split('T')[0];
      
      // Check if user already has this action assigned for today
      const { data: existingAction } = await adminSupabase
        .from('user_daily_actions')
        .select('*, actions(*)')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .single();

      if (existingAction && existingAction.actions) {
        displayAction = {
          ...existingAction.actions,
          favorited: existingAction.favorited || false,
          userActionId: existingAction.id,
          isAction: true,
          isChallengeAction: true,
          challengeDay: currentDay,
          challengeName: challenge.name.replace(/Challenge/gi, 'Event'),
          challengeId: challenge.id, // Add challenge ID for leave functionality
        };
      } else {
        // Assign 7-day event action for today
        const { data: newAction } = await adminSupabase
          .from('user_daily_actions')
          .insert({
            user_id: user.id,
            action_id: action.id,
            date: todayStr,
          })
          .select('*, actions(*)')
          .single();

        if (newAction && newAction.actions) {
          displayAction = {
            ...newAction.actions,
            favorited: false,
            userActionId: newAction.id,
            isAction: true,
            isChallengeAction: true,
            challengeDay: currentDay,
            challengeName: challenge.name.replace(/Challenge/gi, 'Event'),
            challengeId: challenge.id, // Add challenge ID for leave functionality
          };
        } else {
          // Fallback: just return the action data
          displayAction = {
            ...action,
            isAction: true,
            isChallengeAction: true,
            challengeDay: currentDay,
            challengeName: challenge.name.replace(/Challenge/gi, 'Event'),
            challengeId: challenge.id, // Add challenge ID for leave functionality
          };
        }
      }
    }
  }

  // If no active 7-day event action, get today's action
  if (!displayAction) {
    displayAction = await getTodayAction(
      user.id,
      user.subscription_tier || 'free',
      (user as any).timezone || null,
      stats.categoryScores,
      { 
        has_kids: (user as any).has_kids ?? null, 
        kids_live_with_you: (user as any).kids_live_with_you ?? null,
        country: (user as any).country ?? null,
        work_days: (user as any).work_days ?? null,
        spouse_birthday: (user as any).spouse_birthday ?? null,
        show_all_country_actions: (user as any).show_all_country_actions ?? false
      }
    );
  }

  // Check if today's action is completed and get outstanding count
  const today = new Date().toISOString().split('T')[0];
  const { data: todayAction } = await adminSupabase
    .from('user_daily_actions')
    .select('id, completed')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  const todayActionCompleted = todayAction?.completed || false;
  const todayActionId = displayAction?.id || null;

  // Get outstanding actions count
  const { data: outstandingActions } = await adminSupabase
    .from('user_daily_actions')
    .select('id')
    .eq('user_id', user.id)
    .eq('completed', false)
    .eq('dnc', false)
    .lte('date', today);

  const outstandingCount = outstandingActions?.length || 0;

  // Get last action date for notifications
  const { data: lastAction } = await adminSupabase
    .from('user_daily_actions')
    .select('date')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastActionDate = lastAction?.date || undefined;

  // Check if user is new (created in last 5 minutes) for signup tracking
  const userCreatedAt = user.created_at ? new Date(user.created_at) : null;
  const isNewUser = userCreatedAt && (Date.now() - userCreatedAt.getTime()) < 5 * 60 * 1000; // 5 minutes

  return (
    <div className="min-h-screen bg-slate-950">
      <AnalyticsTracker
        isNewUser={!!isNewUser}
        surveyCompleted={user.survey_completed || false}
        subscriptionTier={subscriptionTier}
      />
      <HashScrollHandler />
      <KeyboardShortcuts />
      <OnboardingTour />
      <TourButton />
      <ReferralTracker />
      <SurveyPromptChecker userId={user.id} surveyCompleted={user.survey_completed || false} />
      <SurveyAndWelcomeHandler 
        userId={user.id} 
        surveyCompleted={user.survey_completed || false}
      />
      <NotificationSystem
        currentStreak={stats.currentStreak}
        healthScore={stats.healthScore}
        outstandingActionsCount={outstandingCount}
        lastActionDate={lastActionDate}
      />
      <FollowUpSurveyChecker />
      <QuickActions
        todayActionId={todayActionId}
        todayActionCompleted={todayActionCompleted}
        outstandingActionsCount={outstandingCount}
      />
      <DashboardNav />

      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 max-w-7xl mx-auto overflow-x-hidden">
        {/* Survey Banner - Show if survey not completed */}
        {!user.survey_completed && (
          <div className="mb-4 sm:mb-6">
            <SurveyBanner surveyCompleted={user.survey_completed || false} />
          </div>
        )}
        
        {/* Trial Expiration Banner - Show if trial is expiring soon */}
        {user.trial_ends_at && (
          <div className="mb-4 sm:mb-6">
            <TrialExpirationBanner trialEndsAt={user.trial_ends_at} />
          </div>
        )}
        
        {/* Subscription Banner */}
        {subscriptionTier === 'free' && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <SubscriptionBanner />
          </div>
        )}

        <div className="grid lg:grid-cols-[1.4fr,1fr] gap-4 sm:gap-6 md:gap-8 lg:gap-8 xl:gap-10 items-start">
          {/* Left column: Daily tip + health bar */}
          <div className="w-full min-w-0 max-w-full">
            {/* First Week Experience - Show for first 7 days */}
            {user.created_at && (() => {
              const daysSinceSignup = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
              return daysSinceSignup <= 7 ? (
                <FirstWeekExperience
                  userId={user.id}
                  daysSinceSignup={daysSinceSignup + 1} // +1 because day 1 is the signup day
                  totalCompletions={stats.totalTips}
                  currentStreak={stats.currentStreak}
                />
              ) : null;
            })()}
            
            {/* Getting Started Section - Only show for users with 0 completions */}
            {stats.totalTips === 0 && (
              <GettingStarted userId={user.id} totalCompletions={stats.totalTips} />
            )}
            
            <div className="flex items-center justify-between mb-4 sm:mb-6" data-tour="action-header">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Today&apos;s Action
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium">
                  {displayAction?.isChallengeAction ? (
                    <>
                      <span className="font-semibold text-slate-50">{displayAction.challengeName}</span> - <span className="text-primary-400">Day {displayAction.challengeDay} of 7</span>
                    </>
                  ) : (
                    <>
                      One move today. One smile tomorrow. You got this.
                    </>
                  )}
                </p>
              </div>
            </div>

            {displayAction ? (
              <div data-tour="action">
                <DailyActionCard 
                  initialTip={displayAction} 
                  subscriptionTier={user.subscription_tier || 'free'}
                  partnerName={user.partner_name || null}
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl shadow-lg p-8 md:p-10 text-center border border-slate-700/50">
                <div className="max-w-md mx-auto">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-slate-50 mb-2">
                    No action available right now
                  </h3>
                  <p className="text-slate-300 mb-6">
                    Your daily action will appear here. Check back later or browse the Actions library to find actions you can do anytime.
                  </p>
                  <Link
                    href="/dashboard/actions"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors"
                  >
                    Browse Actions →
                  </Link>
                </div>
              </div>
            )}


            {/* Outstanding Actions - Premium Feature */}
            <div id="outstanding-actions" className="mt-4 sm:mt-6 md:mt-8 scroll-mt-4">
              <OutstandingActions userId={user.id} hasPremiumAccess={hasPremiumAccess ?? false} />
            </div>

            {/* Free-Floating Quote in Dead Space */}
            <FreeFloatingQuote />
          </div>

          {/* Right column: Health bar + stats */}
          <div className="w-full min-w-0 space-y-4 sm:space-y-6 md:space-y-8">
            <div data-tour="hit-points">
              <HealthBar value={stats.healthScore} />
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6" data-tour="stats">
              <StatsCard
                title="Weekly streak"
                value={stats.currentStreak}
                subtitle="weeks in a row"
                icon="🔥"
                color="warm"
                currentStreak={stats.currentStreak}
              />
              <StatsCard
                title="Total actions"
                value={stats.totalCompletions || 0}
                subtitle="completed so far"
                icon="📈"
                color="blue"
              />
              <StatsCard
                title="Badges completed"
                value={stats.badgesCompleted}
                subtitle="badges earned"
                icon="🏆"
                color="green"
              />
            </div>

            <div data-tour="badges">
              <BadgesDisplay userId={user.id} hasPremiumAccess={hasPremiumAccess ?? false} />
            </div>

            <div>
              <ReferralCard />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}


