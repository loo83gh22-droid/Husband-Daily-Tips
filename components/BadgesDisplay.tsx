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
        const response = await fetch(`/api/badges?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setBadges(data.badges || []);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
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

  const earnedBadges = badges.filter((b) => b.earned_at);
  
  // Filter in-progress badges: badges that have officially started (progress > 0%) but not completed (< 100%)
  const inProgressBadges = badges
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
    .slice(0, 10); // Limit to 10 badges

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Your Badges</h3>
        <span className="text-xs text-slate-400">
          {earnedBadges.length} / {badges.length}
        </span>
      </div>

      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide">Earned</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-2 bg-slate-800/50 rounded-lg border border-primary-500/30"
                title={`${badge.name}: ${badge.description}`}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-[10px] text-slate-300 text-center leading-tight">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {inProgressBadges.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide">
            In Progress ({inProgressBadges.length})
          </p>
          <div className="space-y-3">
            {inProgressBadges.map((badge) => {
              const progress = badge.progress!; // We know it exists from filter

              return (
                <div
                  key={badge.id}
                  className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                  title={`${badge.name}: ${badge.description}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl grayscale flex-shrink-0">{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 leading-tight mb-1">
                        {badge.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary-500 h-full rounded-full transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {progress.current}/{progress.target} ({progress.percentage}%)
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

      {inProgressBadges.length === 0 && earnedBadges.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">No badges in progress yet.</p>
      )}
    </div>
  );
}

