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
    challengeCounts?: Record<string, number>; // e.g., { 'gratitude_actions': 5, 'surprise_actions': 2 }
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

  const newlyEarned: Array<{ badge: any; healthBonus: number }> = [];

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
        // Count challenges or tips in the matching category
        // For Communication Champion: count communication challenges/tips
        // For Romance Rookie: count romance challenges/tips
        let categoryCount = 0;

        // Count challenges in this category (if challengeCounts available)
        if (stats.challengeCounts) {
          // Get challenges that match this badge's expected category
          // We'll need to check challenge categories
          const { data: categoryChallenges } = await supabase
            .from('user_challenge_completions')
            .select('challenges(category)')
            .eq('user_id', userId);

          // Match by badge name to determine category
          const badgeName = badge.name.toLowerCase();
          let targetCategory = '';
          if (badgeName.includes('communication')) targetCategory = 'Communication';
          else if (badgeName.includes('romance')) targetCategory = 'Romance';
          else if (badgeName.includes('gratitude')) targetCategory = 'Gratitude';
          else if (badgeName.includes('partnership')) targetCategory = 'Partnership';
          else if (badgeName.includes('intimacy')) targetCategory = 'Intimacy';

          if (targetCategory) {
            categoryCount =
              categoryChallenges?.filter(
                (cc: any) => cc.challenges?.category === targetCategory,
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
        // Check challenge completions for this requirement type
        if (stats.challengeCounts) {
          const count = stats.challengeCounts[badge.requirement_type] || 0;
          if (count >= (badge.requirement_value || 0)) {
            earned = true;
          }
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
        healthBonus: badge.health_bonus || 0,
      });
    }
  }

  return newlyEarned;
}

