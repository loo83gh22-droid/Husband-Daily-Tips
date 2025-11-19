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
      let highestMilestoneToCelebrate: Milestone | null = null;
      
      for (const milestone of MILESTONES) {
        const crossedUpward = effectivePreviousHealth < milestone && clamped >= milestone;
        const notYetCelebrated = !celebratedMilestones.has(milestone);
        
        if (crossedUpward && notYetCelebrated) {
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
    for (const milestone of MILESTONES) {
      const crossedUpward = previousHealth < milestone && clamped >= milestone;
      const notYetCelebrated = !updatedCelebrated.has(milestone);

      if (crossedUpward && notYetCelebrated) {
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

  return (
    <>
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
              Relationship health
            </p>
            <p className="mt-1 text-xs text-slate-300">
              A simple mirror of how consistently you&apos;re showing up.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-100">{label}</p>
            <p className="text-xs text-slate-500">{clamped}%</p>
          </div>
        </div>

        <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700 mb-2 relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 transition-all duration-500 ease-out"
            style={{ width: `${clamped}%` }}
          />
          {/* Milestone markers */}
          {MILESTONES.map((milestone) => (
            <div
              key={milestone}
              className={`absolute top-0 bottom-0 w-0.5 ${
                clamped >= milestone
                  ? milestone === 100
                    ? 'bg-emerald-400'
                    : milestone === 90
                      ? 'bg-pink-400'
                      : milestone === 80
                        ? 'bg-red-400'
                        : milestone === 70
                          ? 'bg-orange-400'
                          : milestone === 60
                            ? 'bg-amber-400'
                            : 'bg-yellow-400'
                  : 'bg-slate-600'
              } transition-colors`}
              style={{ left: `${milestone}%` }}
              title={`${milestone}% milestone`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
          <p className="text-[11px] text-slate-400">
            • Completing today&apos;s action nudges this up.
          </p>
          <p className="text-[11px] text-slate-400">
            • Missing days in a row slowly drains it.
          </p>
          <p className="text-[11px] text-slate-400">
            • Big husband moves give visible boosts.
          </p>
        </div>
      </div>

      {/* Milestone Celebration Modal */}
      {currentMilestone && (
        <HealthMilestoneModal milestone={currentMilestone} isOpen={true} onClose={handleCloseModal} />
      )}
    </>
  );
}


