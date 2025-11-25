'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ShowMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionName: string;
  category: string;
  benefit: string;
  icon?: string;
}

export default function ShowMoreModal({
  isOpen,
  onClose,
  onConfirm,
  actionName,
  category,
  benefit,
  icon,
}: ShowMoreModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-primary-500/30 max-w-lg w-full p-6 md:p-8 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-50 pointer-events-none" />

              <div className="relative z-10">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  aria-label="Close"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Header */}
                <div className="mb-6">
                  <span className="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-300 text-sm font-semibold rounded-full mb-3 border border-primary-500/30">
                    {category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2 flex items-center gap-3">
                    {icon && <span className="text-3xl">{icon}</span>}
                    <span>{actionName}</span>
                  </h3>
                  <p className="text-slate-400 text-sm">
                    We'll show you more actions like this!
                  </p>
                </div>

                {/* Benefit section */}
                <div className="mt-6 p-5 bg-slate-800/60 border-l-4 border-primary-500/60 rounded-r-lg">
                  <p className="text-sm font-bold text-primary-300 mb-3">Why this matters:</p>
                  <p className="text-slate-200 text-base leading-relaxed">{benefit}</p>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border border-slate-700 text-slate-300 text-base font-medium rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-all min-h-[48px] touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 px-6 py-3 bg-primary-500 text-slate-950 text-base font-bold rounded-xl hover:bg-primary-400 active:bg-primary-600 transition-all min-h-[48px] touch-manipulation"
                  >
                    Show me more! 🎯
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

