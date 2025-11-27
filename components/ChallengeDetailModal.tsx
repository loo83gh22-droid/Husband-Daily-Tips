'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { personalizeText } from '@/lib/personalize-text';

interface Challenge {
  id: string;
  name: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  challenge_actions?: Array<{
    day_number: number;
    actions: {
      id: string;
      name: string;
      description: string;
      icon: string;
    };
  }>;
  duration_days?: number;
}

interface ChallengeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  isEnrolled?: boolean;
  onJoin?: (challengeId: string) => void;
  partnerName?: string | null;
}

export default function ChallengeDetailModal({
  isOpen,
  onClose,
  challenge,
  isEnrolled = false,
  onJoin,
  partnerName,
}: ChallengeDetailModalProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [challengeActions, setChallengeActions] = useState<Array<{
    day_number: number;
    actions: {
      id: string;
      name: string;
      description: string;
      icon: string;
    };
  }>>([]);
  const [isLoadingActions, setIsLoadingActions] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fetch 7-day event actions if not already included
  useEffect(() => {
    if (!isOpen || !challenge) {
      setChallengeActions([]);
      return;
    }

    // If event actions are already included, use them (sort by day_number)
    if (challenge.challenge_actions && challenge.challenge_actions.length > 0) {
      const sorted = [...challenge.challenge_actions].sort((a, b) => {
        const dayA = a.day_number || 0;
        const dayB = b.day_number || 0;
        return dayA - dayB;
      });
      setChallengeActions(sorted);
      return;
    }

    // Otherwise, fetch them separately
    if (!challenge.id) return;
    
    const challengeId = challenge.id;
    setIsLoadingActions(true);
    async function fetchChallengeActions() {
      try {
        const response = await fetch(`/api/challenges/${challengeId}/actions`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const actions = data.challenge_actions || [];
          // Sort by day_number
          const sorted = actions.sort((a: any, b: any) => {
            const dayA = a.day_number || 0;
            const dayB = b.day_number || 0;
            return dayA - dayB;
          });
          setChallengeActions(sorted);
        }
      } catch (error) {
        console.error('Error fetching event actions:', error);
      } finally {
        setIsLoadingActions(false);
      }
    }
    fetchChallengeActions();
  }, [isOpen, challenge]);

  // Don't render if not open or no challenge
  if (!isOpen || !challenge) {
    return null;
  }

  const handleJoin = async () => {
    if (isEnrolled || isJoining || !onJoin || !challenge) return;
    
    setIsJoining(true);
    try {
      await onJoin(challenge.id);
      onClose();
    } catch (error) {
      console.error('Error joining 7-day event:', error);
    } finally {
      setIsJoining(false);
    }
  };

  // Compute values directly without useMemo to avoid dependency issues
  const duration = challenge.duration_days || challenge.challenge_actions?.length || 7;
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const today = new Date();
  const isPast = today > endDate;
  const isUpcoming = today < startDate;

  const getThemeColor = (theme: string) => {
    const colors: Record<string, string> = {
      communication: 'border-blue-500/30 bg-blue-500/10',
      intimacy: 'border-pink-500/30 bg-pink-500/10',
      partnership: 'border-emerald-500/30 bg-emerald-500/10',
      romance: 'border-rose-500/30 bg-rose-500/10',
      gratitude: 'border-amber-500/30 bg-amber-500/10',
      conflict_resolution: 'border-purple-500/30 bg-purple-500/10',
      reconnection: 'border-cyan-500/30 bg-cyan-500/10',
      quality_time: 'border-green-500/30 bg-green-500/10',
    };
    return colors[theme] || 'border-slate-700/30 bg-slate-700/10';
  };

  const formatThemeName = (theme: string) => {
    if (theme === 'quality_time') return 'Quality Time';
    if (theme === 'conflict_resolution') return 'Conflict Resolution';
    return theme.charAt(0).toUpperCase() + theme.slice(1).replace(/_/g, ' ');
  };

  const themeColor = getThemeColor(challenge.theme);

  // Use portal to render modal at root level
  if (typeof window === 'undefined') {
    return null;
  }

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 ${themeColor} max-w-2xl w-full p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto pointer-events-auto`}
          onClick={(e) => e.stopPropagation()}
        >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 z-20"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 text-xs font-semibold rounded-full border border-primary-500/30">
                {formatThemeName(challenge.theme)}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{duration} days</span>
                <span>•</span>
                <span className={isEnrolled ? 'text-primary-400' : isPast ? 'text-slate-500' : isUpcoming ? 'text-blue-400' : 'text-green-400'}>
                  {isEnrolled ? 'Active' : isPast ? 'Ended' : isUpcoming ? 'Upcoming' : 'Available'}
                </span>
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-50 mb-3">
              {challenge.name.replace(/Challenge/gi, 'Event')}
            </h3>
            <p className="text-slate-200 text-base md:text-lg leading-relaxed">
              {personalizeText(challenge.description.replace(/\bchallenge\b/gi, '7-day event'), partnerName)}
            </p>
          </div>

          {/* 7-Day Event Actions - Show all 7 */}
          {isLoadingActions ? (
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 text-center">
                Loading event actions...
              </p>
            </div>
          ) : challengeActions.length > 0 ? (
            <div className="mb-6">
              <h4 className="text-lg font-bold text-slate-200 mb-4">What you'll do:</h4>
              <div className="space-y-3">
                {challengeActions.map((ca, index) => {
                  // Handle both nested structure (ca.actions) and flat structure
                  const action = ca.actions || ca;
                  const dayNumber = ca.day_number || index + 1;
                  
                  return (
                    <div
                      key={dayNumber}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-300">
                            {dayNumber}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {action.icon && (
                              <span className="text-xl">{action.icon}</span>
                            )}
                            <h4 className="text-base font-semibold text-slate-100">
                              {personalizeText(action.name, partnerName)}
                            </h4>
                          </div>
                          {action.description && (
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {personalizeText(action.description, partnerName)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <p className="text-sm text-slate-400 text-center">
                No actions available for this 7-day event.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-slate-700 text-slate-300 text-base font-medium rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-all min-h-[48px] touch-manipulation"
            >
              Close
            </button>
            {!isEnrolled && !isPast && (
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="flex-1 px-6 py-3 bg-primary-500 text-slate-950 text-base font-bold rounded-xl hover:bg-primary-400 active:bg-primary-600 transition-all min-h-[48px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : 'Join 7-Day Event'}
              </button>
            )}
            {isEnrolled && (
              <button
                disabled
                className="flex-1 px-6 py-3 bg-slate-700/30 text-slate-500 border border-slate-700 text-base font-medium rounded-xl cursor-not-allowed min-h-[48px]"
              >
                Already Active
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}

