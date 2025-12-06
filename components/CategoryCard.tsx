'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ChallengeDetailModal from './ChallengeDetailModal';
import { getCategoryColors } from '@/lib/category-colors';

interface Challenge {
  id: string;
  name: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  challenge_actions?: Array<{
    day_number: number;
    actions: {
      id: string;
      name: string;
      description: string;
      icon: string;
    };
  }>;
  duration_days?: number;
}

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
  challenge?: Challenge | null;
  partnerName?: string | null;
}

// Convert theme to category name for color mapping
const themeToCategory = (theme: string): string => {
  if (theme === 'quality_time') return 'Quality Time';
  if (theme === 'conflict_resolution') return 'Conflict Resolution';
  if (theme === 'communication') return 'Communication';
  if (theme === 'intimacy') return 'Intimacy';
  if (theme === 'partnership') return 'Partnership';
  if (theme === 'romance') return 'Romance';
  if (theme === 'gratitude') return 'Gratitude';
  if (theme === 'reconnection') return 'Reconnection';
  return theme.charAt(0).toUpperCase() + theme.slice(1).replace(/_/g, ' ');
};

const getThemeColor = (theme: string) => {
  const categoryName = themeToCategory(theme);
  const colors = getCategoryColors(categoryName);
  return `${colors.cardBorder} bg-gradient-to-br ${colors.cardBg} ${colors.cardHoverBorder}`;
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
  challenge,
  partnerName,
}: CategoryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const completionPercentage = actionCount > 0 ? Math.round((completedCount / actionCount) * 100) : 0;
  const colorClasses = getThemeColor(theme);

  const handleSeeEvent = () => {
    if (challenge) {
      setIsModalOpen(true);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`border rounded-lg p-4 transition-all ${colorClasses}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0 relative">
          <span className="text-2xl">{icon}</span>
          {completedCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-950">{completedCount}</span>
            </div>
          )}
        </div>
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
            style={{
              backgroundColor: getCategoryColors(themeToCategory(theme)).badgeBg.includes('cyan') ? 'rgb(6 182 212)' :
                              getCategoryColors(themeToCategory(theme)).badgeBg.includes('purple') ? 'rgb(168 85 247)' :
                              getCategoryColors(themeToCategory(theme)).badgeBg.includes('emerald') ? 'rgb(16 185 129)' :
                              getCategoryColors(themeToCategory(theme)).badgeBg.includes('pink') ? 'rgb(236 72 153)' :
                              getCategoryColors(themeToCategory(theme)).badgeBg.includes('amber') ? 'rgb(245 158 11)' :
                              getCategoryColors(themeToCategory(theme)).badgeBg.includes('orange') ? 'rgb(249 115 22)' :
                              getCategoryColors(themeToCategory(theme)).badgeBg.includes('indigo') ? 'rgb(99 102 241)' :
                              getCategoryColors(themeToCategory(theme)).badgeBg.includes('blue') ? 'rgb(59 130 246)' :
                              'rgb(14 165 233)'
            }}
            className="h-full rounded-full"
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
          <>
            <button
              onClick={handleSeeEvent}
              className={`w-full px-3 py-1.5 text-xs font-medium rounded-md transition-all ${getCategoryColors(themeToCategory(theme)).badgeBg} ${getCategoryColors(themeToCategory(theme)).badgeText} border ${getCategoryColors(themeToCategory(theme)).badgeBorder} hover:opacity-80`}
            >
              {isEnrolled ? 'Active' : 'See 7 Day Event'}
            </button>
            {challenge && isModalOpen && (
              <ChallengeDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                challenge={challenge}
                isEnrolled={isEnrolled}
                onJoin={onJoinEvent}
                partnerName={partnerName}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

