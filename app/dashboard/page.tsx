import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
import DailyActionCard from '@/components/DailyActionCard';
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
import SurveyPromptChecker from '@/components/SurveyPromptChecker';
import SurveyBanner from '@/components/SurveyBanner';
import TrialExpirationBanner from '@/components/TrialExpirationBanner';
import ReferralTracker from '@/components/ReferralTracker';
import ReferralCard from '@/components/ReferralCard';
import Link from 'next/link';

async function getUserData(auth0Id: string) {
  // Use admin client (service role) to bypass RLS for user lookup during login
  // RLS policies check auth0_id context which isn't set with Auth0 authentication
  const adminSupabase = getSupabaseAdmin();
  const { data: user, error } = await adminSupabase
    .from('users')
    .select('*, subscription_tier, username, name, email, has_kids, kids_live_with_you, trial_started_at, trial_ends_at, country, partner_name')
    .eq('auth0_id', auth0Id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
  }

  return user;
}

async function getTomorrowAction(userId: string | null, subscriptionTier: string, categoryScores?: any, userProfile?: { has_kids?: boolean | null; kids_live_with_you?: boolean | null; country?: string | null }) {
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
      completed: existingAction.completed || false, // Include completion status
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

  // Get hidden action IDs for this user
  const { data: hiddenActions } = await adminSupabase
    .from('user_hidden_actions')
    .select('action_id')
    .eq('user_id', userId);

  const hiddenActionIds = hiddenActions?.map((ha) => ha.action_id) || [];

  // Get available actions - all actions are available to all tiers
  let { data: actions, error } = await adminSupabase
    .from('actions')
    .select('*')
    .limit(100);

  // Filter out actions seen in last 30 days
  if (actions && seenActionIds.length > 0) {
    actions = actions.filter((action) => !seenActionIds.includes(action.id));
  }

  // Filter out hidden actions
  if (actions && hiddenActionIds.length > 0) {
    actions = actions.filter((action) => !hiddenActionIds.includes(action.id));
  }

  // Filter out seasonal actions that aren't available today and match user's country
  if (actions) {
    const { isActionAvailableOnDate } = await import('@/lib/seasonal-dates');
    const today = new Date();
    const userCountry = userProfile?.country as 'US' | 'CA' | null || null;
    actions = actions.filter((action) => {
      // Filter by country: if action is country-specific, user must match
      if (action.country && action.country !== userCountry) {
        return false;
      }
      // If action is country-specific but user has no country, don't show it
      if (action.country && !userCountry) {
        return false;
      }
      // Check seasonal date availability
      return isActionAvailableOnDate(action, today, userCountry);
    });
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

  // Combined action selection: Survey data + User preferences ("Show me more like this")
  if (actions && actions.length > 0) {
    // Get user category preferences (from "Show me more like this" clicks)
    const { data: userPreferences } = await adminSupabase
      .from('user_category_preferences')
      .select('category, preference_weight')
      .eq('user_id', userId);

    // Convert preferences to map
    const preferenceWeights: Record<string, number> = {};
    userPreferences?.forEach((pref) => {
      preferenceWeights[pref.category] = parseFloat(pref.preference_weight.toString());
    });

    // Get survey-based priorities
    let surveyWeights: Record<string, number> = {};
    if (categoryScores) {
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

      // Priority 1: Use goal preferences (low self-rating + wants improvement)
      if (surveySummary) {
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
          // Give survey priority category a base weight of 2.0
          if (selfRating !== null && wantsImprovement === true && selfRating <= 3) {
            surveyWeights[name] = 2.0;
          }
        });
      }

      // Priority 2: Fallback to category scores (lowest score = needs most improvement)
      if (Object.keys(surveyWeights).length === 0) {
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
        const targetCategory = categoryMapping[lowestCategory.category] || categoryMapping[lowestCategory.category.toLowerCase()];
        if (targetCategory) {
          surveyWeights[targetCategory] = 2.0;
        }
      }
    }

    // Combine weights: base (1.0) + survey weight + user preference weight
    const allCategories = new Set<string>();
    actions.forEach((a) => allCategories.add(a.category));
    
    const categoryWeights: Record<string, number> = {};
    allCategories.forEach((category) => {
      const baseWeight = 1.0;
      const surveyWeight = surveyWeights[category] || 0;
      const userPreferenceWeight = preferenceWeights[category] || 0;
      categoryWeights[category] = baseWeight + surveyWeight + userPreferenceWeight;
    });

    // Group actions by category
    const actionsByCategory: Record<string, typeof actions> = {};
    actions.forEach((action) => {
      if (!actionsByCategory[action.category]) {
        actionsByCategory[action.category] = [];
      }
      actionsByCategory[action.category].push(action);
    });

    // Calculate total weight for weighted random selection
    const totalWeight = Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0);

    // Weighted random selection
    let randomValue = Math.random() * totalWeight;
    let selectedCategory: string | null = null;

    for (const [category, weight] of Object.entries(categoryWeights)) {
      randomValue -= weight;
      if (randomValue <= 0) {
        selectedCategory = category;
        break;
      }
    }

    // Fallback to random if something went wrong
    if (!selectedCategory || !actionsByCategory[selectedCategory]) {
      selectedCategory = Object.keys(actionsByCategory)[Math.floor(Math.random() * Object.keys(actionsByCategory).length)];
    }

    // Filter actions to selected category
    if (selectedCategory && actionsByCategory[selectedCategory]) {
      actions = actionsByCategory[selectedCategory];
    }
  }

  if (error || !actions || actions.length === 0) {
    // Fallback: if no actions available (all seen or hidden), get any action that's not hidden
    const { data: allActions } = await adminSupabase
      .from('actions')
      .select('*')
      .limit(100);

    if (!allActions || allActions.length === 0) {
      return null;
    }

    // Filter out hidden actions and country-specific actions in fallback
    const userCountry = userProfile?.country as 'US' | 'CA' | null || null;
    const availableActions = allActions.filter((action) => {
      // Filter out hidden actions
      if (hiddenActionIds.includes(action.id)) {
        return false;
      }
      // Filter by country: if action is country-specific, user must match
      if (action.country && action.country !== userCountry) {
        return false;
      }
      // If action is country-specific but user has no country, don't show it
      if (action.country && !userCountry) {
        return false;
      }
      return true;
    });

    if (availableActions.length === 0) {
      return null; // All actions are hidden
    }

    const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];

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

    // Check for referral code and track it (client-side will store it in sessionStorage)
    // We'll handle this in a client component that calls the API
  }

  // Don't redirect - show optional survey prompt modal instead
  // Survey is now optional and can be skipped

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
        kids_live_with_you: (user as any).kids_live_with_you ?? null,
        country: (user as any).country ?? null
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
      <ReferralTracker />
      <SurveyPromptChecker userId={user.id} surveyCompleted={user.survey_completed || false} />
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

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 lg:py-12 max-w-full overflow-x-hidden">
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

        <div className="grid lg:grid-cols-[1.4fr,1fr] gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-start">
          {/* Left column: Daily tip + health bar */}
          <div className="max-w-3xl w-full">
            <div className="flex items-center justify-between mb-4 sm:mb-6" data-tour="action-header">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-50 mb-1 sm:mb-2">
                  Today&apos;s Action
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium">
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
              <div data-tour="action">
                <DailyActionCard 
                  initialTip={displayAction} 
                  subscriptionTier={user.subscription_tier || 'free'}
                  partnerName={user.partner_name || null}
                />
              </div>
            ) : (
              <div className="bg-slate-900/80 rounded-xl shadow-lg p-8 text-center border border-slate-800">
                <p className="text-slate-300">
                  No action available at the moment. Please check back later.
                </p>
              </div>
            )}


            {/* Outstanding Actions */}
            <div className="mt-4 sm:mt-6 md:mt-8">
              <OutstandingActions userId={user.id} />
            </div>

            {/* Previous Actions Link */}
            <div className="mt-4 sm:mt-6 md:mt-8 text-center">
              <Link
                href="/dashboard/journal"
                className="text-primary-300 hover:text-primary-200 text-sm sm:text-base font-semibold transition-colors"
              >
                View your previous actions →
              </Link>
            </div>
          </div>

          {/* Right column: Health bar + stats */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <div data-tour="hit-points">
              <HealthBar value={stats.healthScore} />
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6" data-tour="stats">
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

            <div>
              <ReferralCard />
            </div>
          </div>
        </div>

        {/* Weekly Challenges Section */}
        <ActiveChallenges />
      </main>
    </div>
  );
}


