'use client';

import { useEffect, useState } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_type: 'consistency' | 'big_idea';
  earned_at?: string;
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
  const pendingBadges = badges.filter((b) => !b.earned_at);

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

      {pendingBadges.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide">In Progress</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {pendingBadges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-2 bg-slate-800/20 rounded-lg border border-slate-700/50 opacity-50"
                title={`${badge.name}: ${badge.description}`}
              >
                <span className="text-2xl mb-1 grayscale">{badge.icon}</span>
                <span className="text-[10px] text-slate-500 text-center leading-tight">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
          {pendingBadges.length > 6 && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              +{pendingBadges.length - 6} more to unlock
            </p>
          )}
        </div>
      )}

      {badges.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">No badges available yet.</p>
      )}
    </div>
  );
}

