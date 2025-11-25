import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Assign 7 days of actions to a user
 * This is called when a user downloads 7 days to calendar or joins a 7-day challenge
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { days = 7 } = await request.json();

    // Generate actions for the next N days
    const today = new Date();
    const assignedActions = [];

    // Get user's survey data for personalization
    const { data: surveySummary } = await adminSupabase
      .from('survey_summary')
      .select('communication_score, romance_score, partnership_score, intimacy_score, conflict_score')
      .eq('user_id', user.id)
      .single();

    const categoryScores = surveySummary || {};

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];

      // Check if action already exists
      const { data: existingAction } = await adminSupabase
        .from('user_daily_actions')
        .select('action_id')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .single();

      if (existingAction) {
        // Already assigned, skip
        continue;
      }

      // Generate new action using same algorithm
      const action = await generateActionForDate(user.id, dateStr, categoryScores, adminSupabase);
      if (action) {
        assignedActions.push({
          date: dateStr,
          action: {
            id: action.id,
            name: action.name,
            category: action.category,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      assigned: assignedActions.length,
      total: days,
      actions: assignedActions,
    });
  } catch (error: any) {
    console.error('Error assigning week of actions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign actions' },
      { status: 500 }
    );
  }
}

async function generateActionForDate(
  userId: string,
  dateStr: string,
  categoryScores: any,
  adminSupabase: any,
): Promise<any> {
  // Get actions user hasn't seen in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: recentActions } = await adminSupabase
    .from('user_daily_actions')
    .select('action_id')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgoStr);

  const seenActionIds = recentActions?.map((ra: any) => ra.action_id) || [];

  // Get hidden action IDs for this user
  const { data: hiddenActions } = await adminSupabase
    .from('user_hidden_actions')
    .select('action_id')
    .eq('user_id', userId);

  const hiddenActionIds = hiddenActions?.map((ha: any) => ha.action_id) || [];

  // Get available actions
  let { data: actions } = await adminSupabase
    .from('actions')
    .select('*')
    .limit(100);

  // Filter out actions seen in last 30 days
  if (actions && seenActionIds.length > 0) {
    actions = actions.filter((action: any) => !seenActionIds.includes(action.id));
  }

  // Filter out hidden actions
  if (actions && hiddenActionIds.length > 0) {
    actions = actions.filter((action: any) => !hiddenActionIds.includes(action.id));
  }

  // Combined action selection: Survey data + User preferences ("Show me more like this")
  if (actions && actions.length > 0) {
    // Get user category preferences
    const { data: userPreferences } = await adminSupabase
      .from('user_category_preferences')
      .select('category, preference_weight')
      .eq('user_id', userId);

    const preferenceWeights: Record<string, number> = {};
    userPreferences?.forEach((pref: any) => {
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

      const { data: surveySummary } = await adminSupabase
        .from('survey_summary')
        .select('communication_self_rating, communication_wants_improvement, intimacy_self_rating, intimacy_wants_improvement, partnership_self_rating, partnership_wants_improvement, romance_self_rating, romance_wants_improvement, gratitude_self_rating, gratitude_wants_improvement, conflict_resolution_self_rating, conflict_resolution_wants_improvement, reconnection_self_rating, reconnection_wants_improvement, quality_time_self_rating, quality_time_wants_improvement')
        .eq('user_id', userId)
        .single();

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
          if (selfRating !== null && wantsImprovement === true && selfRating <= 3) {
            surveyWeights[name] = 2.0;
          }
        });
      }

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

    // Combine weights and use weighted random selection
    const allCategories = new Set<string>();
    actions.forEach((a: any) => allCategories.add(a.category));
    
    const categoryWeights: Record<string, number> = {};
    allCategories.forEach((category) => {
      const baseWeight = 1.0;
      const surveyWeight = surveyWeights[category] || 0;
      const userPreferenceWeight = preferenceWeights[category] || 0;
      categoryWeights[category] = baseWeight + surveyWeight + userPreferenceWeight;
    });

    const actionsByCategory: Record<string, typeof actions> = {};
    actions.forEach((action: any) => {
      if (!actionsByCategory[action.category]) {
        actionsByCategory[action.category] = [];
      }
      actionsByCategory[action.category].push(action);
    });

    const totalWeight = Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0);
    let randomValue = Math.random() * totalWeight;
    let selectedCategory: string | null = null;

    for (const [category, weight] of Object.entries(categoryWeights)) {
      randomValue -= weight;
      if (randomValue <= 0) {
        selectedCategory = category;
        break;
      }
    }

    if (selectedCategory && actionsByCategory[selectedCategory]) {
      actions = actionsByCategory[selectedCategory];
    }
  }

  if (!actions || actions.length === 0) {
    // Fallback: get any action that's not hidden
    const { data: allActions } = await adminSupabase
      .from('actions')
      .select('*')
      .limit(100);

    if (!allActions || allActions.length === 0) {
      return null;
    }

    // Filter out hidden actions even in fallback
    const availableActions = hiddenActionIds.length > 0
      ? allActions.filter((action: any) => !hiddenActionIds.includes(action.id))
      : allActions;

    if (availableActions.length === 0) {
      return null; // All actions are hidden
    }

    actions = availableActions;
  }

  const randomAction = actions[Math.floor(Math.random() * actions.length)];

  // Save to user_daily_actions (this ensures algorithm respects pre-assigned actions)
  await adminSupabase.from('user_daily_actions').insert({
    user_id: userId,
    action_id: randomAction.id,
    date: dateStr,
  });

  return randomAction;
}

