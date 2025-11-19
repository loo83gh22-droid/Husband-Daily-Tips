'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import ChallengeCompletionModal from './ChallengeCompletionModal';

interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: string;
  requirement_type: string | null;
  icon: string | null;
}

interface ChallengeCompletion {
  id: string;
  completed_at: string;
  notes: string | null;
}

interface ChallengesListProps {
  challenges: Challenge[];
  completedMap: Map<string, ChallengeCompletion[]>; // Changed to array of completions
  userId: string;
}

export default function ChallengesList({
  challenges,
  completedMap,
  userId,
}: ChallengesListProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<
    Array<{ name: string; description: string; icon: string; healthBonus: number }>
  >([]);

  const handleCompleteChallenge = async (notes?: string, linkToJournal?: boolean) => {
    if (!selectedChallenge) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          notes: notes || null,
          linkToJournal: linkToJournal || false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      const data = await response.json();

      // Show badge notifications if any were earned
      if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
        setNewlyEarnedBadges(data.newlyEarnedBadges);
        setTimeout(() => setNewlyEarnedBadges([]), 5000);
      }

      // Refresh page to show new completion
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error completing challenge:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
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
          const completions = completedMap.get(challenge.id) || [];
          const completionCount = completions.length;
          const latestCompletion = completions.length > 0 ? completions[0] : null;

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border transition-all ${
                completionCount > 0
                  ? 'bg-primary-500/10 border-primary-500/30'
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {completionCount > 0 && (
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center mb-2">
                      <span className="text-xs font-bold text-slate-950">{completionCount}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleOpenModal(challenge)}
                    disabled={isSubmitting}
                    className="w-6 h-6 rounded border-2 border-primary-500 bg-primary-500/20 hover:bg-primary-500/30 flex items-center justify-center transition-all disabled:opacity-50"
                    aria-label="Mark as complete"
                    title="Complete this challenge"
                  >
                    <svg
                      className="w-4 h-4 text-primary-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    {challenge.icon && <span className="text-lg">{challenge.icon}</span>}
                    <h3 className="text-sm font-semibold text-slate-200">{challenge.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    {challenge.description}
                  </p>
                  {completionCount > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-primary-300 font-medium">
                        Completed {completionCount} time{completionCount !== 1 ? 's' : ''}
                      </p>
                      {latestCompletion && (
                        <p className="text-[10px] text-slate-500">
                          Latest: {format(new Date(latestCompletion.completed_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Modal */}
      {selectedChallenge && (
        <ChallengeCompletionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedChallenge(null);
          }}
          challenge={selectedChallenge}
          onComplete={handleCompleteChallenge}
        />
      )}
    </>
  );
}

