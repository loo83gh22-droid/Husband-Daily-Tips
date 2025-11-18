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
        // This would require tracking category-specific counts
        // For now, we'll implement basic version
        // TODO: Enhance with category tracking
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

