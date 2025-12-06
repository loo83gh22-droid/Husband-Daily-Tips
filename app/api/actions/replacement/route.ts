import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Get a replacement action for today when user hides the current one
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { excludedActionId } = await request.json();
    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    // Get user ID
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, subscription_tier, has_kids, kids_live_with_you, country')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get today's date (dashboard shows today's action)
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

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

    // Get hidden action IDs
    const { data: hiddenActions } = await adminSupabase
      .from('user_hidden_actions')
      .select('action_id')
      .eq('user_id', user.id);

    const hiddenActionIds = hiddenActions?.map((ha) => ha.action_id) || [];

    // Get available actions
    let { data: actions } = await adminSupabase
      .from('actions')
      .select('*')
      .limit(100);

    // Filter out seen actions
    if (actions && seenActionIds.length > 0) {
      actions = actions.filter((action) => !seenActionIds.includes(action.id));
    }

    // Filter out hidden actions
    if (actions && hiddenActionIds.length > 0) {
      actions = actions.filter((action) => !hiddenActionIds.includes(action.id));
    }

    // Filter out the excluded action (the one being hidden)
    if (actions && excludedActionId) {
      actions = actions.filter((action) => action.id !== excludedActionId);
    }

    // Filter out seasonal actions that aren't available today and match user's country
    if (actions) {
      const { isActionAvailableOnDate } = await import('@/lib/seasonal-dates');
      const today = new Date();
      const userCountry = user.country as 'US' | 'CA' | null || null;
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

    // Filter out kid-related actions if user doesn't have kids
    if (actions && user) {
      const hasKids = user.has_kids === true;
      const kidsLiveWithYou = user.kids_live_with_you === true;
      
      if (!hasKids || (hasKids && !kidsLiveWithYou)) {
        const kidKeywords = ['kid', 'child', 'children', 'family', 'parent', 'bedtime', 'school', 'homework', 'playground'];
        actions = actions.filter((action) => {
          const actionText = `${action.name || ''} ${action.description || ''} ${action.benefit || ''}`.toLowerCase();
          const isKidRelated = kidKeywords.some(keyword => actionText.includes(keyword));
          if (!hasKids) {
            return !isKidRelated;
          } else {
            const requiresDailyPresence = ['bedtime', 'school', 'homework', 'playground'].some(keyword => actionText.includes(keyword));
            return !requiresDailyPresence;
          }
        });
      }
    }

    // Get category scores for personalization
    const { data: surveySummary } = await adminSupabase
      .from('survey_summary')
      .select('communication_self_rating, communication_wants_improvement, intimacy_self_rating, intimacy_wants_improvement, partnership_self_rating, partnership_wants_improvement, romance_self_rating, romance_wants_improvement, gratitude_self_rating, gratitude_wants_improvement, conflict_resolution_self_rating, conflict_resolution_wants_improvement, reconnection_self_rating, reconnection_wants_improvement, quality_time_self_rating, quality_time_wants_improvement, communication_score, romance_score, partnership_score, intimacy_score, conflict_score')
      .eq('user_id', user.id)
      .single();

    const categoryScores = surveySummary ? {
      communication_score: surveySummary.communication_score,
      romance_score: surveySummary.romance_score,
      partnership_score: surveySummary.partnership_score,
      intimacy_score: surveySummary.intimacy_score,
      conflict_score: surveySummary.conflict_score,
    } : null;

    // Use same weighted selection algorithm as dashboard
    if (actions && actions.length > 0) {
      // Get user category preferences
      const { data: userPreferences } = await adminSupabase
        .from('user_category_preferences')
        .select('category, preference_weight')
        .eq('user_id', user.id);

      const preferenceWeights: Record<string, number> = {};
      userPreferences?.forEach((pref) => {
        preferenceWeights[pref.category] = parseFloat(pref.preference_weight.toString());
      });

      // Get survey-based priorities
      let surveyWeights: Record<string, number> = {};
      if (categoryScores && surveySummary) {
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

        if (Object.keys(surveyWeights).length === 0) {
          const connectionScore = categoryScores.intimacy_score || 50;
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

      // Combine weights
      const allCategories = new Set<string>();
      actions.forEach((a) => allCategories.add(a.category));
      
      const categoryWeights: Record<string, number> = {};
      allCategories.forEach((category) => {
        const baseWeight = 1.0;
        const surveyWeight = surveyWeights[category] || 0;
        const userPreferenceWeight = preferenceWeights[category] || 0;
        categoryWeights[category] = baseWeight + surveyWeight + userPreferenceWeight;
      });

      const actionsByCategory: Record<string, typeof actions> = {};
      actions.forEach((action) => {
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
      return NextResponse.json(
        { error: 'No replacement actions available' },
        { status: 404 }
      );
    }

    // Pick random action from available
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    // Save to user_daily_actions for today (replace existing if any)
    // First, delete any existing action for today
    await adminSupabase
      .from('user_daily_actions')
      .delete()
      .eq('user_id', user.id)
      .eq('date', todayStr);

    // Insert the new replacement action
    const { data: newAction, error: insertError } = await adminSupabase
      .from('user_daily_actions')
      .insert({
        user_id: user.id,
        action_id: randomAction.id,
        date: todayStr,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving replacement action:', insertError);
      // Still return the action even if save fails
    }

    return NextResponse.json({
      action: {
        ...randomAction,
        isAction: true,
        userActionId: null, // Will be set when saved
      },
    });
  } catch (error: any) {
    console.error('Error in replacement action endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

