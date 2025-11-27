'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ChallengeJoinSuccessModal from './ChallengeJoinSuccessModal';
import ChallengeErrorModal from './ChallengeErrorModal';
import { personalizeText } from '@/lib/personalize-text';

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
  subscriptionTier?: string;
  partnerName?: string | null;
}

export default function ChallengeCard({ challenge, userChallenge, userId, onJoin, subscriptionTier = 'free', partnerName }: ChallengeCardProps) {
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
  // A 7-day event is "in progress" if user has joined it and it's not completed
  const isInProgress = isJoined && userChallenge && !userChallenge.completed;

  const isPaidUser = subscriptionTier === 'premium' || subscriptionTier === 'pro';

  const handleJoin = async () => {
    if (isJoined || isJoining || !isPaidUser) return;
    
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
        
        // Show success modal for 7-day events
        // All events are 7 days, so show modal if we have userId
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
          const errorMessage = errorData.message || errorData.error || 'Failed to join 7-day event';
          
          // Handle premium subscription required error
          if (response.status === 403 || errorMessage.includes('Premium subscription required') || errorData.error === 'Premium subscription required') {
            // Redirect to subscription page with upgrade message
            window.location.href = '/dashboard/subscription?upgrade=7day-events';
            return;
          }
          
          // Always show modal for 400 errors (one 7-day event at a time)
          if (response.status === 400 || errorMessage.includes('currently participating') || errorData.error === 'You can only join one challenge at a time') {
            // Extract event name from message
            const match = errorMessage.match(/"([^"]+)"/);
            const challengeNameFromMatch = match ? match[1] : null;
            const challengeNameFromData = errorData.challengeName || errorData.challenge_name || challengeNameFromMatch || 'a 7-day event';
            
            setErrorChallengeName(challengeNameFromData);
            setShowErrorModal(true);
          } else {
            alert(errorMessage);
          }
        } catch (parseError) {
          // If we can't parse JSON, show generic error modal
          console.error('Error parsing 7-day event join response:', parseError);
          setErrorChallengeName('a 7-day event');
          setShowErrorModal(true);
        }
        // Don't set isJoined if there was an error
      }
    } catch (error) {
      console.error('Error joining 7-day event:', error);
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

  // Helper function to replace "Challenge" with "Event" in display names
  const formatEventName = (name: string): string => {
    return name.replace(/Challenge/gi, 'Event');
  };

  // Map 7-day event name to badge slug for linking (handles both old and new names)
  const getChallengeBadgeSlug = (challengeName: string): string => {
    const badgeMap: Record<string, string> = {
      '7-Day Communication Challenge': 'communication-champion',
      '7-Day Communication Event': 'communication-champion',
      '7-Day Roommate Syndrome Recovery': 'connection-restorer',
      '7-Day Romance Challenge': 'romance-reviver',
      '7-Day Romance Event': 'romance-reviver',
      '7-Day Conflict Resolution Challenge': 'conflict-resolver',
      '7-Day Conflict Resolution Event': 'conflict-resolver',
      '7-Day Reconnection Challenge': 'connection-restorer',
      '7-Day Reconnection Event': 'connection-restorer',
    };
    return badgeMap[challengeName] || '';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-800/80 border border-orange-500/40 rounded-lg p-4 md:p-6 shadow-lg shadow-orange-500/10 hover:border-orange-500/60 hover:shadow-orange-500/20 transition-all">
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
              <h3 className="text-lg font-semibold text-slate-50">{formatEventName(challenge.name)}</h3>
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
            <p className="text-sm text-slate-400 mt-1">{personalizeText(challenge.description.replace(/\bchallenge\b/gi, '7-day event'), partnerName)}</p>
          </div>
        </div>
        {isInProgress && (
          <span className="px-3 py-1 bg-gradient-to-r from-primary-500/30 to-primary-600/30 text-primary-300 text-xs font-bold rounded-full border border-primary-500/50 shadow-sm">
            Active
          </span>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        {!userChallenge && !isJoined ? (
          <>
            {!isPaidUser ? (
              <Link
                href="/dashboard/subscription?upgrade=7day-events"
                className="flex-1 px-4 py-2.5 text-slate-950 text-sm font-bold rounded-lg transition-all shadow-md transform hover:scale-[1.02] bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 shadow-primary-500/30 hover:shadow-primary-500/50 text-center"
              >
                Upgrade to Join
              </Link>
            ) : (
              <button
                onClick={handleJoin}
                disabled={isJoining || isPast}
                className={getButtonClasses(challenge.theme, isJoining || isPast)}
              >
                {isJoining ? 'Joining...' : isPast ? '7-Day Event Ended' : 'Join 7-Day Event'}
              </button>
            )}
          </>
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
          challengeName={formatEventName(challenge.name)}
          userId={userId}
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      
      {showErrorModal && (
        <ChallengeErrorModal
          challengeName={formatEventName(errorChallengeName)}
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
}

