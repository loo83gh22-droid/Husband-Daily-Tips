'use client';

import { useState, useEffect } from 'react';

interface FirstWeekExperienceProps {
  userId: string;
  daysSinceSignup: number;
  totalCompletions: number;
  currentStreak: number;
}

const firstWeekMessages: Record<number, { title: string; message: string; emoji: string }> = {
  1: {
    title: "Welcome! Here's your first action",
    message: "You're starting your journey to becoming the best husband ever. Complete your first action to begin building your health score.",
    emoji: "🚀",
  },
  2: {
    title: "Day 2 - You're on a streak!",
    message: "Keep it going! Consistency is key. Every action you complete builds your relationship health.",
    emoji: "🔥",
  },
  3: {
    title: "3 days in - You're building a habit",
    message: "Great job! You're on your way to making daily actions a natural part of your routine.",
    emoji: "💪",
  },
  4: {
    title: "Day 4 - You're making progress",
    message: "Keep showing up. Small daily actions create big relationship improvements over time.",
    emoji: "⭐",
  },
  5: {
    title: "Day 5 - Almost a week!",
    message: "You're doing great! One more day and you'll earn your first weekly milestone.",
    emoji: "🎯",
  },
  6: {
    title: "Day 6 - Almost there!",
    message: "One more day to complete your first week. You've got this!",
    emoji: "🌟",
  },
  7: {
    title: "🎉 One Week Complete!",
    message: "Congratulations! You've completed your first week. Check your badges to see what you've earned.",
    emoji: "🎉",
  },
};

export default function FirstWeekExperience({
  userId,
  daysSinceSignup,
  totalCompletions,
  currentStreak,
}: FirstWeekExperienceProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show for first 7 days
    if (daysSinceSignup > 0 && daysSinceSignup <= 7) {
      const dismissedKey = `first_week_dismissed_${userId}_${daysSinceSignup}`;
      const dismissed = localStorage.getItem(dismissedKey) === 'true';
      
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [daysSinceSignup, userId]);

  const handleDismiss = () => {
    const dismissedKey = `first_week_dismissed_${userId}_${daysSinceSignup}`;
    localStorage.setItem(dismissedKey, 'true');
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible || isDismissed || daysSinceSignup > 7) {
    return null;
  }

  const dayMessage = firstWeekMessages[daysSinceSignup] || firstWeekMessages[1];

  return (
    <div className="bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-slate-900/80 border-2 border-primary-500/30 rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{dayMessage.emoji}</span>
            <h3 className="text-xl font-bold text-slate-50">
              {dayMessage.title}
            </h3>
          </div>
          <p className="text-slate-300 mb-4">
            {dayMessage.message}
          </p>
          
          {/* Progress indicator for first week */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Week 1 Progress</span>
              <span className="text-sm font-medium text-primary-400">
                {daysSinceSignup}/7 days
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(daysSinceSignup / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="text-slate-400">Actions Completed: </span>
              <span className="text-primary-400 font-semibold">{totalCompletions}</span>
            </div>
            {currentStreak > 0 && (
              <div className="bg-slate-800/50 rounded-lg px-3 py-2">
                <span className="text-slate-400">Current Streak: </span>
                <span className="text-primary-400 font-semibold">{currentStreak} days</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1 ml-4 flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

