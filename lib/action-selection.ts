/**
 * Action Selection Algorithm
 * 
 * Combines survey data and user preferences ("Show me more like this")
 * to select actions using weighted random selection.
 */

interface CategoryWeights {
  [category: string]: number;
}

interface Action {
  id: string;
  category: string;
  [key: string]: any;
}

/**
 * Calculate combined weights from survey data and user preferences
 */
export async function calculateCategoryWeights(
  adminSupabase: any,
  userId: string,
  categoryScores?: any
): Promise<CategoryWeights> {
  // Get user category preferences (from "Show me more like this" clicks)
  const { data: userPreferences } = await adminSupabase
    .from('user_category_preferences')
    .select('category, preference_weight')
    .eq('user_id', userId);

  // Convert preferences to map
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

  // Return empty weights (will be calculated per action set)
  return { preferenceWeights, surveyWeights };
}

/**
 * Select actions using weighted random selection based on combined weights
 */
export function selectActionByWeight(
  actions: Action[],
  categoryWeights: CategoryWeights
): Action[] {
  if (!actions || actions.length === 0) {
    return [];
  }

  // Group actions by category
  const actionsByCategory: Record<string, Action[]> = {};
  actions.forEach((action) => {
    if (!actionsByCategory[action.category]) {
      actionsByCategory[action.category] = [];
    }
    actionsByCategory[action.category].push(action);
  });

  // Calculate total weight for weighted random selection
  const totalWeight = Object.entries(categoryWeights).reduce((sum, [category, weight]) => {
    return sum + (actionsByCategory[category] ? weight : 0);
  }, 0);

  if (totalWeight === 0) {
    // No weights, return random action
    return actions;
  }

  // Weighted random selection
  let randomValue = Math.random() * totalWeight;
  let selectedCategory: string | null = null;

  for (const [category, weight] of Object.entries(categoryWeights)) {
    if (actionsByCategory[category]) {
      randomValue -= weight;
      if (randomValue <= 0) {
        selectedCategory = category;
        break;
      }
    }
  }

  // Fallback to random if something went wrong
  if (!selectedCategory || !actionsByCategory[selectedCategory]) {
    const categories = Object.keys(actionsByCategory);
    selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  }

  // Return actions from selected category
  return actionsByCategory[selectedCategory] || actions;
}

/**
 * Calculate final category weights for a set of actions
 */
export function calculateFinalWeights(
  actions: Action[],
  preferenceWeights: Record<string, number>,
  surveyWeights: Record<string, number>
): CategoryWeights {
  const allCategories = new Set<string>();
  actions.forEach((a) => allCategories.add(a.category));
  
  const categoryWeights: CategoryWeights = {};
  allCategories.forEach((category) => {
    const baseWeight = 1.0;
    const surveyWeight = surveyWeights[category] || 0;
    const userPreferenceWeight = preferenceWeights[category] || 0;
    categoryWeights[category] = baseWeight + surveyWeight + userPreferenceWeight;
  });

  return categoryWeights;
}

