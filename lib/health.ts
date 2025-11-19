/**
 * Calculate health score with time-based decay and unique action bonus
 * 
 * Formula:
 * - Base from streak (up to 50%) - rewards consistency
 * - Base from total history (up to 20%) - rewards overall activity
 * - Unique actions bonus (up to 30%) - rewards trying different actions
 * - Decay penalty if last action was > 2 days ago
 */
export function calculateHealthScore(
  stats: {
    totalTips: number;
    currentStreak: number;
    totalDays: number;
    lastActionDate?: string; // YYYY-MM-DD format
    uniqueActions?: number; // Count of unique tips + unique actions completed
  },
  badgeBonuses: number = 0,
): number {
  const { totalTips, currentStreak, totalDays, lastActionDate, uniqueActions = 0 } = stats;

  // Base score from consistency (streak) - reduced from 70 to 50
  const baseFromStreak = Math.min(currentStreak * 6, 50);

  // Base score from total history - reduced from 30 to 20
  const fromHistory = Math.min(totalTips * 1.5, 20);

  // Unique actions bonus - NEW: rewards variety (up to 30 points)
  const uniqueActionsBonus = Math.min(uniqueActions * 3, 30);

  let baseScore = baseFromStreak + fromHistory + uniqueActionsBonus;

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

  // Add badge bonuses (these are permanent boosts)
  const finalScore = Math.min(100, baseScore + badgeBonuses);

  return Math.max(0, Math.min(100, finalScore));
}

