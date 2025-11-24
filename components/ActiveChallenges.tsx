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

export default function ActiveChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserId();
    fetchChallenges();
    fetchUserChallenges();
  }, []);

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
        const allChallenges = data.challenges || [];
        // Randomly shuffle and select 3 challenges
        const shuffled = [...allChallenges].sort(() => Math.random() - 0.5);
        setChallenges(shuffled.slice(0, 3));
      }
    } catch (error) {
      // Silently handle errors
      setChallenges([]);
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
        // This ensures we can detect if user is enrolled even if challenge is completed
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
    // Refresh both challenges and user challenges after joining
    fetchChallenges();
    fetchUserChallenges();
  };

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400">Loading challenges...</p>
      </div>
    );
  }

  if (challenges.length === 0) {
    return null; // Don't show section if no challenges
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
        {challenges.map((challenge) => {
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
            />
          );
        })}
      </div>
    </div>
  );
}

