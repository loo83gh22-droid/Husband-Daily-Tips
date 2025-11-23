'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ChallengeCard from './ChallengeCard';

interface Challenge {
  id: string;
  name: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
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

export default function FeaturedEvents() {
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
      const response = await fetch('/api/user/me', { credentials: 'include' });
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
      const response = await fetch('/api/challenges/active', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const allChallenges = data.challenges || [];
        // Randomly shuffle and select 3 challenges
        const shuffled = [...allChallenges].sort(() => Math.random() - 0.5);
        setChallenges(shuffled.slice(0, 3));
      }
    } catch (error) {
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const response = await fetch('/api/challenges/user', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUserChallenges(data.allChallenges || data.challenges || []);
      }
    } catch (error) {
      setUserChallenges([]);
    }
  };

  const handleJoin = (challengeId: string) => {
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
    return null;
  }

  // Challenges are already randomized and limited to 3 in fetchChallenges
  const featuredChallenges = challenges;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-50">Featured Events</h2>
          <p className="text-sm text-slate-400 mt-1">
            7 days. 7 chances to level up. Pick an event and get started.
          </p>
        </div>
        {challenges.length > 3 && (
          <Link
            href="/dashboard"
            className="text-sm text-primary-300 hover:text-primary-200 transition-colors"
          >
            View All →
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredChallenges.map((challenge) => {
          const userChallenge = userChallenges.find((uc) => uc.challenge_id === challenge.id);
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
    </section>
  );
}

