'use client';

import { useEffect, useState } from 'react';

interface HealthMilestoneModalProps {
  milestone: 50 | 60 | 70 | 80 | 90 | 100;
  isOpen: boolean;
  onClose: () => void;
}

export default function HealthMilestoneModal({ milestone, isOpen, onClose }: HealthMilestoneModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const milestoneData = {
    50: {
      emoji: '🎯',
      title: 'Halfway There!',
      message: "You've reached 50% health! Keep up the consistency - you're doing great!",
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
    },
    60: {
      emoji: '⭐',
      title: 'Making Progress!',
      message: "60% health! You're building momentum. Every action counts - keep going!",
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/50',
    },
    70: {
      emoji: '💪',
      title: 'Strong & Steady!',
      message: '70% health! Your consistency is paying off. You\'re becoming the partner you want to be.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50',
    },
    80: {
      emoji: '🚀',
      title: 'Flying High!',
      message: '80% health! You\'re in the top tier now. This level of consistency creates real change.',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
    },
    90: {
      emoji: '🔥',
      title: 'On Fire!',
      message: '90% health! You\'re a relationship warrior. This kind of dedication transforms relationships.',
      color: 'from-pink-500 to-purple-500',
      bgColor: 'bg-pink-500/20',
      borderColor: 'border-pink-500/50',
    },
    100: {
      emoji: '👑',
      title: 'Perfect Health!',
      message: "100% health! You're a relationship champion. This is the kind of consistency that creates lasting change.",
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/50',
    },
  };

  const data = milestoneData[milestone];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={`relative bg-slate-900 border-2 ${data.borderColor} rounded-2xl p-8 md:p-10 max-w-md w-full shadow-2xl transform transition-all animate-in zoom-in duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-gradient-to-r ${data.color} rounded-full animate-ping`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Emoji */}
            <div className="text-7xl md:text-8xl mb-4 animate-bounce">{data.emoji}</div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-3">{data.title}</h2>

            {/* Health Badge */}
            <div
              className={`inline-block ${data.bgColor} ${data.borderColor} border-2 rounded-full px-6 py-2 mb-4`}
            >
              <span className={`text-2xl font-bold bg-gradient-to-r ${data.color} bg-clip-text text-transparent`}>
                {milestone}% Health
              </span>
            </div>

            {/* Message */}
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">{data.message}</p>

            {/* CTA Button */}
            <button
              onClick={onClose}
              className={`bg-gradient-to-r ${data.color} text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity shadow-lg`}
            >
              Keep Going! 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

