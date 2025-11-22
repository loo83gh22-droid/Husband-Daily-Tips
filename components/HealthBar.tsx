'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HealthBarProps {
  /**
   * 0–100 value representing current husband hit points.
   * We derive this from streak + recent activity.
   */
  value: number;
  /**
   * Trigger a pulse animation when health increases
   */
  shouldPulse?: boolean;
  onPulseComplete?: () => void;
}

const MILESTONES = [50, 60, 70, 80, 90, 100] as const;
type Milestone = typeof MILESTONES[number];

export default function HealthBar({ value, shouldPulse = false, onPulseComplete }: HealthBarProps) {
  const [previousHealth, setPreviousHealth] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [healthHistory, setHealthHistory] = useState<number[]>([]);
  const [showSparkle, setShowSparkle] = useState(false);
  const [trend, setTrend] = useState<'up' | 'down' | 'steady' | null>(null);

  const clamped = Math.max(0, Math.min(100, value));

  // Load previous health, history, and celebrated milestones from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('previous_health');
    const storedHealth = stored ? parseFloat(stored) : null;

    // Load health history (last 7 days)
    const storedHistory = localStorage.getItem('health_history');
    let history: number[] = [];
    if (storedHistory) {
      try {
        history = JSON.parse(storedHistory);
        // Keep only last 7 days
        if (history.length > 7) {
          history = history.slice(-7);
        }
      } catch {
        // Ignore parse errors
      }
    }

    setPreviousHealth(storedHealth);
    setHealthHistory(history);
    setIsInitialized(true);
  }, []);

  // Check for milestone crossings - only after initialization
  useEffect(() => {
    if (!isInitialized) return;

    // On first load, just store the current health and don't show any celebrations
    // We only want to celebrate when health actually increases and crosses a milestone
    if (previousHealth === null) {
      // Store current health for next time
      localStorage.setItem('previous_health', clamped.toString());
      setPreviousHealth(clamped);
      return;
    }

    // Update stored previous health and history
    if (previousHealth !== clamped) {
      const healthIncreased = previousHealth !== null && clamped > previousHealth;
      
      // Show sparkle animation if health increased
      if (healthIncreased && clamped > (previousHealth || 0)) {
        setShowSparkle(true);
        setTimeout(() => setShowSparkle(false), 2000);
      }

      // Update trend
      if (previousHealth !== null) {
        const diff = clamped - previousHealth;
        if (diff > 0.5) setTrend('up');
        else if (diff < -0.5) setTrend('down');
        else setTrend('steady');
      }

      // Update health history (last 7 days)
      const today = new Date().toISOString().split('T')[0];
      const historyKey = `health_${today}`;
      const storedToday = localStorage.getItem(historyKey);
      
      // Only store once per day
      if (!storedToday) {
        const newHistory = [...healthHistory, clamped];
        const trimmedHistory = newHistory.slice(-7); // Keep last 7 days
        setHealthHistory(trimmedHistory);
        localStorage.setItem('health_history', JSON.stringify(trimmedHistory));
        localStorage.setItem(historyKey, clamped.toString());
        
        // Clean up old daily entries (older than 7 days)
        for (let i = 8; i < 30; i++) {
          const oldDate = new Date();
          oldDate.setDate(oldDate.getDate() - i);
          const oldKey = `health_${oldDate.toISOString().split('T')[0]}`;
          localStorage.removeItem(oldKey);
        }
      }

      localStorage.setItem('previous_health', clamped.toString());
      setPreviousHealth(clamped);
    }
  }, [clamped, previousHealth, isInitialized, healthHistory]);

  let label = 'Holding steady';
  if (clamped >= 85) label = 'Strong';
  else if (clamped >= 65) label = 'Good';
  else if (clamped >= 45) label = 'Needs attention';
  else label = 'At risk';

  // Dynamic label color based on health
  const getLabelColor = () => {
    if (clamped >= 85) return 'text-emerald-400';
    if (clamped >= 65) return 'text-green-400';
    if (clamped >= 45) return 'text-yellow-400';
    return 'text-rose-400';
  };

  // Get next milestone and points away
  const getNextMilestone = () => {
    for (const milestone of MILESTONES) {
      if (clamped < milestone) {
        return {
          value: milestone,
          pointsAway: milestone - clamped,
        };
      }
    }
    return null; // Already at max
  };

  const nextMilestone = getNextMilestone();

  // Calculate 7-day trend
  const calculateTrend = () => {
    if (healthHistory.length < 2) return null;
    const recent = healthHistory.slice(-7);
    if (recent.length < 2) return null;
    
    const first = recent[0];
    const last = recent[recent.length - 1];
    const diff = last - first;
    
    if (diff > 1) return 'up';
    if (diff < -1) return 'down';
    return 'steady';
  };

  const trendDirection = trend || calculateTrend();

  // Don't render until initialized to avoid hydration issues
  if (!isInitialized) {
    return (
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-900/90 border border-slate-700/50 rounded-2xl p-6 md:p-7 shadow-2xl backdrop-blur-sm relative overflow-hidden" suppressHydrationWarning>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-800 rounded mb-4"></div>
          <div className="h-6 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-900/90 border border-slate-700/50 rounded-2xl p-6 md:p-7 shadow-2xl backdrop-blur-sm relative overflow-hidden" suppressHydrationWarning>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-100 uppercase tracking-tight mb-2">
                Husband Hit Points
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                A simple mirror of how consistently you&apos;re showing up.
              </p>
            </div>
            <div className="text-right ml-4">
              <div className="flex items-center justify-end gap-2 mb-1">
                <p className={`text-lg md:text-xl font-bold ${getLabelColor()} drop-shadow-lg`}>{label}</p>
                {trendDirection && trendDirection !== 'steady' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-lg ${trendDirection === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}
                  >
                    {trendDirection === 'up' ? '↑' : '↓'}
                  </motion.span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <p className="text-base md:text-lg font-semibold text-slate-200">{clamped.toFixed(1)}%</p>
                {showSparkle && (
                  <motion.span
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: [0, 1.2, 1], rotate: [0, 180, 360] }}
                    exit={{ scale: 0 }}
                    className="text-lg"
                  >
                    ✨
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          <div className="h-6 w-full rounded-full bg-slate-800/80 overflow-hidden border-2 border-slate-700/60 mb-3 relative shadow-inner">
            {/* Animated glow effect on the progress bar */}
            <motion.div
              className={`h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-400 to-emerald-400 transition-all duration-700 ease-out relative overflow-hidden ${
                shouldPulse ? 'animate-pulse' : ''
              }`}
              style={{ width: `${clamped}%` }}
              onAnimationEnd={() => {
                if (shouldPulse && onPulseComplete) {
                  onPulseComplete();
                }
              }}
              animate={showSparkle ? {
                boxShadow: [
                  '0 0 0px rgba(251, 191, 36, 0)',
                  '0 0 20px rgba(251, 191, 36, 0.6)',
                  '0 0 0px rgba(251, 191, 36, 0)',
                ],
              } : {}}
              transition={{ duration: 0.6 }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              
              {/* Pulse glow effect when health increases */}
              {shouldPulse && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400/50 via-emerald-400/50 to-primary-400/50 animate-ping" />
              )}

              {/* Sparkle particles on increase */}
              {showSparkle && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: 10, y: -5 }}
                    transition={{ duration: 1, delay: 0 }}
                    className="absolute text-yellow-300 text-xs"
                    style={{ left: '20%', top: '20%' }}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: -10, y: 5 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="absolute text-yellow-300 text-xs"
                    style={{ left: '50%', top: '50%' }}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: 5, y: -10 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="absolute text-yellow-300 text-xs"
                    style={{ left: '80%', top: '30%' }}
                  >
                    ✨
                  </motion.div>
                </>
              )}
            </motion.div>
            
            {/* Milestone markers - more prominent */}
            {MILESTONES.map((milestone) => (
              <div
                key={milestone}
                className={`absolute top-0 bottom-0 w-1 ${
                  clamped >= milestone
                    ? milestone === 100
                      ? 'bg-emerald-300 shadow-lg shadow-emerald-400/50'
                      : milestone === 90
                        ? 'bg-pink-300 shadow-lg shadow-pink-400/50'
                        : milestone === 80
                          ? 'bg-red-300 shadow-lg shadow-red-400/50'
                          : milestone === 70
                            ? 'bg-orange-300 shadow-lg shadow-orange-400/50'
                            : milestone === 60
                              ? 'bg-amber-300 shadow-lg shadow-amber-400/50'
                              : 'bg-yellow-300 shadow-lg shadow-yellow-400/50'
                    : 'bg-slate-600/40'
                } transition-all duration-300`}
                style={{ left: `calc(${milestone}% - 2px)` }}
                title={`${milestone}% milestone`}
              />
            ))}
            
            {/* Additional visual depth with inner border */}
            <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <p className="text-xs text-slate-400 font-medium">
                • Completing today&apos;s action nudges this up.
              </p>
              <p className="text-xs text-slate-400 font-medium">
                • Missing days in a row slowly drains it.
              </p>
              <p className="text-xs text-slate-400 font-medium">
                • Big husband moves give visible boosts.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-700/50">
              <p className="text-xs text-slate-200 mb-1.5 font-semibold">
                Big Husband Moves
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Meaningful gestures beyond daily tasks—surprise dates, major projects, heartfelt notes, special celebrations. Currently equal value; bonus points coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Celebration Modal */}
    </>
  );
}


