'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getGuideSlugForAction } from '@/lib/action-guide-mapping';

interface ActionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: {
    id: string;
    name: string;
    description: string;
    category: string;
    theme?: string;
    icon?: string | null;
    benefit?: string | null;
    requirement_type?: string | null;
  };
  onHide?: () => void;
  showHideButton?: boolean;
}

export default function ActionDetailModal({
  isOpen,
  onClose,
  action,
  onHide,
  showHideButton = false,
}: ActionDetailModalProps) {
  if (!isOpen) return null;

  const guideSlug = getGuideSlugForAction(action.name, action.theme);

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
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-primary-500/30 max-w-2xl w-full p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-50 pointer-events-none" />

              <div className="relative z-10">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1 z-20"
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
                    {action.category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2 flex items-center gap-3">
                    {action.icon && <span className="text-3xl">{action.icon}</span>}
                    <span>{action.name}</span>
                  </h3>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line">
                    {action.description}
                  </p>
                </div>

                {/* Benefit section */}
                {action.benefit && (
                  <div className="mb-6 p-5 bg-slate-800/60 border-l-4 border-primary-500/60 rounded-r-lg">
                    <p className="text-sm font-bold text-primary-300 mb-3">Why this matters:</p>
                    <p className="text-slate-200 text-base leading-relaxed">{action.benefit}</p>
                  </div>
                )}

                {/* Requirement type */}
                {action.requirement_type && (
                  <div className="mb-6">
                    <p className="text-xs text-slate-400 mb-1">Type:</p>
                    <p className="text-sm text-slate-300 capitalize">
                      {action.requirement_type.replace('_', ' ')}
                    </p>
                  </div>
                )}

                {/* How-To Guide link */}
                {guideSlug && (
                  <div className="mb-6">
                    <Link
                      href={`/dashboard/how-to-guides/${guideSlug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm font-medium rounded-lg hover:bg-emerald-500/30 transition-colors"
                    >
                      <span>📚</span>
                      <span>View How-To Guide</span>
                    </Link>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-6 flex gap-3">
                  {showHideButton && onHide && (
                    <button
                      onClick={() => {
                        if (confirm('Hide this action? You won\'t see it again. You can unhide it later in your settings.')) {
                          onHide();
                          onClose();
                        }
                      }}
                      className="px-6 py-3 border border-slate-700 text-slate-300 text-base font-medium rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-all min-h-[48px] touch-manipulation"
                    >
                      Hide Action
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className={`${showHideButton && onHide ? 'flex-1' : 'w-full'} px-6 py-3 bg-primary-500 text-slate-950 text-base font-bold rounded-xl hover:bg-primary-400 active:bg-primary-600 transition-all min-h-[48px] touch-manipulation`}
                  >
                    Got it! ✓
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

