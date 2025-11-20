/**
 * Calculate health score with time-based decay and capped daily accrual
 * 
 * Formula:
 * - Base from streak (up to 50%) - rewards consistency
 * - Base from total days with completions (up to 20%) - rewards overall activity
 * - Daily action completions (capped at 6 points per day) - rewards daily consistency
 * - Decay penalty if last action was > 2 days ago
 * - Badges give 0 health bonus (reference only)
 */
export function calculateHealthScore(
  stats: {
    totalTips: number;
    currentStreak: number;
    totalDays: number;
    lastActionDate?: string; // YYYY-MM-DD format
    uniqueActions?: number; // Count of unique tips + unique actions completed
    totalDailyActionCompletions?: number; // Total days where daily action was completed (capped at 6 per day)
    baselineHealth?: number | null; // Baseline from survey (0-100)
  },
  badgeBonuses: number = 0, // Badges now give 0 bonus (reference only)
): number {
  const { 
    totalTips, 
    currentStreak, 
    totalDays, 
    lastActionDate, 
    uniqueActions = 0,
    totalDailyActionCompletions = 0,
  } = stats;

  // Maximum health accrual is 6 points per day from completing daily actions
  // Each day you complete your daily action, you earn 6 points towards health
  // This prevents inflation from doing many actions in a single day
  // Formula: Each completed daily action day contributes 6 points (capped appropriately)
  
  // Base score from streak - up to 50 points
  // Streak shows consistency and daily engagement
  const baseFromStreak = Math.min(currentStreak * 2, 50);

  // Daily action completions - 6 points per day completed (this is the main health driver)
  // Each day you complete your daily action = 6 points
  // Scale it appropriately so health grows steadily but doesn't cap too quickly
  // 100 days of completion = significant progress, so scale accordingly
  const fromDailyCompletions = Math.min(totalDailyActionCompletions * 0.5, 40); // 80 days = 40 points max

  // Total days with any activity - small bonus for overall engagement
  const fromTotalDays = Math.min(totalDays * 0.2, 10); // Up to 10 points

  // Unique actions bonus - small reward for variety (up to 5 points)
  // Encourages trying different actions but minimal impact
  const uniqueActionsBonus = Math.min(uniqueActions * 0.2, 5);

  let baseScore = baseFromStreak + fromTotalDays + fromDailyCompletions + uniqueActionsBonus;

  // Apply decay if last action was more than 2 days ago
  if (lastActionDate) {
    const lastAction = new Date(lastActionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastAction.setHours(0, 0, 0, 0);

    const daysSinceLastAction = Math.floor(
      (today.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceLastAction > 2) {
      // Decay: lose 2 points per day after 2 days of inactivity
      const decayDays = daysSinceLastAction - 2;
      const decayPenalty = Math.min(decayDays * 2, baseScore); // Can't go below 0
      baseScore = Math.max(0, baseScore - decayPenalty);
    }
  }

  // Badges give 0 bonus now (they're reference only)
  const finalScore = Math.min(100, baseScore + badgeBonuses);

  return Math.max(0, Math.min(100, finalScore));
}

