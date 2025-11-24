'use client';

import { useEffect, useState } from 'react';
import { toast } from './Toast';

interface NotificationSystemProps {
  currentStreak: number;
  previousStreak?: number;
  healthScore: number;
  previousHealth?: number;
  outstandingActionsCount: number;
  lastActionDate?: string;
}

export default function NotificationSystem({
  currentStreak,
  previousStreak = 0,
  healthScore,
  previousHealth = 0,
  outstandingActionsCount,
  lastActionDate,
}: NotificationSystemProps) {
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once on mount
    if (hasChecked) return;
    setHasChecked(true);

    // Check for streak milestones
    const streakMilestones = [3, 7, 14, 30, 60, 100];
    const crossedMilestone = streakMilestones.find(
      (milestone) => previousStreak < milestone && currentStreak >= milestone
    );

    if (crossedMilestone) {
      const messages: Record<number, string> = {
        3: `🔥 3-day streak! Look at you. Actually doing it.`,
        7: `🔥 7-day streak! You're on fire! Keep going.`,
        14: `🔥 14 days! You're not playing. You're winning.`,
        30: `🔥 30-day streak! You're a legend. Keep going.`,
        60: `🔥 60 days! You're becoming the husband you want to be.`,
        100: `🔥 100 days! Absolute legend status.`,
      };
      toast.success(
        messages[crossedMilestone] || `🔥 ${currentStreak}-day streak! You're on fire!`,
        5000
      );
    } else if (currentStreak > 0 && currentStreak % 7 === 0 && previousStreak < currentStreak) {
      // Weekly milestone
      toast.info(`Week ${Math.floor(currentStreak / 7)} complete! That's the move. Keep it going! 💪`, 4000);
    }

    // Check for outstanding actions warning
    if (outstandingActionsCount > 5) {
      toast.warning(
        `You have ${outstandingActionsCount} outstanding actions. Want to catch up?`,
        6000
      );
    }

    // Check for missed days
    if (lastActionDate) {
      const lastAction = new Date(lastActionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastAction.setHours(0, 0, 0, 0);
      const daysSinceLastAction = Math.floor(
        (today.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastAction > 2 && currentStreak === 0) {
        toast.warning(
          `It's been ${daysSinceLastAction} days since your last action. Ready to get back on track?`,
          6000
        );
      }
    }
  }, [currentStreak, previousStreak, healthScore, previousHealth, outstandingActionsCount, lastActionDate, hasChecked]);

  return null; // This component doesn't render anything
}

