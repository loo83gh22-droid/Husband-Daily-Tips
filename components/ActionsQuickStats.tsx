'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface QuickStats {
  currentStreak: number;
  actionsThisWeek: number;
  badgesEarned: number;
}

interface ActionsQuickStatsProps {
  totalActions: number;
  completedActions: number;
  actionsThisWeek: number;
  badgesEarned: number;
}

export default function ActionsQuickStats({ totalActions, completedActions, actionsThisWeek, badgesEarned }: ActionsQuickStatsProps) {
  const [stats, setStats] = useState<QuickStats>({
    currentStreak: 0,
    actionsThisWeek,
    badgesEarned,
  });
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    // Fetch streak data
    async function fetchStreak() {
      try {
        const response = await fetch('/api/badges', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setStats((prev) => ({
            ...prev,
            currentStreak: data.stats?.currentStreak || 0,
          }));
        }
      } catch (error) {
        // Silently handle errors
      }
    }
    fetchStreak();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{
        y: isSticky ? 0 : -100,
        opacity: isSticky ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
      className={`fixed top-16 left-0 right-0 z-50 hidden md:block ${
        isSticky ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-primary-500/30 shadow-lg shadow-primary-500/10 backdrop-blur-xl rounded-b-xl p-4">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {/* Actions This Week */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">This Week</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-400 mt-0.5">
                    {stats.actionsThisWeek}
                  </p>
                </div>
              </div>

              {/* Current Streak */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Streak</p>
                  <p className="text-xl md:text-2xl font-bold text-orange-400 mt-0.5">
                    {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>

              {/* Badges Earned */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Badges</p>
                  <p className="text-xl md:text-2xl font-bold text-emerald-400 mt-0.5">
                    {stats.badgesEarned}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

