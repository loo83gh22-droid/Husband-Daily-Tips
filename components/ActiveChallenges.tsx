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

  useEffect(() => {
    fetchChallenges();
    fetchUserChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/challenges/active', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
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
        setUserChallenges(data.challenges || []);
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
    fetchUserChallenges(); // Refresh user challenges after joining
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
            Weekly Challenges
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Join time-bound challenges to focus on specific relationship areas
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
              onJoin={handleJoin}
            />
          );
        })}
      </div>
    </div>
  );
}

