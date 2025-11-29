import { SupabaseClient } from '@supabase/supabase-js';
import { checkAndAwardBadges } from './badges';

/**
 * Recalculate all badges for a user based on their current stats
 * This clears existing badges and re-awards them based on current completions
 */
export async function recalculateUserBadges(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ success: boolean; badgesAwarded: number; error?: string }> {
  try {
    // 1. Get current stats
    const { data: tips } = await supabase
      .from('user_tips')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    const totalTips = tips?.length || 0;
    const uniqueDays = new Set(tips?.map((t) => t.date)).size;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (tips?.some((t) => t.date === dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    // Get action completions for actionCounts
    const { data: actionCompletions } = await supabase
      .from('user_action_completions')
      .select('actions(requirement_type)')
      .eq('user_id', userId);

    const actionCounts: Record<string, number> = {};
    actionCompletions?.forEach((ac: any) => {
      const reqType = ac.actions?.requirement_type;
      if (reqType) {
        actionCounts[reqType] = (actionCounts[reqType] || 0) + 1;
      }
    });

    const stats = {
      totalTips,
      currentStreak: streak,
      totalDays: uniqueDays,
      actionCounts,
    };

    // 2. Clear existing badges
    const { error: clearError } = await supabase
      .from('user_badges')
      .delete()
      .eq('user_id', userId);

    if (clearError) {
      console.error('Error clearing user badges:', clearError);
      return { success: false, badgesAwarded: 0, error: 'Failed to clear existing badges' };
    }

    // 3. Re-award badges based on current stats
    const newlyEarned = await checkAndAwardBadges(supabase, userId, stats);

    return {
      success: true,
      badgesAwarded: newlyEarned.length,
    };
  } catch (error) {
    console.error('Error recalculating badges:', error);
    return {
      success: false,
      badgesAwarded: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

