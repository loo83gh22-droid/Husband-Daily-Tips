'use client';

import { useState } from 'react';

interface Challenge {
  id: string;
  name: string;
  description: string;
  theme: string;
  duration_days?: number;
  challenge_actions?: Array<{
    day_number: number;
    actions: {
      id: string;
      name: string;
      description: string;
    };
  }>;
}

interface ChallengeConfirmModalProps {
  challenge: Challenge;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  partnerName?: string | null;
}

export default function ChallengeConfirmModal({
  challenge,
  isOpen,
  onConfirm,
  onCancel,
  partnerName,
}: ChallengeConfirmModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const duration = challenge.duration_days || challenge.challenge_actions?.length || 7;
  const challengeActions = challenge.challenge_actions || [];

  const getThemeColor = (theme: string) => {
    const colors: Record<string, string> = {
      communication: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      intimacy: 'border-pink-500/30 bg-pink-500/10 text-pink-300',
      partnership: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      romance: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
      gratitude: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      conflict_resolution: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      reconnection: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
      quality_time: 'border-green-500/30 bg-green-500/10 text-green-300',
    };
    return colors[theme] || 'border-slate-700/30 bg-slate-700/10 text-slate-300';
  };

  const formatThemeName = (theme: string) => {
    if (theme === 'quality_time') return 'Quality Time';
    if (theme === 'conflict_resolution') return 'Conflict Resolution';
    if (theme === 'roommate_syndrome') return 'Roommate Syndrome Recovery';
    return theme.charAt(0).toUpperCase() + theme.slice(1).replace(/_/g, ' ');
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const formatEventName = (name: string): string => {
    return name.replace(/Challenge/gi, 'Event');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b ${getThemeColor(challenge.theme)}`}>
          <h2 className="text-2xl font-bold text-slate-50 mb-2">
            {formatEventName(challenge.name)}
          </h2>
          <p className="text-sm text-slate-300">
            {formatThemeName(challenge.theme)} • {duration} days
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">What you'll do:</h3>
            <p className="text-slate-300 leading-relaxed">
              {challenge.description.replace(/\bchallenge\b/gi, '7-day event')}
            </p>
          </div>

          {/* Actions Preview */}
          {challengeActions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Your 7-day plan:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {challengeActions.slice(0, 7).map((ca, index) => {
                  const action = ca.actions || ca;
                  const dayNumber = index + 1;
                  
                  return (
                    <div
                      key={dayNumber}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-300">{dayNumber}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-200 mb-1">
                            {action.name}
                          </h4>
                          {action.description && (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {action.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Important Info */}
          <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
            <p className="text-sm text-primary-300 font-medium mb-2">📋 Important:</p>
            <ul className="text-xs text-primary-200 space-y-1 list-disc list-inside">
              <li>You can only join one 7-day event at a time</li>
              <li>Complete all {duration} days to earn your badge</li>
              <li>Your daily routine action will be replaced with event actions</li>
              <li>You can leave the event anytime from your dashboard</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed ${
              getThemeColor(challenge.theme).includes('blue') ? 'bg-blue-500 hover:bg-blue-400' :
              getThemeColor(challenge.theme).includes('pink') ? 'bg-pink-500 hover:bg-pink-400' :
              getThemeColor(challenge.theme).includes('emerald') ? 'bg-emerald-500 hover:bg-emerald-400' :
              getThemeColor(challenge.theme).includes('rose') ? 'bg-rose-500 hover:bg-rose-400' :
              getThemeColor(challenge.theme).includes('amber') ? 'bg-amber-500 hover:bg-amber-400' :
              getThemeColor(challenge.theme).includes('purple') ? 'bg-purple-500 hover:bg-purple-400' :
              getThemeColor(challenge.theme).includes('cyan') ? 'bg-cyan-500 hover:bg-cyan-400' :
              getThemeColor(challenge.theme).includes('green') ? 'bg-green-500 hover:bg-green-400' :
              'bg-primary-500 hover:bg-primary-400'
            }`}
          >
            {isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Joining...
              </span>
            ) : (
              'Confirm Event'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

