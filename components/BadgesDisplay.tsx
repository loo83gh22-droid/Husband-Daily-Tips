'use client';

import { useEffect, useState } from 'react';
import { isNewContent } from '@/lib/is-new-content';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_type: 'consistency' | 'big_idea';
  earned_at?: string;
  created_at?: string;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  } | null;
}

interface BadgesDisplayProps {
  userId: string;
}

export default function BadgesDisplay({ userId }: BadgesDisplayProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const response = await fetch(`/api/badges?userId=${userId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setBadges(data.badges || []);
        } else if (response.status === 401) {
          // Silently handle auth errors - user might not be logged in yet
          setBadges([]);
        }
      } catch (error) {
        // Silently handle errors
        setBadges([]);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchBadges();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <p className="text-sm text-slate-400">Loading badges...</p>
      </div>
    );
  }

  // Deduplicate badges by ID first, then by name (in case API returns duplicates with different IDs but same name)
  const badgesById = new Map(badges.map((badge) => [badge.id, badge]));
  const badgesByName = new Map<string, Badge>();
  
  // If we have duplicates by name, keep the one with earned_at if available, otherwise keep the first
  badgesById.forEach((badge) => {
    const existing = badgesByName.get(badge.name);
    if (!existing) {
      badgesByName.set(badge.name, badge);
    } else {
      // If current badge is earned and existing is not, replace it
      if (badge.earned_at && !existing.earned_at) {
        badgesByName.set(badge.name, badge);
      }
      // If both are earned or both are not, keep the one with better progress
      else if (!badge.earned_at && !existing.earned_at) {
        const badgeProgress = badge.progress?.percentage || 0;
        const existingProgress = existing.progress?.percentage || 0;
        if (badgeProgress > existingProgress) {
          badgesByName.set(badge.name, badge);
        }
      }
    }
  });
  
  const uniqueBadges = Array.from(badgesByName.values());

  const earnedBadges = uniqueBadges.filter((b) => b.earned_at);
  
  // Filter in-progress badges: badges that have officially started (progress > 0%) but not completed (< 100%)
  const allInProgressBadges = uniqueBadges
    .filter((b) => {
      if (b.earned_at) return false; // Already earned
      const progress = b.progress;
      return progress && progress.percentage > 0 && progress.percentage < 100;
    })
    .sort((a, b) => {
      // Sort by completion percentage (descending - closest to completion first)
      const aPercent = a.progress?.percentage || 0;
      const bPercent = b.progress?.percentage || 0;
      return bPercent - aPercent;
    });

  // "Almost There" section: badges at 75%+ completion, limited to top 5
  const almostThereBadges = allInProgressBadges
    .filter((b) => (b.progress?.percentage || 0) >= 75)
    .slice(0, 5);

  // "Getting Started" section: badges at 1-74% completion, limited to top 5
  const gettingStartedBadges = allInProgressBadges
    .filter((b) => {
      const percent = b.progress?.percentage || 0;
      return percent > 0 && percent < 75;
    })
    .slice(0, 5);

  const renderBadgeCard = (badge: Badge, isAlmostThere: boolean = false) => {
    const progress = badge.progress!; // We know it exists from filter
    const remaining = progress.target - progress.current;
    const percentage = progress.percentage || 0;
    const isVeryClose = percentage >= 90;

    // Get motivational message based on completion
    let motivationalMessage = '';
    if (isAlmostThere) {
      if (percentage >= 90) {
        motivationalMessage = 'So close!';
      } else if (percentage >= 85) {
        motivationalMessage = 'Almost there!';
      } else {
        motivationalMessage = 'Keep going!';
      }
    }

    return (
      <div
        key={badge.id}
        className={`p-2 bg-slate-800/30 rounded-lg border transition-all ${
          isVeryClose
            ? 'border-primary-500/50 shadow-lg shadow-primary-500/10'
            : 'border-slate-700/50'
        }`}
        title={`${badge.name}: ${badge.description}`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-lg flex-shrink-0 ${isVeryClose ? '' : 'grayscale'}`}>
            {badge.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <p className="text-[11px] font-medium text-slate-300 leading-tight">
                {badge.name}
              </p>
              {isNewContent(badge.created_at) && (
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold rounded-full border border-emerald-500/30 uppercase tracking-wide">
                  New
                </span>
              )}
              {isAlmostThere && motivationalMessage && (
                <span className="text-[9px] text-primary-400 font-medium">
                  {motivationalMessage}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-700/50 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isVeryClose ? 'bg-primary-400' : 'bg-primary-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                {isAlmostThere && remaining > 0
                  ? `${remaining} more needed`
                  : `${progress.current}/${progress.target}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Badges In Progress</h3>
        <span className="text-xs text-slate-400">
          {earnedBadges.length} / {badges.length}
        </span>
      </div>

      {almostThereBadges.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-3">
            Almost There ({almostThereBadges.length})
          </p>
          <div className="space-y-2">
            {almostThereBadges.map((badge) => renderBadgeCard(badge, true))}
          </div>
        </div>
      )}

      {gettingStartedBadges.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-3">
            Getting Started ({gettingStartedBadges.length})
          </p>
          <div className="space-y-2">
            {gettingStartedBadges.map((badge) => renderBadgeCard(badge, false))}
          </div>
        </div>
      )}

      {almostThereBadges.length === 0 && gettingStartedBadges.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">No badges in progress yet.</p>
      )}
    </div>
  );
}

