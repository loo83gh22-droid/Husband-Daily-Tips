import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
import DailyTipCard from '@/components/DailyTipCard';
import StatsCard from '@/components/StatsCard';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import HealthBar from '@/components/HealthBar';
import BadgesDisplay from '@/components/BadgesDisplay';
import DashboardNav from '@/components/DashboardNav';
import OnboardingSurvey from '@/components/OnboardingSurvey';
import ActiveChallenges from '@/components/ActiveChallenges';
import OutstandingActions from '@/components/OutstandingActions';
import OnboardingTour, { TourButton } from '@/components/OnboardingTour';
import QuickActions from '@/components/QuickActions';
import NotificationSystem from '@/components/NotificationSystem';
import ProgressCharts from '@/components/ProgressCharts';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import FollowUpSurveyChecker from '@/components/FollowUpSurveyChecker';
import Link from 'next/link';

async function getUserData(auth0Id: string) {
  // Use admin client (service role) to bypass RLS for user lookup during login
  // RLS policies check auth0_id context which isn't set with Auth0 authentication
  const adminSupabase = getSupabaseAdmin();
  const { data: user, error } = await adminSupabase
    .from('users')
    .select('*, subscription_tier, username, name, email, has_kids, kids_live_with_you')
    .eq('auth0_id', auth0Id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
  }

  return user;
}

