'use client';

import { useState, useEffect } from 'react';
import ChallengeCard from './ChallengeCard';

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
}

interface ActiveChallengesProps {
  subscriptionTier?: string;
  partnerName?: string | null;
}

export default function ActiveChallenges({ subscriptionTier = 'free', partnerName }: ActiveChallengesProps) {
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [displayedChallenges, setDisplayedChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserId();
    fetchChallenges();
    fetchUserChallenges();
  }, []);

  // Filter and display challenges when both are loaded
  useEffect(() => {
    if (allChallenges.length === 0) {
      setDisplayedChallenges([]);
      return;
    }

    // Get IDs of challenges user is already participating in (active or completed)
    const userChallengeIds = new Set(
      userChallenges.map((uc) => uc.challenge_id)
    );

    // Check if user has an active (incomplete) event
    const hasActiveEvent = userChallenges.some((uc) => !uc.completed);

    // Filter challenges
    let filteredChallenges: Challenge[];

    // If user has an active event, only show that event
    if (hasActiveEvent) {
      // Only show the active event(s) the user is participating in
      filteredChallenges = allChallenges.filter((challenge) =>
        userChallengeIds.has(challenge.id)
      );
    } else {
      // User doesn't have an active event - show available events to join
      // Filter out events user is already participating in
      filteredChallenges = allChallenges.filter(
        (challenge) => !userChallengeIds.has(challenge.id)
      );
    }

    // Remove duplicates by challenge ID
    const uniqueChallenges = Array.from(
      new Map(filteredChallenges.map((challenge) => [challenge.id, challenge])).values()
    );

    // Randomly shuffle and limit to 3 (or 1 if user has active event)
    const maxToShow = hasActiveEvent ? 1 : 3;
    const shuffled = [...uniqueChallenges].sort(() => Math.random() - 0.5);
    setDisplayedChallenges(shuffled.slice(0, maxToShow));
  }, [allChallenges, userChallenges]);

  const fetchUserId = async () => {
    try {
      const response = await fetch('/api/user/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUserId(data.user?.id || null);
      }
    } catch (error) {
      // Silently handle errors
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges/active', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const challenges = data.challenges || [];
        setAllChallenges(challenges);
      }
    } catch (error) {
      // Silently handle errors
      setAllChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const response = await fetch('/api/challenges/user', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Use allChallenges (includes completed) for enrollment detection
        // This ensures we can detect if user is enrolled even if 7-day event is completed
        setUserChallenges(data.allChallenges || data.challenges || []);
      } else if (response.status === 401) {
        // Silently handle auth errors
        setUserChallenges([]);
      }
    } catch (error) {
      // Silently handle errors
      setUserChallenges([]);
    }
  };

  const handleJoin = (challengeId: string) => {
    // Refresh both 7-day events and user events after joining
    fetchChallenges();
    fetchUserChallenges();
    // The useEffect will automatically filter and update displayedChallenges
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400">Loading 7-day events...</p>
      </div>
    );
  }

  if (displayedChallenges.length === 0) {
    return null; // Don't show section if no 7-day events
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
            7-Day Events
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            7 days. 7 chances to level up. One 7-day event at a time.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedChallenges.map((challenge) => {
          const userChallenge = userChallenges.find(
            (uc) => uc.challenge_id === challenge.id
          );
          return (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              userChallenge={userChallenge}
              userId={userId || undefined}
              onJoin={handleJoin}
              subscriptionTier={subscriptionTier}
              partnerName={partnerName}
            />
          );
        })}
      </div>
    </div>
  );
}

