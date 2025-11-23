'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  target: string; // CSS selector or data attribute
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'mission',
    target: '[data-tour="mission"]',
    title: "Today's Mission",
    content: "This is your daily action. Complete it to boost your Husband Hit Points.",
    position: 'bottom',
  },
  {
    id: 'hit-points',
    target: '[data-tour="hit-points"]',
    title: 'Husband Hit Points',
    content: "Your relationship health score. Complete actions to increase it.",
    position: 'bottom',
  },
  {
    id: 'stats',
    target: '[data-tour="stats"]',
    title: 'Your Stats',
    content: "Track your progress: current streak, total actions, and active days.",
    position: 'bottom',
  },
  {
    id: 'badges',
    target: '[data-tour="badges"]',
    title: 'Badges',
    content: "Earn badges by completing actions and hitting milestones.",
    position: 'bottom',
  },
  {
    id: 'calendar',
    target: '[data-tour="calendar"]',
    title: 'Auto-Add to Calendar',
    content: "Turn this on to automatically add your daily actions to your calendar.",
    position: 'bottom',
  },
  {
    id: 'navigation',
    target: '[data-tour="navigation"]',
    title: 'Navigation',
    content: "Explore actions, badges, journal, team wins, and how-to guides.",
    position: 'bottom',
  },
];

interface OnboardingTourProps {
  onComplete?: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const highlightedRef = useRef<HTMLElement | null>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('has_seen_onboarding_tour') === 'true';
    
    // Auto-start if they haven't seen it
    if (!hasSeenTour) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsActive(true);
      }, 800);
    }
  }, []);

  useEffect(() => {
    if (isActive && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      
      if (element) {
        // Cleanup previous element
        if (highlightedRef.current) {
          highlightedRef.current.classList.remove('ring-4', 'ring-primary-500', 'ring-opacity-75', 'z-50', 'relative');
        }
        
        setHighlightedElement(element);
        highlightedRef.current = element;
        
        // Scroll to element smoothly
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight ring
        element.classList.add('ring-4', 'ring-primary-500', 'ring-opacity-75', 'z-50', 'relative');
        
        // Auto-advance after 3 seconds
        if (autoAdvanceTimerRef.current) {
          clearTimeout(autoAdvanceTimerRef.current);
        }
        autoAdvanceTimerRef.current = setTimeout(() => {
          handleNext();
        }, 3000);
      } else {
        // If element not found, skip to next step
        if (currentStep < TOUR_STEPS.length - 1) {
          setTimeout(() => setCurrentStep(currentStep + 1), 100);
        } else {
          handleComplete();
        }
      }
    }

    return () => {
      // Cleanup: remove highlight styles
      if (highlightedRef.current) {
        highlightedRef.current.classList.remove('ring-4', 'ring-primary-500', 'ring-opacity-75', 'z-50', 'relative');
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem('has_seen_onboarding_tour', 'true');
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    if (highlightedRef.current) {
      highlightedRef.current.classList.remove('ring-4', 'ring-primary-500', 'ring-opacity-75', 'z-50', 'relative');
    }
    if (onComplete) {
      onComplete();
    }
  };

  if (!isActive || currentStep >= TOUR_STEPS.length || !highlightedElement) {
    return null;
  }

  const step = TOUR_STEPS[currentStep];
  const rect = highlightedElement.getBoundingClientRect();
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isMobile = viewportWidth < 768;
  const tooltipOffset = 16;

  // Calculate tooltip position - always bottom on mobile, use step position on desktop
  let tooltipStyle: React.CSSProperties = {};
  const position = isMobile ? 'bottom' : step.position;
  
  switch (position) {
    case 'top':
      tooltipStyle = {
        top: `${rect.top + window.scrollY - tooltipOffset}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, -100%)',
      };
      break;
    case 'bottom':
      tooltipStyle = {
        top: `${rect.bottom + window.scrollY + tooltipOffset}px`,
        left: `${Math.max(16, Math.min(rect.left + rect.width / 2, viewportWidth - 16))}px`,
        transform: 'translate(-50%, 0)',
        maxWidth: `${Math.min(viewportWidth - 32, 320)}px`,
      };
      break;
    case 'left':
      tooltipStyle = {
        top: `${rect.top + window.scrollY + rect.height / 2}px`,
        left: `${rect.left + window.scrollX - tooltipOffset}px`,
        transform: 'translate(-100%, -50%)',
      };
      break;
    case 'right':
      tooltipStyle = {
        top: `${rect.top + window.scrollY + rect.height / 2}px`,
        left: `${rect.right + window.scrollX + tooltipOffset}px`,
        transform: 'translate(0, -50%)',
      };
      break;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Subtle backdrop - not a full dark overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20"
          onClick={handleSkip}
        />

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed bg-slate-900 border-2 border-primary-500 rounded-xl p-4 shadow-2xl pointer-events-auto z-[10000]"
          style={tooltipStyle}
        >
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-primary-400 font-semibold">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-200 text-xs font-medium"
            >
              Skip
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-50 mb-1">{step.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">{step.content}</p>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                if (autoAdvanceTimerRef.current) {
                  clearTimeout(autoAdvanceTimerRef.current);
                }
                setCurrentStep(Math.max(0, currentStep - 1));
              }}
              disabled={currentStep === 0}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (autoAdvanceTimerRef.current) {
                  clearTimeout(autoAdvanceTimerRef.current);
                }
                handleNext();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-primary-500 rounded-lg hover:bg-primary-400 transition-colors"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Got it!' : 'Next'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Button component to restart the tour
export function TourButton() {
  const handleStartTour = () => {
    // Remove the flag so tour will start
    localStorage.removeItem('has_seen_onboarding_tour');
    // Trigger tour by setting a flag and reloading
    window.location.reload();
  };

  return (
    <button
      onClick={handleStartTour}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 px-3 py-2 md:px-4 md:py-2 bg-primary-500 text-slate-950 text-xs md:text-sm font-semibold rounded-lg shadow-lg hover:bg-primary-400 transition-colors flex items-center gap-2 touch-manipulation"
      title="Take the tour again"
    >
      <span>🎯</span>
      <span className="hidden sm:inline">Take Tour</span>
    </button>
  );
}
