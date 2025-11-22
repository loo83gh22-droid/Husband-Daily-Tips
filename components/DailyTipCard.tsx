'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import ReflectionModal from './ReflectionModal';
import SocialShare from './SocialShare';
import { getGuideSlugForAction } from '@/lib/action-guide-mapping';

interface Tip {
  id: string;
  title?: string; // For tips
  name?: string; // For actions
  content?: string; // For tips
  description?: string; // For actions
  benefit?: string; // For actions - why it's valuable
  category: string;
  theme?: string; // For actions - theme/category
  tier?: string;
  created_at: string;
  favorited?: boolean;
  userTipId?: string;
  userActionId?: string;
  isAction?: boolean; // Flag to indicate if this is an action
  icon?: string; // For actions
}

interface DailyTipCardProps {
  tip: Tip;
  subscriptionTier?: string;
}

export default function DailyTipCard({ tip, subscriptionTier = 'free' }: DailyTipCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<
    Array<{ name: string; description: string; icon: string; healthBonus: number }>
  >([]);
  const [isExportingCalendar, setIsExportingCalendar] = useState(false);
  const [isFavorited, setIsFavorited] = useState(tip.favorited || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [displayDate, setDisplayDate] = useState('');

  // Only set date after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setDisplayDate(format(new Date(), 'MMM d, yyyy'));
  }, []);

  const handleMarkDone = async () => {
    if (isSubmitting || isCompleted) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Use action completion API if it's an action, otherwise use tip API
      const endpoint = tip.isAction ? '/api/actions/complete' : '/api/tips/complete';
      const body = tip.isAction 
        ? { actionId: tip.id }
        : { tipId: tip.id };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as done');
      }

      const data = await response.json();
      setIsCompleted(true);

      // Show badge notifications if any were earned
      if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
        setNewlyEarnedBadges(data.newlyEarnedBadges);
        // Auto-hide badge notification after 5 seconds
        setTimeout(() => setNewlyEarnedBadges([]), 5000);
      }

      // Show reflection modal after a brief delay
      setTimeout(() => {
        setShowReflection(true);
      }, 500);
    } catch (error) {
      console.error(error);
      setErrorMessage('Could not save this action. You can try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToCalendar = async () => {
    setIsExportingCalendar(true);
    try {
      const response = await fetch('/api/calendar/tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipId: tip.id,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export to calendar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-action-${tip.id}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting to calendar:', error);
      alert('Failed to export to calendar. Please try again.');
    } finally {
      setIsExportingCalendar(false);
    }
  };

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    try {
      // Use action favorite API if it's an action, otherwise use tip favorite API
      const endpoint = tip.isAction ? '/api/actions/favorite' : '/api/tips/favorite';
      const body = tip.isAction 
        ? { actionId: tip.id }
        : { tipId: tip.id };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await response.json();
      setIsFavorited(data.favorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite. Please try again.');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Generate Google Calendar URL for this action/tip
  const generateGoogleCalendarUrl = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = new Date(tomorrow);
    startDate.setHours(9, 0, 0); // 9 AM default
    const endDate = new Date(startDate);
    endDate.setHours(10, 0, 0); // 1 hour event

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: tip.title || tip.name || 'Daily Action',
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: tip.description || tip.content || '',
      sf: 'true',
      output: 'xml',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Generate Outlook Calendar URL for this action/tip
  const generateOutlookCalendarUrl = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = new Date(tomorrow);
    startDate.setHours(9, 0, 0); // 9 AM default
    const endDate = new Date(startDate);
    endDate.setHours(10, 0, 0); // 1 hour event

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      subject: tip.title || tip.name || 'Daily Action',
      startdt: formatDate(startDate),
      enddt: formatDate(endDate),
      body: tip.description || tip.content || '',
      location: '',
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  return (
    <div className="bg-slate-900/80 rounded-xl shadow-lg p-8 mb-6 border border-slate-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full mb-2">
            {tip.category}
          </span>
          <h3 className="text-2xl font-semibold text-slate-50 mb-2 flex items-center gap-2">
            {tip.icon && <span>{tip.icon}</span>}
            {tip.title || tip.name}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {tip.isAction && (() => {
            const guideSlug = getGuideSlugForAction(tip.name || '', tip.theme);
            return guideSlug ? (
              <Link
                href={`/dashboard/how-to-guides/${guideSlug}`}
                className="px-3 py-1.5 border border-emerald-500/50 text-emerald-300 text-xs font-medium rounded-lg hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5"
              >
                <span>📚</span>
                <span>How-To Guide</span>
              </Link>
            ) : null;
          })()}
          <div className="text-xs text-slate-500 text-right" suppressHydrationWarning>
            {mounted ? displayDate : ''}
          </div>
        </div>
      </div>
      
      <div className="prose max-w-none">
        <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line mb-3">
          {tip.content || tip.description}
        </p>
        {tip.benefit && (
          <div className="mt-4 p-4 bg-slate-800/50 border-l-4 border-primary-500/50 rounded-r-lg">
            <p className="text-xs font-semibold text-primary-300 mb-1">Why this matters:</p>
            <p className="text-slate-300 text-sm leading-relaxed">{tip.benefit}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleMarkDone}
            disabled={isSubmitting || isCompleted}
            className="px-4 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-default"
          >
            {isCompleted ? 'Marked as done ✓' : isSubmitting ? 'Saving…' : 'Mark as done ✓'}
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-slate-700 text-slate-100 text-sm rounded-lg hover:bg-slate-900 transition-colors"
          >
            Save for later
          </button>
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`px-4 py-2 border text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-default flex items-center gap-2 ${
              isFavorited
                ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                : 'border-slate-700 text-slate-300 hover:bg-slate-900'
            }`}
          >
            {isTogglingFavorite ? (
              '...'
            ) : (
              <>
                <span>{isFavorited ? '⭐' : '☆'}</span>
                <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={generateGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-slate-700 text-slate-100 text-sm rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
          >
            <span>📅</span>
            <span>Add to Google Calendar</span>
          </a>
          <a
            href={generateOutlookCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-slate-700 text-slate-100 text-sm rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
          >
            <span>📅</span>
            <span>Add to Outlook Calendar</span>
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <SocialShare
            title={tip.title || tip.name || ''}
            text={`Tomorrow's Action: ${tip.title || tip.name} - ${(tip.content || tip.description || '').substring(0, 100)}...`}
          />
        </div>
      </div>

      {errorMessage && (
        <p className="mt-3 text-[11px] text-rose-400">{errorMessage}</p>
      )}

      {/* Badge notification */}
      {newlyEarnedBadges.length > 0 && (
        <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <p className="text-xs font-semibold text-primary-300 mb-2">🎉 Badge Earned!</p>
          {newlyEarnedBadges.map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2 last:mb-0">
              <span className="text-xl">{badge.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-200">{badge.name}</p>
                <p className="text-xs text-slate-400">{badge.description}</p>
                {badge.healthBonus > 0 && (
                  <p className="text-xs text-primary-300 mt-1">
                    +{badge.healthBonus} health bonus
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reflection Modal */}
      <ReflectionModal
        isOpen={showReflection}
        onClose={() => setShowReflection(false)}
        tipId={tip.id}
        tipTitle={tip.title || tip.name || 'Action'}
        onSuccess={() => {
          // Refresh page to show updated stats
          window.location.reload();
        }}
        subscriptionTier={subscriptionTier}
      />
    </div>
  );
}

