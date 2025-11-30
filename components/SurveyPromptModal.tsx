'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SurveyPromptModalProps {
  userId: string;
  onDismiss: () => void;
}

export default function SurveyPromptModal({ userId, onDismiss }: SurveyPromptModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSkip = () => {
    // Just dismiss the modal - don't mark as completed
    // User can take survey later via the banner or navigation
    onDismiss();
  };

  const handleTakeSurvey = () => {
    router.push('/dashboard/survey');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl p-8 md:p-10 border border-slate-700/50 shadow-2xl max-w-md w-full"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-3">
              Welcome! Let&apos;s personalize your experience
            </h2>
            <p className="text-slate-300 text-base md:text-lg mb-4">
              Completing this survey helps us develop your baseline score and personalize your experience.
            </p>
            <p className="text-slate-400 text-sm">
              Takes about 5 minutes • Your answers are private
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleTakeSurvey}
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Take Survey Now
            </button>
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-6 py-3 bg-slate-800 text-slate-200 font-medium rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Skipping...' : 'Skip for Now'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

