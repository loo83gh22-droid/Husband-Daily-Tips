'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
}

export default function ChallengeDetailModal({
  isOpen,
  onClose,
  challenge,
  isEnrolled = false,
  onJoin,
}: ChallengeDetailModalProps) {
  const [isJoining, setIsJoining] = useState(false);

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
      console.error('Error joining challenge:', error);
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
            <span className="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-300 text-sm font-semibold rounded-full mb-3 border border-primary-500/30">
              {formatThemeName(challenge.theme)}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2">
              {challenge.name}
            </h3>
            <p className="text-slate-300 text-base leading-relaxed">
              {challenge.description}
            </p>
          </div>

              {/* Event Details */}
              <div className="mb-6 space-y-4">
                <div className="bg-slate-800/60 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Duration</p>
                      <p className="text-sm font-semibold text-slate-200">{duration} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Status</p>
                      <p className="text-sm font-semibold text-slate-200">
                        {isEnrolled ? (
                          <span className="text-primary-400">Active</span>
                        ) : isPast ? (
                          <span className="text-slate-500">Ended</span>
                        ) : isUpcoming ? (
                          <span className="text-blue-400">Upcoming</span>
                        ) : (
                          <span className="text-green-400">Available</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

          {/* Challenge Actions Preview */}
          {challenge.challenge_actions && challenge.challenge_actions.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-3">What you'll do:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {challenge.challenge_actions.slice(0, 7).map((ca, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-300">
                          {ca.day_number || index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {ca.actions.icon && (
                            <span className="text-lg">{ca.actions.icon}</span>
                          )}
                          <h4 className="text-sm font-semibold text-slate-200">
                            {ca.actions.name}
                          </h4>
                        </div>
                        {ca.actions.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {ca.actions.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {challenge.challenge_actions.length > 7 && (
                  <p className="text-xs text-slate-500 text-center mt-2">
                    ...and {challenge.challenge_actions.length - 7} more days
                  </p>
                )}
              </div>
            </div>
          )}
              </div>

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

