'use client';

import { useEffect, useState } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_type: 'consistency' | 'big_idea';
  earned_at?: string;
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
  const inProgressBadges = uniqueBadges
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
    })
    .slice(0, 6); // Limit to top 6 badges closest to completion

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Your Badges</h3>
        <span className="text-xs text-slate-400">
          {earnedBadges.length} / {badges.length}
        </span>
      </div>

      {inProgressBadges.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-3">
            Almost There ({inProgressBadges.length})
          </p>
          <div className="space-y-2">
            {inProgressBadges.map((badge) => {
              const progress = badge.progress!; // We know it exists from filter

              return (
                <div
                  key={badge.id}
                  className="p-2 bg-slate-800/30 rounded-lg border border-slate-700/50"
                  title={`${badge.name}: ${badge.description}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg grayscale flex-shrink-0">{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-300 leading-tight mb-1">
                        {badge.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700/50 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-primary-500 h-full rounded-full transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                          {progress.current}/{progress.target}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {inProgressBadges.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">No badges in progress yet.</p>
      )}
    </div>
  );
}

