'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  theme: string;
  name: string;
  icon: string;
  actionCount: number;
  completedCount: number;
  eventId?: string;
  eventName?: string;
  isEnrolled?: boolean;
  onJoinEvent?: (eventId: string) => void;
}

const getThemeColor = (theme: string) => {
  const colors: Record<string, string> = {
    communication: 'border-blue-500/30 bg-gradient-to-br from-slate-900/90 via-blue-950/20 to-slate-800/90 hover:border-blue-500/50',
    intimacy: 'border-pink-500/30 bg-gradient-to-br from-slate-900/90 via-pink-950/20 to-slate-800/90 hover:border-pink-500/50',
    partnership: 'border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-emerald-950/20 to-slate-800/90 hover:border-emerald-500/50',
    romance: 'border-rose-500/30 bg-gradient-to-br from-slate-900/90 via-rose-950/20 to-slate-800/90 hover:border-rose-500/50',
    gratitude: 'border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-amber-950/20 to-slate-800/90 hover:border-amber-500/50',
    conflict_resolution: 'border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-purple-950/20 to-slate-800/90 hover:border-purple-500/50',
    reconnection: 'border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-cyan-950/20 to-slate-800/90 hover:border-cyan-500/50',
    quality_time: 'border-green-500/30 bg-gradient-to-br from-slate-900/90 via-green-950/20 to-slate-800/90 hover:border-green-500/50',
  };
  return colors[theme] || 'border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-800/90 hover:border-slate-600/50';
};

export default function CategoryCard({
  theme,
  name,
  icon,
  actionCount,
  completedCount,
  eventId,
  eventName,
  isEnrolled,
  onJoinEvent,
}: CategoryCardProps) {
  const completionPercentage = actionCount > 0 ? Math.round((completedCount / actionCount) * 100) : 0;
  const colorClasses = getThemeColor(theme);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`border rounded-lg p-4 transition-all ${colorClasses}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-slate-50 truncate">{name}</h3>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-primary-500 rounded-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        <Link
          href={`/dashboard/actions#category-${theme}`}
          className="w-full px-3 py-1.5 text-xs font-medium text-slate-100 bg-slate-800/50 border border-slate-700 rounded-md hover:bg-slate-700/50 transition-colors text-center"
        >
          View Actions
        </Link>
        {eventId && eventName && (
          <button
            onClick={() => eventId && onJoinEvent?.(eventId)}
            disabled={isEnrolled}
            className={`w-full px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isEnrolled
                ? 'bg-slate-700/30 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30'
            }`}
          >
            {isEnrolled ? 'Active' : 'Start Event'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

