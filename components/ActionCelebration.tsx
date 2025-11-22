'use client';

import { useEffect, useState } from 'react';
import confetti, { type Options } from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionCelebrationProps {
  isVisible: boolean;
  healthIncrease?: number;
  isMilestone?: boolean;
  onComplete?: () => void;
}

const encouragingMessages = [
  "Nice work. Keep it up.",
  "That's how you do it.",
  "You're building something real.",
  "One action at a time. You got this.",
  "Consistency wins. You're doing it.",
  "Small moves, big impact.",
  "You showed up. That's what matters.",
];

export default function ActionCelebration({
  isVisible,
  healthIncrease = 0,
  isMilestone = false,
  onComplete,
}: ActionCelebrationProps) {
  const [message, setMessage] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Pick a random encouraging message
      const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      setMessage(randomMessage);

      // Trigger confetti for milestones or significant health increases
      if (isMilestone || healthIncrease >= 5) {
        setShowConfetti(true);
        triggerConfetti();
      }

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
        if (onComplete) {
          onComplete();
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isMilestone, healthIncrease, onComplete]);

  const triggerConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Launch confetti from multiple positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
      });
    }, 250);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border-2 border-primary-500/50 rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-4"
            >
              {isMilestone ? '🎉' : '✅'}
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-slate-50 mb-2"
            >
              Action Complete!
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-primary-300 font-medium mb-4"
            >
              {message}
            </motion.p>

            {healthIncrease > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-slate-400"
              >
                +{healthIncrease.toFixed(1)} Hit Points
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

