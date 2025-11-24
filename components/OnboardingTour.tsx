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
    content: "This is your daily action. Complete it to boost your Health Bar. Each day you get a new action tailored to your situation.",
    position: 'bottom',
  },
  {
    id: 'hit-points',
    target: '[data-tour="hit-points"]',
    title: 'Health Bar',
    content: "Your relationship health score. Complete actions to increase it. Miss days and it slowly decreases. Consistency is what moves the needle.",
    position: 'bottom',
  },
  {
    id: 'stats',
    target: '[data-tour="stats"]',
    title: 'Your Stats',
    content: "Track your progress here: current streak, total actions completed, and active days. Keep the streak going!",
    position: 'bottom',
  },
  {
    id: 'badges',
    target: '[data-tour="badges"]',
    title: 'Badges',
    content: "Earn badges by completing actions and hitting milestones. They're proof you're showing up consistently.",
    position: 'bottom',
  },
  {
    id: 'calendar',
    target: '[data-tour="calendar"]',
    title: 'Auto-Add to Calendar',
    content: "Turn this on to automatically add your daily actions to your calendar. Set it once and forget it.",
    position: 'bottom',
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
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('has_seen_onboarding_tour') === 'true';
    
    // Auto-start if they haven't seen it
    if (!hasSeenTour) {
      // Longer delay to ensure DOM is fully ready
      setTimeout(() => {
        setIsActive(true);
        // Initialize highlightedElement immediately so tooltip can render
        if (typeof document !== 'undefined') {
          setHighlightedElement(document.body);
        }
      }, 1000);
    }
  }, []);

  // Function to find element with retry logic
  const findElement = (selector: string, retries = 5): HTMLElement | null => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      return element;
    }
    
    if (retries > 0) {
      // Retry after a short delay
      return null; // Will be handled by retry logic
    }
    
    return null;
  };

  useEffect(() => {
    if (isActive && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      
      // Cleanup previous element
      if (highlightedRef.current) {
        highlightedRef.current.classList.remove('ring-4', 'ring-primary-500', 'ring-opacity-75', 'z-50', 'relative');
      }
      
      // Clear any existing timer
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }

      // CRITICAL: Always ensure highlightedElement is set so tooltip renders
      // Use a dummy div if document.body isn't available yet
      if (typeof document !== 'undefined') {
        if (!highlightedElement || highlightedElement === document.body) {
          // Create a dummy element to ensure tooltip always renders
          const dummy = document.createElement('div');
          dummy.style.position = 'fixed';
          dummy.style.top = '50%';
          dummy.style.left = '50%';
          dummy.style.width = '1px';
          dummy.style.height = '1px';
          dummy.style.pointerEvents = 'none';
          dummy.style.visibility = 'hidden';
          document.body.appendChild(dummy);
          setHighlightedElement(dummy);
        }
      }

      // Try to find element with retry logic
      const tryFindElement = (attempt = 0) => {
        const element = document.querySelector(step.target) as HTMLElement;
        
        if (element) {
          // Check if element is actually visible (not just in DOM)
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0 && 
                           element.offsetParent !== null &&
                           window.getComputedStyle(element).visibility !== 'hidden' &&
                           window.getComputedStyle(element).display !== 'none';
          
          if (isVisible) {
            // Element found and visible
            retryCountRef.current = 0;
            
            // Remove dummy element if it exists
            const dummy = document.querySelector('[data-tour-dummy]');
            if (dummy) {
              dummy.remove();
            }
            
            setHighlightedElement(element);
            highlightedRef.current = element;
            
            // Scroll to element smoothly
            setTimeout(() => {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            
            // Add highlight ring after scroll
            setTimeout(() => {
              element.classList.add('ring-4', 'ring-primary-500', 'ring-opacity-75', 'z-50', 'relative');
            }, 400);
            
            // Auto-advance after 4 seconds
            autoAdvanceTimerRef.current = setTimeout(() => {
              handleNext();
            }, 4000);
          } else if (attempt < 15) {
            // Element found but not visible yet - retry
            retryCountRef.current = attempt + 1;
            setTimeout(() => tryFindElement(attempt + 1), 200 + (attempt * 50));
          } else {
            // Element exists but never became visible - show tooltip centered anyway
            retryCountRef.current = 0;
            
            // Keep dummy element so tooltip shows centered
            if (typeof document !== 'undefined' && !document.querySelector('[data-tour-dummy]')) {
              const dummy = document.createElement('div');
              dummy.setAttribute('data-tour-dummy', 'true');
              dummy.style.position = 'fixed';
              dummy.style.top = '50%';
              dummy.style.left = '50%';
              dummy.style.width = '1px';
              dummy.style.height = '1px';
              dummy.style.pointerEvents = 'none';
              dummy.style.visibility = 'hidden';
              document.body.appendChild(dummy);
              setHighlightedElement(dummy);
            }
            
            // Auto-advance after 3 seconds
            autoAdvanceTimerRef.current = setTimeout(() => {
              handleNext();
            }, 3000);
          }
        } else if (attempt < 15) {
          // Element not found - retry with exponential backoff
          retryCountRef.current = attempt + 1;
          setTimeout(() => tryFindElement(attempt + 1), 200 + (attempt * 50));
        } else {
          // After retries, ensure dummy element exists for centered tooltip
          retryCountRef.current = 0;
          
          if (typeof document !== 'undefined' && !document.querySelector('[data-tour-dummy]')) {
            const dummy = document.createElement('div');
            dummy.setAttribute('data-tour-dummy', 'true');
            dummy.style.position = 'fixed';
            dummy.style.top = '50%';
            dummy.style.left = '50%';
            dummy.style.width = '1px';
            dummy.style.height = '1px';
            dummy.style.pointerEvents = 'none';
            dummy.style.visibility = 'hidden';
            document.body.appendChild(dummy);
            setHighlightedElement(dummy);
          }
          
          // Auto-advance after 3 seconds
          autoAdvanceTimerRef.current = setTimeout(() => {
            handleNext();
          }, 3000);
        }
      };

      // Start trying to find element
      tryFindElement(0);
    }

    return () => {
      // Cleanup dummy elements
      const dummy = document.querySelector('[data-tour-dummy]');
      if (dummy) {
        dummy.remove();
      }
      // Cleanup: remove highlight styles
      if (highlightedRef.current) {
        highlightedRef.current.classList.remove('ring-4', 'ring-primary-500', 'ring-opacity-75', 'z-50', 'relative');
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [currentStep, isActive, highlightedElement]);

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

  // ALWAYS show tooltip when active - don't check highlightedElement
  if (!isActive || currentStep >= TOUR_STEPS.length) {
    return null;
  }

  const step = TOUR_STEPS[currentStep];
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isMobile = viewportWidth < 768;

  // Calculate tooltip position - ALWAYS show tooltip
  let tooltipStyle: React.CSSProperties = {};
  
  // Check if we have a valid element (not dummy, not body)
  const isDummyElement = highlightedElement?.hasAttribute?.('data-tour-dummy') || 
                         highlightedElement === document.body;
  
  if (highlightedElement && !isDummyElement && typeof highlightedElement.getBoundingClientRect === 'function') {
    try {
      const rect = highlightedElement.getBoundingClientRect();
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      const tooltipHeight = 200; // Approximate tooltip height
      
      // Only use element position if rect is valid and element is visible
      if (rect.width > 0 && rect.height > 0 && 
          rect.top >= 0 && rect.left >= 0 &&
          rect.bottom <= viewportHeight + 100 && // Allow some off-screen tolerance
          rect.right <= viewportWidth + 100) {
        const tooltipOffset = 16;
        const tooltipLeft = Math.max(16, Math.min(rect.left + rect.width / 2, viewportWidth - 16));
        
        // Check if tooltip would fit below the element
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // Position tooltip below if there's enough space, otherwise above
        let tooltipTop: number;
        let transform: string;
        
        if (spaceBelow >= tooltipHeight + tooltipOffset) {
          // Position below element
          tooltipTop = rect.bottom + window.scrollY + tooltipOffset;
          transform = 'translate(-50%, 0)';
        } else if (spaceAbove >= tooltipHeight + tooltipOffset) {
          // Position above element (for navigation at top of page)
          tooltipTop = rect.top + window.scrollY - tooltipOffset;
          transform = 'translate(-50%, -100%)';
        } else {
          // Not enough space above or below, center it
          tooltipTop = viewportHeight / 2;
          transform = 'translate(-50%, -50%)';
        }
        
        tooltipStyle = {
          top: `${tooltipTop}px`,
          left: `${tooltipLeft}px`,
          transform: transform,
          maxWidth: `${Math.min(viewportWidth - 32, 340)}px`,
          position: 'fixed' as const,
          zIndex: 10000,
        };
      } else {
        // Element exists but positioning would be off-screen, center it instead
        tooltipStyle = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: `${Math.min(viewportWidth - 32, 340)}px`,
          position: 'fixed' as const,
          zIndex: 10000,
        };
      }
    } catch (e) {
      // Fallback to center if getBoundingClientRect fails
      tooltipStyle = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: `${Math.min(viewportWidth - 32, 340)}px`,
        position: 'fixed' as const,
        zIndex: 10000,
      };
    }
  } else {
    // Floating tooltip in center - always show tooltip even if element not found
    tooltipStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: `${Math.min(viewportWidth - 32, 340)}px`,
    };
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Subtle backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20"
          onClick={handleSkip}
        />

        {/* Tooltip - always show, even if element not found */}
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
    // Trigger tour by reloading
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
