import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Check if user has earned any new badges based on their current stats
 */
export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userId: string,
  stats: {
    totalTips: number;
    currentStreak: number;
    totalDays: number;
    actionCounts?: Record<string, number>; // e.g., { 'gratitude_actions': 5, 'surprise_actions': 2 }
  },
  tipCategory?: string,
) {
  // Get all badges user hasn't earned yet
  const { data: earnedBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const earnedBadgeIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);

  // Get all badges
  const { data: allBadges } = await supabase.from('badges').select('*');

  if (!allBadges) return [];

  const newlyEarned: Array<{ badge: any }> = [];

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue; // Already earned

    let earned = false;

    // Check badge requirements
    switch (badge.requirement_type) {
      case 'total_actions':
        if (stats.totalTips >= (badge.requirement_value || 0)) {
          earned = true;
        }
        break;

      case 'streak_days':
        if (stats.currentStreak >= (badge.requirement_value || 0)) {
          earned = true;
        }
        break;

      case 'category_count':
        // Count actions or tips in the matching category
        // For Communication Champion: count communication actions/tips
        // For Romance Rookie: count romance actions/tips
        let categoryCount = 0;

        // Count actions in this category (if actionCounts available)
        if (stats.actionCounts) {
          // Get actions that match this badge's expected category
          // We'll need to check action categories
          const { data: categoryActions } = await supabase
            .from('user_action_completions')
            .select('actions(category)')
            .eq('user_id', userId);

          // Match by badge category field first, then fall back to badge name
          let targetCategory = badge.category || '';
          
          // If no category field, try to determine from badge name
          if (!targetCategory) {
            const badgeName = badge.name.toLowerCase();
            if (badgeName.includes('communication')) targetCategory = 'Communication';
            else if (badgeName.includes('romance')) targetCategory = 'Romance';
            else if (badgeName.includes('gratitude')) targetCategory = 'Gratitude';
            else if (badgeName.includes('partnership')) targetCategory = 'Partnership';
            else if (badgeName.includes('intimacy')) targetCategory = 'Intimacy';
            else if (badgeName.includes('conflict') && badgeName.includes('resolution')) targetCategory = 'Conflict Resolution';
            else if (badgeName.includes('reconnection')) targetCategory = 'Reconnection';
            else if (badgeName.includes('quality') && badgeName.includes('time')) targetCategory = 'Quality Time';
            else if (badgeName.includes('roommate') || badgeName.includes('connection') || badgeName.includes('recovery')) targetCategory = 'Roommate Syndrome Recovery';
            else if (badgeName.includes('outdoor') || badgeName.includes('nature') || badgeName.includes('hiking') || badgeName.includes('walk') || badgeName.includes('camping')) targetCategory = 'Outdoor Activities';
            else if (badgeName.includes('adventure') || badgeName.includes('explore') || badgeName.includes('explorer')) targetCategory = 'Adventure';
            else if (badgeName.includes('active') || badgeName.includes('fitness') || badgeName.includes('sport')) targetCategory = 'Active Together';
          }

          if (targetCategory) {
            categoryCount =
              categoryActions?.filter(
                (ac: any) => ac.actions?.category === targetCategory,
              ).length || 0;
          }

          // Also count tips in this category
          if (targetCategory) {
            const { data: categoryTips } = await supabase
              .from('user_tips')
              .select('tip_id, tips(category)')
              .eq('user_id', userId);

            const tipCount =
              categoryTips?.filter((ct: any) => ct.tips?.category === targetCategory).length || 0;
            categoryCount += tipCount;
          }
        }

        if (categoryCount >= (badge.requirement_value || 0)) {
          earned = true;
        }
        break;

      case 'gratitude_actions':
      case 'surprise_actions':
      case 'apology_actions':
      case 'support_actions':
      case 'date_nights':
      case 'conflict_resolutions':
      case 'love_languages':
      case 'milestone_actions':
      // New outdoor/adventure requirement types
      case 'outdoor_actions':
      case 'walk_actions':
      case 'hiking_actions':
      case 'streaking_actions':
      case 'adventure_actions':
      case 'camping_actions':
      case 'water_activities':
      case 'run_actions':
      case 'sports_actions':
      case 'weekend_streak':
        // Check action completions for this requirement type
        if (stats.actionCounts) {
          const count = stats.actionCounts[badge.requirement_type] || 0;
          if (count >= (badge.requirement_value || 0)) {
            earned = true;
          }
        }
        break;

      case 'challenge_joined':
        // Check if user has joined challenges
        const { data: userChallenges } = await supabase
          .from('user_challenges')
          .select('id')
          .eq('user_id', userId);
        
        if (userChallenges && userChallenges.length >= (badge.requirement_value || 0)) {
          earned = true;
        }
        break;

      case 'challenge_completed':
        // Check if user has completed challenges
        const { data: completedChallenges } = await supabase
          .from('user_challenges')
          .select('id')
          .eq('user_id', userId)
          .eq('completed', true);
        
        if (completedChallenges && completedChallenges.length >= (badge.requirement_value || 0)) {
          earned = true;
        }
        break;

      // Add more requirement types as needed
    }

    if (earned) {
      // Award the badge
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
      });

      newlyEarned.push({
        badge,
      });
    }
  }

  return newlyEarned;
}

