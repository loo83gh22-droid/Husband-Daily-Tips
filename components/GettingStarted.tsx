'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GettingStartedProps {
  userId: string;
  totalCompletions: number;
}

export default function GettingStarted({ userId, totalCompletions }: GettingStartedProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    // Only show if user has 0 completions and hasn't hidden it
    if (totalCompletions === 0) {
      const isHidden = localStorage.getItem(`getting_started_hidden_${userId}`) === 'true';
      setIsVisible(!isHidden);
    }
  }, [userId, totalCompletions]);

  const handleDontShowAgain = async () => {
    setIsHiding(true);
    try {
      // Store in localStorage
      localStorage.setItem(`getting_started_hidden_${userId}`, 'true');
      
      // Also store in database for cross-device sync
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'getting_started_hidden',
          value: 'true',
        }),
      });
      
      setIsVisible(false);
    } catch (error) {
      console.error('Error hiding getting started:', error);
      // Still hide locally even if API fails
      setIsVisible(false);
    } finally {
      setIsHiding(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-slate-900/80 border-2 border-primary-500/30 rounded-xl p-6 md:p-8 mb-6 md:mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2 flex items-center gap-2">
            <span>🚀</span>
            Getting Started
          </h2>
          <p className="text-slate-300 text-base md:text-lg mb-4">
            Welcome! Here&apos;s how to make the most of Best Husband Ever:
          </p>
        </div>
        <button
          onClick={handleDontShowAgain}
          disabled={isHiding}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          aria-label="Don't show this again"
          title="Don't show this again"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-50 mb-1">Complete Your Daily Routine Actions</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              As a Premium member, you&apos;ll receive daily routine actions delivered via email and shown on your dashboard. These are quick, meaningful actions you can complete each day. Click &quot;Mark as done&quot; when you complete them to build your Husband Health score and earn badges.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-50 mb-1">Plan Your Weekly Actions</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Each week, you&apos;ll receive a selection of weekly planning actions. These require a bit more planning and thought, so you can choose which ones fit your schedule and goals. Plan them throughout the week and complete them when ready.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-50 mb-1">Check Your Daily Emails</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Premium members receive daily emails with your routine action for the day. You&apos;ll also receive a weekly summary email that reminds you to look back on what you accomplished during the week, especially helpful if you haven&apos;t been updating daily in the app.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-sm">
            4
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-50 mb-1">Reflect on What Happened</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              After completing an action, take a moment to write down what happened. This helps you remember what worked and builds your journal of wins.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-sm">
            5
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-50 mb-1">Explore All Actions</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Visit the <Link href="/dashboard/actions" className="text-primary-400 hover:text-primary-300 underline font-medium">Actions page</Link> to browse hundreds of actions organized by category. Favorite the ones you want to try.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold text-sm">
            6
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-50 mb-1">Track Your Progress</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Watch your Husband Health score grow as you complete actions consistently. Earn badges for milestones and check your journal to see how far you&apos;ve come.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-primary-500/20">
        <button
          onClick={handleDontShowAgain}
          disabled={isHiding}
          className="text-sm text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
        >
          {isHiding ? 'Hiding...' : "Don't show this again"}
        </button>
        <Link
          href="/dashboard/actions"
          className="px-4 py-2 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors text-sm"
        >
          Explore Actions →
        </Link>
      </div>
    </div>
  );
}

