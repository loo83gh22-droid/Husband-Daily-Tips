'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ChallengeJoinSuccessModal from './ChallengeJoinSuccessModal';
import ChallengeErrorModal from './ChallengeErrorModal';

interface Challenge {
  id: string;
  name: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  userCompletionCount?: number;
  duration_days?: number;
  challenge_actions?: Array<{
    day_number: number;
    actions: {
      id: string;
      name: string;
      description: string;
      icon: string;
    };
  }>;
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  joined_date: string;
  completed_days: number;
  completed: boolean;
  challenges: Challenge;
  progress: number;
  totalDays: number;
  remainingDays: number;
  completionCount?: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  userId?: string;
  onJoin?: (challengeId: string) => void;
}

export default function ChallengeCard({ challenge, userChallenge, userId, onJoin }: ChallengeCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  // Sync isJoined with userChallenge prop - update when prop changes
  const [isJoined, setIsJoined] = useState(!!userChallenge);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorChallengeName, setErrorChallengeName] = useState('');

  // Update isJoined when userChallenge prop changes
  useEffect(() => {
    setIsJoined(!!userChallenge);
  }, [userChallenge]);

  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const today = new Date();
  const isActive = today >= startDate && today <= endDate;
  const isUpcoming = today < startDate;
  const isPast = today > endDate;
  // A challenge is "in progress" if user has joined it and it's not completed
  const isInProgress = isJoined && userChallenge && !userChallenge.completed;

  const handleJoin = async () => {
    if (isJoined || isJoining) return;
    
    setIsJoining(true);
    try {
      const response = await fetch('/api/challenges/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsJoined(true);
        if (onJoin) onJoin(challenge.id);
        
        // Show success modal for 7-day challenges
        // All challenges are 7 days, so show modal if we have userId
        // Check challenge_actions length if available, otherwise assume 7-day
        const challengeActions = challenge.challenge_actions || [];
        const is7DayChallenge = challengeActions.length >= 7 || challengeActions.length === 0 || challenge.duration_days === 7 || !challenge.duration_days;
        if (is7DayChallenge && userId) {
          setShowSuccessModal(true);
        }
      } else {
        // Handle error response
        try {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || 'Failed to join challenge';
          
          // Always show modal for 400 errors (one challenge at a time)
          if (response.status === 400 || errorMessage.includes('currently participating') || errorData.error === 'You can only join one challenge at a time') {
            // Extract challenge name from message
            const match = errorMessage.match(/"([^"]+)"/);
            const challengeNameFromMatch = match ? match[1] : null;
            const challengeNameFromData = errorData.challengeName || errorData.challenge_name || challengeNameFromMatch || 'a challenge';
            
            setErrorChallengeName(challengeNameFromData);
            setShowErrorModal(true);
          } else {
            alert(errorMessage);
          }
        } catch (parseError) {
          // If we can't parse JSON, show generic error modal
          console.error('Error parsing challenge join response:', parseError);
          setErrorChallengeName('a challenge');
          setShowErrorModal(true);
        }
        // Don't set isJoined if there was an error
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const themeEmojis: Record<string, string> = {
    communication: '💬',
    romance: '💕',
    roommate_syndrome: '🔗',
    connection: '🔗',
    intimacy: '💝',
    partnership: '🤝',
    gratitude: '🙏',
    conflict_resolution: '⚖️',
    reconnection: '🔗',
    quality_time: '⏰',
  };

  const getButtonClasses = (theme: string, isDisabled: boolean) => {
    const baseClasses = 'flex-1 px-4 py-2.5 text-slate-950 text-sm font-bold rounded-lg transition-all shadow-md transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
    
    if (isDisabled) {
      return `${baseClasses} bg-slate-700 text-slate-500`;
    }

    const colorMap: Record<string, string> = {
      communication: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/30 hover:shadow-blue-500/50',
      romance: 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-rose-500/30 hover:shadow-rose-500/50',
      intimacy: 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 shadow-pink-500/30 hover:shadow-pink-500/50',
      partnership: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/30 hover:shadow-emerald-500/50',
      gratitude: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/30 hover:shadow-amber-500/50',
      conflict_resolution: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 shadow-purple-500/30 hover:shadow-purple-500/50',
      reconnection: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-cyan-500/30 hover:shadow-cyan-500/50',
      quality_time: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-green-500/30 hover:shadow-green-500/50',
    };

    return `${baseClasses} ${colorMap[theme] || 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 shadow-primary-500/30 hover:shadow-primary-500/50'}`;
  };

  const emoji = themeEmojis[challenge.theme] || '🎯';

  // Map challenge name to badge slug for linking
  const getChallengeBadgeSlug = (challengeName: string): string => {
    const badgeMap: Record<string, string> = {
      '7-Day Communication Challenge': 'communication-champion',
      '7-Day Roommate Syndrome Recovery': 'connection-restorer',
      '7-Day Romance Challenge': 'romance-reviver',
    };
    return badgeMap[challengeName] || '';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-primary-500/30 rounded-xl p-6 shadow-lg shadow-primary-500/10 hover:border-primary-500/50 hover:shadow-primary-500/20 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 relative">
            <span className="text-3xl">{emoji}</span>
            {(challenge.userCompletionCount || 0) > 0 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-950">{challenge.userCompletionCount}</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-slate-50">{challenge.name}</h3>
              {(challenge.userCompletionCount || 0) > 0 && (
                <span className="text-xs text-primary-300 font-medium whitespace-nowrap">
                  ({challenge.userCompletionCount}x)
                </span>
              )}
              {isInProgress && (
                <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-semibold rounded-full border border-primary-500/30 whitespace-nowrap">
                  🎯 Active
                </span>
              )}
              {isJoined && userChallenge?.completed && !isInProgress && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full whitespace-nowrap">
                  ✓ Completed
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">{challenge.description}</p>
          </div>
        </div>
        {isActive && !isJoined && (
          <span className="px-3 py-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 text-xs font-bold rounded-full border border-green-500/50 shadow-sm">
            Available
          </span>
        )}
        {isUpcoming && (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
            Upcoming
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </span>
          {userChallenge && (
            <span>
              Day {userChallenge.completed_days} of {userChallenge.totalDays}
            </span>
          )}
        </div>
        {userChallenge && (
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all ${
                challenge.theme === 'romance' ? 'bg-rose-500' :
                challenge.theme === 'intimacy' ? 'bg-pink-500' :
                challenge.theme === 'partnership' ? 'bg-emerald-500' :
                challenge.theme === 'gratitude' ? 'bg-amber-500' :
                challenge.theme === 'conflict_resolution' ? 'bg-purple-500' :
                challenge.theme === 'reconnection' ? 'bg-cyan-500' :
                challenge.theme === 'quality_time' ? 'bg-green-500' :
                challenge.theme === 'communication' ? 'bg-blue-500' :
                'bg-primary-500'
              }`}
              style={{ width: `${userChallenge.progress}%` }}
            />
          </div>
        )}
      </div>

      {challenge.challenge_actions && challenge.challenge_actions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">7-Day Action Plan:</p>
          <div className="grid grid-cols-7 gap-1">
            {challenge.challenge_actions
              .sort((a, b) => a.day_number - b.day_number)
              .map((ca, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                    userChallenge && index < userChallenge.completed_days
                      ? 'bg-green-500/20 text-green-400'
                      : userChallenge && index === userChallenge.completed_days
                      ? 'bg-primary-500/20 text-primary-400 ring-2 ring-primary-500'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                  title={ca.actions.name}
                >
                  {userChallenge && index < userChallenge.completed_days ? '✓' : index + 1}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!userChallenge && !isJoined ? (
          <button
            onClick={handleJoin}
            disabled={isJoining || isPast}
            className={getButtonClasses(challenge.theme, isJoining || isPast)}
          >
            {isJoining ? 'Joining...' : isPast ? 'Event Ended' : 'Join Event'}
          </button>
        ) : (
          <Link
            href={`/dashboard/badges#${getChallengeBadgeSlug(challenge.name)}`}
            className="flex-1 px-4 py-2 bg-slate-800 text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors text-center"
          >
            View Progress
          </Link>
        )}
      </div>

      {showSuccessModal && userId && (
        <ChallengeJoinSuccessModal
          challengeName={challenge.name}
          userId={userId}
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      
      {showErrorModal && (
        <ChallengeErrorModal
          challengeName={errorChallengeName}
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
}

