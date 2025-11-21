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
  const [isJoined, setIsJoined] = useState(!!userChallenge);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorChallengeName, setErrorChallengeName] = useState('');

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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to join challenge';
        
        // If it's a "one challenge at a time" error, extract challenge name and show nice modal
        if (errorMessage.includes('currently participating')) {
          // Extract challenge name from message
          const match = errorMessage.match(/"([^"]+)"/);
          if (match) {
            setErrorChallengeName(match[1]);
            setShowErrorModal(true);
          } else {
            alert(errorMessage);
          }
        } else {
          alert(errorMessage);
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
  };

  const themeColors: Record<string, string> = {
    communication: 'primary',
    romance: 'rose',
    roommate_syndrome: 'amber',
    connection: 'amber',
  };

  const emoji = themeEmojis[challenge.theme] || '🎯';
  const color = themeColors[challenge.theme] || 'primary';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-slate-50">{challenge.name}</h3>
              {isInProgress && (
                <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-semibold rounded-full border border-primary-500/30 whitespace-nowrap">
                  🎯 Active
                </span>
              )}
              {isJoined && userChallenge?.completed && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full whitespace-nowrap">
                  ✓ Completed
                </span>
              )}
              {(challenge.userCompletionCount || 0) > 0 && !isInProgress && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full whitespace-nowrap">
                  ✓ Completed {challenge.userCompletionCount}x
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">{challenge.description}</p>
          </div>
        </div>
        {isActive && !isJoined && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
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
              className={`h-full bg-${color}-500 transition-all`}
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
        {!isJoined ? (
          <button
            onClick={handleJoin}
            disabled={isJoining || isPast}
            className={`flex-1 px-4 py-2 bg-${color}-500 text-slate-950 text-sm font-semibold rounded-lg hover:bg-${color}-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isJoining ? 'Joining...' : isPast ? 'Challenge Ended' : 'Join Challenge'}
          </button>
        ) : (
          <Link
            href="/dashboard/challenges"
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
    </div>
  );
}

