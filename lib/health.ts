/**
 * Calculate health score with time-based decay
 * 
 * Formula:
 * - Base from streak (up to 70%)
 * - Base from total history (up to 30%)
 * - Decay penalty if last action was > 2 days ago
 */
export function calculateHealthScore(
  stats: {
    totalTips: number;
    currentStreak: number;
    totalDays: number;
    lastActionDate?: string; // YYYY-MM-DD format
  },
  badgeBonuses: number = 0,
): number {
  const { totalTips, currentStreak, totalDays, lastActionDate } = stats;

  // Base score from consistency (streak)
  const baseFromStreak = Math.min(currentStreak * 8, 70);

  // Base score from total history
  const fromHistory = Math.min(totalTips * 2, 30);

  let baseScore = baseFromStreak + fromHistory;

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