async function getTomorrowAction(userId: string | null, subscriptionTier: string, categoryScores?: any, userProfile?: { has_kids?: boolean | null; kids_live_with_you?: boolean | null }) {
  if (!userId) return null;

  // Use admin client to bypass RLS (Auth0 context isn't set)
  const adminSupabase = getSupabaseAdmin();

  // Get tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Check if user has already seen tomorrow's action
  const { data: existingAction } = await adminSupabase
    .from('user_daily_actions')
    .select('*, actions(*)')
    .eq('user_id', userId)
    .eq('date', tomorrowStr)
    .single();

  if (existingAction) {
    return {
      ...existingAction.actions,
      favorited: existingAction.favorited || false,
      userActionId: existingAction.id,
      isAction: true, // Flag to indicate this is an action, not a tip
    };
  }

  // Get actions user hasn't seen in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // Get actions user has seen in the last 30 days
  const { data: recentActions } = await adminSupabase
    .from('user_daily_actions')
    .select('action_id')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgoStr);

  const seenActionIds = recentActions?.map((ra) => ra.action_id) || [];

  // Get available actions - all actions are available to all tiers
  let { data: actions, error } = await adminSupabase
    .from('actions')
    .select('*')
    .limit(100);

  // Filter out actions seen in last 30 days
  if (actions && seenActionIds.length > 0) {
    actions = actions.filter((action) => !seenActionIds.includes(action.id));
  }

  // Filter out kid-related actions if user doesn't have kids (especially if they don't live with them)
  if (actions && userProfile) {
    const hasKids = userProfile.has_kids === true;
    const kidsLiveWithYou = userProfile.kids_live_with_you === true;
    
    // If user explicitly said they don't have kids, or if they have kids but they don't live with them,
    // filter out actions that are clearly kid/family-focused
    if (!hasKids || (hasKids && !kidsLiveWithYou)) {
      const kidKeywords = ['kid', 'child', 'children', 'family', 'parent', 'bedtime', 'school', 'homework', 'playground'];
      actions = actions.filter((action) => {
        const actionText = `${action.name || ''} ${action.description || ''} ${action.benefit || ''}`.toLowerCase();
        // Check if action contains kid-related keywords
        const isKidRelated = kidKeywords.some(keyword => actionText.includes(keyword));
        // If user doesn't have kids at all, filter out all kid-related actions
        // If user has kids but they don't live with them, be more lenient (only filter obvious family activities)
        if (!hasKids) {
          return !isKidRelated;
        } else {
          // If kids don't live with them, filter out actions that require daily presence (bedtime, school, etc.)
          const requiresDailyPresence = ['bedtime', 'school', 'homework', 'playground'].some(keyword => actionText.includes(keyword));
          return !requiresDailyPresence;
        }
      });
    }
  }

  // Personalize action selection based on survey results (areas needing improvement)
  // Priority: Use goal preferences (self-rating + wants improvement) if available
  // Fallback: Use category scores (lowest score = needs most improvement)
  if (actions && categoryScores && actions.length > 0) {
    // Map category names to match action categories
    const categoryMapping: Record<string, string> = {
      'communication': 'Communication',
      'romance': 'Romance',
      'partnership': 'Partnership',
      'intimacy': 'Intimacy',
      'conflict_resolution': 'Conflict Resolution',
      'reconnection': 'Reconnection',
      'quality_time': 'Quality Time',
      'gratitude': 'Gratitude',
    };

    // Get goal preferences from survey summary
    const { data: surveySummary } = await adminSupabase
      .from('survey_summary')
      .select('communication_self_rating, communication_wants_improvement, intimacy_self_rating, intimacy_wants_improvement, partnership_self_rating, partnership_wants_improvement, romance_self_rating, romance_wants_improvement, gratitude_self_rating, gratitude_wants_improvement, conflict_resolution_self_rating, conflict_resolution_wants_improvement, reconnection_self_rating, reconnection_wants_improvement, quality_time_self_rating, quality_time_wants_improvement')
      .eq('user_id', userId)
      .single();

    let targetCategory: string | null = null;

    // Priority 1: Use goal preferences (low self-rating + wants improvement)
    if (surveySummary) {
      const priorityCategories: Array<{ category: string; priority: number }> = [];
      
      // Check each category for goal-based priority
      const goalChecks = [
        { key: 'communication', name: 'Communication' },
        { key: 'intimacy', name: 'Intimacy' },
        { key: 'partnership', name: 'Partnership' },
        { key: 'romance', name: 'Romance' },
        { key: 'gratitude', name: 'Gratitude' },
        { key: 'conflict_resolution', name: 'Conflict Resolution' },
        { key: 'reconnection', name: 'Reconnection' },
        { key: 'quality_time', name: 'Quality Time' },
      ];

      goalChecks.forEach(({ key, name }) => {
        const selfRating = surveySummary[`${key}_self_rating` as keyof typeof surveySummary] as number | null;
        const wantsImprovement = surveySummary[`${key}_wants_improvement` as keyof typeof surveySummary] as boolean | null;
        
        // High priority: low self-rating (1-3) AND wants improvement
        if (selfRating !== null && wantsImprovement === true && selfRating <= 3) {
          // Lower rating = higher priority (1 is highest priority, 3 is lower)
          priorityCategories.push({ category: name, priority: selfRating });
        }
      });

      // Sort by priority (lowest rating = highest priority)
      if (priorityCategories.length > 0) {
        priorityCategories.sort((a, b) => a.priority - b.priority);
        targetCategory = priorityCategories[0].category;
      }
    }

    // Priority 2: Fallback to category scores (lowest score = needs most improvement)
    if (!targetCategory) {
      const connectionScore = categoryScores.connection_score || categoryScores.intimacy_score || 50;
      
      const scores = [
        { category: 'communication', score: categoryScores.communication_score || 50 },
        { category: 'romance', score: categoryScores.romance_score || 50 },
        { category: 'partnership', score: categoryScores.partnership_score || 50 },
        { category: 'intimacy', score: categoryScores.intimacy_score || 50 },
        { category: 'conflict', score: categoryScores.conflict_score || 50 },
        { category: 'connection', score: connectionScore },
      ];
      
      scores.sort((a, b) => a.score - b.score);
      const lowestCategory = scores[0];
      targetCategory = categoryMapping[lowestCategory.category] || categoryMapping[lowestCategory.category.toLowerCase()];
    }

    // Prioritize actions in the target category
    if (targetCategory) {
      const priorityActions = actions.filter((a) => a.category === targetCategory);
      if (priorityActions.length > 0) {
        // 70% chance to pick from priority category, 30% random
        if (Math.random() < 0.7) {
          actions = priorityActions;
        }
      }
    }
  }

  if (error || !actions || actions.length === 0) {
    // Fallback: if no actions available (all seen), get any action anyway
    const { data: allActions } = await adminSupabase
      .from('actions')
      .select('*')
      .limit(100);

    if (!allActions || allActions.length === 0) {
      return null;
    }
    const randomAction = allActions[Math.floor(Math.random() * allActions.length)];

    await adminSupabase.from('user_daily_actions').insert({
      user_id: userId,
      action_id: randomAction.id,
      date: tomorrowStr,
    });

    return {
      ...randomAction,
      isAction: true,
    };
  }

  const randomAction = actions[Math.floor(Math.random() * actions.length)];

  // Save to user_daily_actions
  if (userId) {
    await adminSupabase.from('user_daily_actions').insert({
      user_id: userId,
      action_id: randomAction.id,
      date: tomorrowStr,
    });
  }

  return {
    ...randomAction,
    isAction: true,
  };
}

