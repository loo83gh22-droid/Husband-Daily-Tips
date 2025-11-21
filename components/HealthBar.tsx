'use client';

import { useEffect, useState } from 'react';
import HealthMilestoneModal from './HealthMilestoneModal';

interface HealthBarProps {
  /**
   * 0–100 value representing current relationship health.
   * We derive this from streak + recent activity.
   */
  value: number;
}

const MILESTONES = [50, 60, 70, 80, 90, 100] as const;
type Milestone = typeof MILESTONES[number];

export default function HealthBar({ value }: HealthBarProps) {
  const [previousHealth, setPreviousHealth] = useState<number | null>(null);
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<Milestone>>(new Set());
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);

  const clamped = Math.max(0, Math.min(100, value));

  // Load previous health from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('previous_health');
    if (stored) {
      setPreviousHealth(parseFloat(stored));
    }

    // Load previously celebrated milestones
    const celebrated = localStorage.getItem('celebrated_milestones');
    if (celebrated) {
      try {
        setCelebratedMilestones(new Set(JSON.parse(celebrated)));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Check for milestone crossings
  useEffect(() => {
    // Handle first load - treat as if crossing from 0
    const effectivePreviousHealth = previousHealth === null ? 0 : previousHealth;

    if (previousHealth === null) {
      // First load - check if we should celebrate any milestones they've reached
      // Find the highest milestone they're at or above that hasn't been celebrated
      // Only show if they're currently at/above the milestone (not if they've dropped below)
      let highestMilestoneToCelebrate: Milestone | null = null;
      
      for (const milestone of MILESTONES) {
        const crossedUpward = effectivePreviousHealth < milestone && clamped >= milestone;
        const notYetCelebrated = !celebratedMilestones.has(milestone);
        const currentlyAtOrAbove = clamped >= milestone;
        
        // Only celebrate if they crossed upward AND are currently at/above the milestone AND haven't celebrated it
        if (crossedUpward && notYetCelebrated && currentlyAtOrAbove) {
          highestMilestoneToCelebrate = milestone;
        }
      }
      
      if (highestMilestoneToCelebrate !== null) {
        // Show celebration for highest milestone reached!
        setCurrentMilestone(highestMilestoneToCelebrate);
        const newCelebrated = new Set(celebratedMilestones);
        newCelebrated.add(highestMilestoneToCelebrate);
        setCelebratedMilestones(newCelebrated);
        localStorage.setItem('celebrated_milestones', JSON.stringify(Array.from(newCelebrated)));
      }
      
      // Store current health for next time
      localStorage.setItem('previous_health', clamped.toString());
      setPreviousHealth(clamped);
      return;
    }

    // Remove milestones from celebrated set if health has dropped below them
    // This allows re-celebration if they reach the milestone again
    const updatedCelebrated = new Set(celebratedMilestones);
    let removedAny = false;
    for (const milestone of MILESTONES) {
      if (updatedCelebrated.has(milestone) && clamped < milestone) {
        // Health dropped below this milestone - remove from celebrated
        updatedCelebrated.delete(milestone);
        removedAny = true;
      }
    }

    if (removedAny) {
      // Save updated celebrated milestones
      setCelebratedMilestones(updatedCelebrated);
      localStorage.setItem('celebrated_milestones', JSON.stringify(Array.from(updatedCelebrated)));
    }

    // Check for upward milestone crossings only
    // Only celebrate when crossing FROM BELOW a milestone TO at/above that milestone
    // AND only if they're currently still at/above that milestone (not if they've dropped)
    for (const milestone of MILESTONES) {
      const crossedUpward = previousHealth < milestone && clamped >= milestone;
      const notYetCelebrated = !updatedCelebrated.has(milestone);
      const currentlyAtOrAbove = clamped >= milestone;

      // Only celebrate if they crossed upward AND are currently at/above AND haven't celebrated
      if (crossedUpward && notYetCelebrated && currentlyAtOrAbove) {
        // Show celebration for crossing upward!
        setCurrentMilestone(milestone);
        const newCelebrated = new Set(updatedCelebrated);
        newCelebrated.add(milestone);
        setCelebratedMilestones(newCelebrated);
        // Save to localStorage
        localStorage.setItem('celebrated_milestones', JSON.stringify(Array.from(newCelebrated)));
        break; // Only show one celebration at a time
      }
    }

    // Update stored previous health
    if (previousHealth !== clamped) {
      localStorage.setItem('previous_health', clamped.toString());
      setPreviousHealth(clamped);
    }
  }, [clamped, previousHealth, celebratedMilestones]);

  const handleCloseModal = () => {
    setCurrentMilestone(null);
  };

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

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-900/90 border border-slate-700/50 rounded-2xl p-6 md:p-7 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Relationship Health
              </p>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                A simple mirror of how consistently you&apos;re showing up.
              </p>
            </div>
            <div className="text-right">
              <p className={`text-base font-bold ${getLabelColor()} drop-shadow-lg`}>{label}</p>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">{clamped.toFixed(1)}%</p>
            </div>
          </div>

          <div className="h-6 w-full rounded-full bg-slate-800/80 overflow-hidden border-2 border-slate-700/60 mb-3 relative shadow-inner">
            {/* Animated glow effect on the progress bar */}
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-400 to-emerald-400 transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${clamped}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            </div>
            
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

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2">
            <p className="text-[11px] text-slate-400 font-medium">
              • Completing today&apos;s action nudges this up.
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              • Missing days in a row slowly drains it.
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              • Big husband moves give visible boosts.
            </p>
          </div>

          {/* Details link with hover popup */}
          <div className="mt-3 relative group">
            <button className="text-xs text-primary-400 hover:text-primary-300 font-medium underline decoration-primary-500/50 underline-offset-2 transition-colors">
              Details
            </button>
            
            {/* Hover Popup */}
            <div className="absolute left-0 bottom-full mb-2 w-72 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="absolute bottom-0 left-3 transform translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800 border-r border-b border-slate-700"></div>
              
              <p className="text-xs text-slate-200 mb-2 font-semibold">
                How it works
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Climbing: daily actions and &quot;big husband&quot; moves. Draining: inactivity. This is your honest dashboard, not a score for her.
              </p>

              <div className="pt-2 border-t border-slate-700/50">
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
      </div>

      {/* Milestone Celebration Modal */}
      {currentMilestone && (
        <HealthMilestoneModal milestone={currentMilestone} isOpen={true} onClose={handleCloseModal} />
      )}
    </>
  );
}


