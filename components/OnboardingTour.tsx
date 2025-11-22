'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  target: string; // CSS selector or data attribute
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'mission',
    target: '[data-tour="mission"]',
    title: "Tomorrow's Mission",
    content: "This is your daily action. Complete it to boost your Husband Hit Points. Each day you get a new action tailored to your situation.",
    position: 'bottom',
  },
  {
    id: 'hit-points',
    target: '[data-tour="hit-points"]',
    title: 'Husband Hit Points',
    content: "Your relationship health score. Complete actions to increase it. Miss days and it slowly decreases. Consistency is what moves the needle.",
    position: 'left',
  },
  {
    id: 'stats',
    target: '[data-tour="stats"]',
    title: 'Your Stats',
    content: "Track your progress here: current streak, total actions completed, and active days. Keep the streak going!",
    position: 'top',
  },
  {
    id: 'badges',
    target: '[data-tour="badges"]',
    title: 'Badges',
    content: "Earn badges by completing actions and hitting milestones. They're proof you're showing up consistently.",
    position: 'top',
  },
  {
    id: 'calendar',
    target: '[data-tour="calendar"]',
    title: 'Auto-Add to Calendar',
    content: "Turn this on to automatically add your daily actions to your calendar. Set it once and forget it.",
    position: 'top',
  },
  {
    id: 'navigation',
    target: '[data-tour="navigation"]',
    title: 'Navigation',
    content: "Use these links to explore: view all actions, check your badges, read your journal, see team wins, and access how-to guides.",
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

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('has_seen_onboarding_tour') === 'true';
    
    // Auto-start if they haven't seen it
    if (!hasSeenTour) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsActive(true);
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (isActive && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      
      if (element) {
        // Cleanup previous element
        if (highlightedRef.current) {
          highlightedRef.current.style.zIndex = '';
          highlightedRef.current.style.position = '';
        }
        
        setHighlightedElement(element);
        highlightedRef.current = element;
        
        // Scroll to element if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight class
        element.style.transition = 'all 0.3s ease';
        element.style.zIndex = '10000';
        element.style.position = 'relative';
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
        highlightedRef.current.style.zIndex = '';
        highlightedRef.current.style.position = '';
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
    if (onComplete) {
      onComplete();
    }
  };

  if (!isActive || currentStep >= TOUR_STEPS.length || !highlightedElement) {
    return null;
  }

  const step = TOUR_STEPS[currentStep];
  const rect = highlightedElement.getBoundingClientRect();
  const tooltipOffset = 20;

  // Calculate tooltip position based on step position
  let tooltipStyle: React.CSSProperties = {};
  switch (step.position) {
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
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, 0)',
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
    case 'center':
      tooltipStyle = {
        top: `${rect.top + window.scrollY + rect.height / 2}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, -50%)',
      };
      break;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Dark overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70"
        />

        {/* Highlight ring around element */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            top: `${rect.top - 8}px`,
            left: `${rect.left - 8}px`,
            width: `${rect.width + 16}px`,
            height: `${rect.height + 16}px`,
          }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="absolute border-4 border-primary-500 rounded-xl pointer-events-none z-[9999]"
          style={{
            boxShadow: '0 0 0 4px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.5)',
          }}
        />

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: step.position === 'top' ? 10 : step.position === 'bottom' ? -10 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bg-slate-900 border-2 border-primary-500 rounded-xl p-5 shadow-2xl max-w-sm pointer-events-auto z-[10000]"
          style={tooltipStyle}
        >
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-primary-400 font-semibold">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-200 text-sm"
            >
              Skip tour
            </button>
          </div>

          <h3 className="text-lg font-bold text-slate-50 mb-2">{step.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{step.content}</p>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-semibold text-slate-950 bg-primary-500 rounded-lg hover:bg-primary-400 transition-colors"
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
    // Remove the flag so tour will start on next render
    localStorage.removeItem('has_seen_onboarding_tour');
    // Reload to trigger tour
    window.location.reload();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleStartTour}
      disabled={isStarting}
      className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-primary-500 text-slate-950 text-sm font-semibold rounded-lg shadow-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      title="Take the tour again"
    >
      {isStarting ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>Starting...</span>
        </>
      ) : (
        <>
          <span>🎯</span>
          <span className="hidden sm:inline">Take Tour</span>
        </>
      )}
    </motion.button>
  );
}