async function getUserStats(userId: string | null) {
  if (!userId) {
    return {
      totalTips: 0,
      currentStreak: 0,
      totalDays: 0,
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
    return {
      totalTips: 0,
      currentStreak: 0,
      totalDays: 0,
      healthScore: baselineHealth || 0,
      baselineHealth,
    };
  }

  const totalTips = tips.length;
  const uniqueDays = new Set(tips.map((t) => t.date)).size;

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (tips.some((t) => t.date === dateStr)) {
      streak++;
    } else {
      break;
    }
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

  // Get badge bonuses (now 0, but keeping for backward compatibility)
  const { data: userBadges } = await adminSupabase
    .from('user_badges')
    .select('badges(health_bonus)')
    .eq('user_id', userId);

  const totalBadgeBonuses =
    userBadges?.reduce((sum: number, ub: any) => sum + (ub.badges?.health_bonus || 0), 0) || 0;

  // Calculate health score using new algorithm (async)
  // TODO: Fully integrate new health algorithm with action points, daily/weekly caps, decay, etc.
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

  return { 
    totalTips, 
    currentStreak: streak, 
    totalDays: uniqueDays, 
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
      console.error('Error creating user:', error);
      redirect('/api/auth/logout');
    }

    user = newUser;
  }

  // Redirect to survey if not completed
  if (!user.survey_completed) {
    redirect('/dashboard/survey');
  }

  const subscriptionTier = user.subscription_tier || 'free';
  
  // Get stats first to get category scores for personalization
  const stats = await getUserStats(user.id);
  
  // Check if user has an active challenge - if so, show challenge action instead of tomorrow's action
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
    // User has an active challenge - show challenge action
    isChallengeAction = true;
    activeChallenge = activeChallengeData;
    const challenge = activeChallengeData.challenges;
    const challengeActions = challenge?.challenge_actions || [];
    
    // Calculate which day of the challenge (1-7)
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
          challengeName: challenge.name,
        };
      } else {
        // Assign challenge action for today
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
            challengeName: challenge.name,
          };
        } else {
          // Fallback: just return the action data
          displayAction = {
            ...action,
            isAction: true,
            isChallengeAction: true,
            challengeDay: currentDay,
            challengeName: challenge.name,
          };
        }
      }
    }
  }

  // If no active challenge action, get tomorrow's action
  if (!displayAction) {
    displayAction = await getTomorrowAction(
      user.id,
      user.subscription_tier || 'free',
      stats.categoryScores,
      { 
        has_kids: (user as any).has_kids ?? null, 
        kids_live_with_you: (user as any).kids_live_with_you ?? null 
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

  return (
    <div className="min-h-screen bg-slate-950">
      <KeyboardShortcuts />
      <OnboardingTour />
      <TourButton />
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

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Subscription Banner */}
        {subscriptionTier === 'free' && (
          <div className="mb-8">
            <SubscriptionBanner />
          </div>
        )}

        <div className="grid lg:grid-cols-[1.4fr,1fr] gap-8 md:gap-12 items-start">
          {/* Left column: Daily tip + health bar */}
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6" data-tour="mission-header">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">
                  Today&apos;s Mission
                </h2>
                <p className="text-sm md:text-base text-slate-300 font-medium">
                  {displayAction?.isChallengeAction ? (
                    <>
                      <span className="font-semibold text-primary-400">{displayAction.challengeName}</span> - Day {displayAction.challengeDay} of 7
                    </>
                  ) : (
                    <>
                      One move today. One wife smile tomorrow. You got this.
                    </>
                  )}
                </p>
              </div>
            </div>

            {displayAction ? (
              <div data-tour="mission">
                <DailyTipCard tip={displayAction} subscriptionTier={user.subscription_tier || 'free'} />
              </div>
            ) : (
              <div className="bg-slate-900/80 rounded-xl shadow-lg p-8 text-center border border-slate-800">
                <p className="text-slate-300">
                  No action available at the moment. Please check back later.
                </p>
              </div>
            )}


            {/* Outstanding Actions */}
            <div className="mt-8">
              <OutstandingActions userId={user.id} />
            </div>

            {/* Previous Actions Link */}
            <div className="mt-8 text-center">
              <Link
                href="/dashboard/journal"
                className="text-primary-300 hover:text-primary-200 text-base font-semibold transition-colors"
              >
                View your previous actions →
              </Link>
            </div>
          </div>

          {/* Right column: Health bar + stats */}
          <div className="space-y-6 md:space-y-8">
            <div data-tour="hit-points">
              <HealthBar value={stats.healthScore} />
            </div>


            <div className="grid md:grid-cols-3 gap-5 md:gap-6" data-tour="stats">
              <StatsCard
                title="Current streak"
                value={stats.currentStreak}
                subtitle="days in a row"
                icon="🔥"
                color="warm"
                currentStreak={stats.currentStreak}
              />
              <StatsCard
                title="Total actions"
                value={stats.totalTips}
                subtitle="completed so far"
                icon="📈"
                color="blue"
              />
              <StatsCard
                title="Active days"
                value={stats.totalDays}
                subtitle="days you showed up"
                icon="📅"
                color="green"
              />
            </div>

            <div data-tour="badges">
              <BadgesDisplay userId={user.id} />
            </div>
          </div>
        </div>

        {/* Weekly Challenges Section */}
        <ActiveChallenges />
      </main>
    </div>
  );
}


