import { getSupabaseAdmin } from '@/lib/supabase';

interface UserProfile {
  has_kids?: boolean | null;
  kids_live_with_you?: boolean | null;
  country?: string | null;
}

interface CategoryScores {
  communication_score?: number;
  romance_score?: number;
  partnership_score?: number;
  intimacy_score?: number;
  conflict_score?: number;
  connection_score?: number;
  [key: string]: any;
}

/**
 * Shared function to select tomorrow's action for a user
 * This ensures the email and dashboard use the same logic
 */
export async function selectTomorrowAction(
  userId: string,
  subscriptionTier: string,
  categoryScores?: CategoryScores,
  userProfile?: UserProfile
) {
  const adminSupabase = getSupabaseAdmin();

  // Get tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Check if user has already been assigned an action for tomorrow
  // This could be from a manual change or 7-day event
  const { data: existingAction } = await adminSupabase
    .from('user_daily_actions')
    .select('*, actions(*)')
    .eq('user_id', userId)
    .eq('date', tomorrowStr)
    .single();

  if (existingAction?.actions) {
    // User already has an action assigned (from manual change or 7-day event)
    return existingAction.actions;
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

    // Save to user_daily_actions
    await adminSupabase.from('user_daily_actions').insert({
      user_id: userId,
      action_id: randomAction.id,
      date: tomorrowStr,
    });

    return randomAction;
  }

  const randomAction = actions[Math.floor(Math.random() * actions.length)];

  // Save to user_daily_actions
  await adminSupabase.from('user_daily_actions').insert({
    user_id: userId,
    action_id: randomAction.id,
    date: tomorrowStr,
  });

  return randomAction;
}
