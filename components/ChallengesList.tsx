'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: string;
  requirement_type: string | null;
  icon: string | null;
}

interface ChallengesListProps {
  challenges: Challenge[];
  completedMap: Map<string, string>;
  userId: string;
}

export default function ChallengesList({
  challenges,
  completedMap,
  userId,
}: ChallengesListProps) {
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(
    new Set(Array.from(completedMap.keys())),
  );
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<
    Array<{ name: string; description: string; icon: string; healthBonus: number }>
  >([]);

  const handleToggle = async (challengeId: string, isCompleted: boolean) => {
    setIsToggling(challengeId);

    try {
      const response = await fetch('/api/challenges/complete', {
        method: isCompleted ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challengeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update challenge');
      }

      const data = await response.json();

      // Show badge notifications if any were earned
      if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
        setNewlyEarnedBadges(data.newlyEarnedBadges);
        // Auto-hide badge notification after 5 seconds
        setTimeout(() => setNewlyEarnedBadges([]), 5000);
      }

      // Update local state
      const newCompleted = new Set(localCompleted);
      if (isCompleted) {
        newCompleted.delete(challengeId);
      } else {
        newCompleted.add(challengeId);
      }
      setLocalCompleted(newCompleted);

      // Refresh page to update badge progress
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error toggling challenge:', error);
      alert('Failed to update challenge. Please try again.');
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <>
      {/* Badge notification */}
      {newlyEarnedBadges.length > 0 && (
        <div className="mb-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <p className="text-xs font-semibold text-primary-300 mb-2">🎉 Badge Earned!</p>
          {newlyEarnedBadges.map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2 last:mb-0">
              <span className="text-xl">{badge.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-200">{badge.name}</p>
                <p className="text-xs text-slate-400">{badge.description}</p>
                {badge.healthBonus > 0 && (
                  <p className="text-xs text-primary-300 mt-1">
                    +{badge.healthBonus} health bonus
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {challenges.map((challenge) => {
        const isCompleted = localCompleted.has(challenge.id);
        const completedAt = completedMap.get(challenge.id);

        return (
          <div
            key={challenge.id}
            className={`p-4 rounded-lg border transition-all ${
              isCompleted
                ? 'bg-primary-500/10 border-primary-500/30'
                : 'bg-slate-800/30 border-slate-700/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => handleToggle(challenge.id, isCompleted)}
                disabled={isToggling === challenge.id}
                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-slate-600 hover:border-primary-500'
                } ${isToggling === challenge.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {isCompleted && (
                  <svg
                    className="w-4 h-4 text-slate-950"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  {challenge.icon && <span className="text-lg">{challenge.icon}</span>}
                  <h3
                    className={`text-sm font-semibold ${
                      isCompleted ? 'text-slate-200 line-through' : 'text-slate-200'
                    }`}
                  >
                    {challenge.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  {challenge.description}
                </p>
                {completedAt && (
                  <p className="text-[10px] text-primary-300">
                    Completed {format(new Date(completedAt), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </>
  );
}