/**
 * Calculate progress toward earning a badge (without awarding it)
 */
export async function calculateBadgeProgress(
  supabase: SupabaseClient,
  userId: string,
  badge: any,
  stats: {
    totalTips: number;
    currentStreak: number;
    totalDays: number;
    actionCounts?: Record<string, number>;
  },
): Promise<{ current: number; target: number; percentage: number }> {
  const target = badge.requirement_value || 0;
  let current = 0;

  switch (badge.requirement_type) {
    case 'total_actions':
      current = stats.totalTips;
      break;

    case 'streak_days':
      current = stats.currentStreak;
      break;

      case 'category_count':
        // Count actions or tips in the matching category
        let categoryCount = 0;
        
        // Use badge category field first, then fall back to badge name
        let targetCategory = badge.category || '';
        
        // If no category field, try to determine from badge name
        if (!targetCategory) {
          const badgeName = badge.name.toLowerCase();
          if (badgeName.includes('communication')) targetCategory = 'Communication';
          else if (badgeName.includes('romance')) targetCategory = 'Romance';
          else if (badgeName.includes('gratitude')) targetCategory = 'Gratitude';
          else if (badgeName.includes('partnership')) targetCategory = 'Partnership';
          else if (badgeName.includes('intimacy')) targetCategory = 'Intimacy';
          else if (badgeName.includes('conflict') && badgeName.includes('resolution')) targetCategory = 'Conflict Resolution';
          else if (badgeName.includes('reconnection')) targetCategory = 'Reconnection';
          else if (badgeName.includes('quality') && badgeName.includes('time')) targetCategory = 'Quality Time';
          else if (badgeName.includes('outdoor') || badgeName.includes('nature') || badgeName.includes('hiking') || badgeName.includes('walk') || badgeName.includes('camping')) targetCategory = 'Outdoor Activities';
          else if (badgeName.includes('adventure') || badgeName.includes('explore') || badgeName.includes('explorer')) targetCategory = 'Adventure';
          else if (badgeName.includes('active') || badgeName.includes('fitness') || badgeName.includes('sport')) targetCategory = 'Active Together';
        }

      if (targetCategory) {
        // Count actions in this category
        const { data: categoryActions } = await supabase
          .from('user_action_completions')
          .select('actions(category)')
          .eq('user_id', userId);

        categoryCount =
          categoryActions?.filter(
            (ac: any) => ac.actions?.category === targetCategory,
          ).length || 0;

        // Also count tips in this category
        const { data: categoryTips } = await supabase
          .from('user_tips')
          .select('tip_id, tips(category)')
          .eq('user_id', userId);

        const tipCount =
          categoryTips?.filter((ct: any) => ct.tips?.category === targetCategory).length || 0;
        categoryCount += tipCount;
      }
      current = categoryCount;
      break;

      case 'gratitude_actions':
      case 'surprise_actions':
      case 'apology_actions':
      case 'support_actions':
      case 'date_nights':
      case 'conflict_resolutions':
      case 'love_languages':
      case 'milestone_actions':
      // New outdoor/adventure requirement types
      case 'outdoor_actions':
      case 'walk_actions':
      case 'hiking_actions':
      case 'streaking_actions':
      case 'adventure_actions':
      case 'camping_actions':
      case 'water_activities':
      case 'run_actions':
      case 'sports_actions':
      case 'weekend_streak':
          if (stats.actionCounts) {
            current = stats.actionCounts[badge.requirement_type] || 0;
          }
      break;

    default:
      current = 0;
  }

  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return { current, target, percentage };
}

