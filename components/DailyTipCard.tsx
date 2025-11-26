'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ReflectionModal from './ReflectionModal';
import SocialShare from './SocialShare';
import ActionCelebration from './ActionCelebration';
import ShowMoreModal from './ShowMoreModal';
import { personalizeText } from '@/lib/personalize-text';
import { toast } from './Toast';
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
  completed?: boolean; // Whether the action is already completed
  isChallengeAction?: boolean; // Whether this is part of a 7-day event
  challengeDay?: number; // Day number in the event (1-7)
  challengeName?: string; // Name of the 7-day event
  challengeId?: string; // ID of the 7-day event
}

interface DailyTipCardProps {
  tip: Tip;
  subscriptionTier?: string;
  onActionReplaced?: (newAction: Tip) => void;
  partnerName?: string | null;
}

export default function DailyTipCard({ tip, subscriptionTier = 'free', onActionReplaced, partnerName }: DailyTipCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(tip.completed || false);
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [healthIncrease, setHealthIncrease] = useState(0);
  const [isMilestone, setIsMilestone] = useState(false);
  const [autoAddToCalendar, setAutoAddToCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'google' | 'outlook' | 'apple'>('google');
  const [isSavingCalendar, setIsSavingCalendar] = useState(false);
  const [isLoadingFeedUrl, setIsLoadingFeedUrl] = useState(false);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [showFeedUrl, setShowFeedUrl] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFullCalendarSettings, setShowFullCalendarSettings] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [isLeavingEvent, setIsLeavingEvent] = useState(false);

  const isPaidUser = subscriptionTier === 'premium' || subscriptionTier === 'pro';
  // Show simplified view if auto-add is enabled and calendar type is set
  const isCalendarSetup = autoAddToCalendar && calendarType;

  // Only set date after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setDisplayDate(format(new Date(), 'MMM d, yyyy'));
    
    // Fetch calendar preferences
    fetch('/api/user/preferences', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return { preferences: {} };
      })
      .then((data) => {
        const autoAdd = data.preferences?.auto_add_to_calendar || false;
        const calType = data.preferences?.calendar_type || 'google';
        setAutoAddToCalendar(autoAdd);
        setCalendarType(calType);
        // If already set up, show simplified view by default
        if (autoAdd && calType) {
          setShowFullCalendarSettings(false);
        }
      })
      .catch(() => {
        // Silently handle errors
      });
  }, []);

  const handleMarkDone = async () => {
    if (isSubmitting || isCompleted) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Get current health before completion (we'll estimate based on standard increase)
      // Daily actions give 6 health points
      const healthIncreaseAmount = 6;
      
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
      setHealthIncrease(healthIncreaseAmount);

      // Only show celebration for milestones (badges earned or significant achievements)
      const hasNewBadges = data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0;
      if (hasNewBadges) {
        setIsMilestone(true);
        setShowCelebration(true);
      } else {
        setIsMilestone(false);
        setShowCelebration(false);
      }

      // Show success toast
      toast.success('Action completed! Keep it up! 🎉', 3000);

      // Show badge notifications if any were earned
      if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
        setNewlyEarnedBadges(data.newlyEarnedBadges);
        // Show toast for each badge
        data.newlyEarnedBadges.forEach((badge: any) => {
          toast.success(`New badge earned: ${badge.icon} ${badge.name}!`, 5000);
        });
        // Auto-hide badge notification after 5 seconds
        setTimeout(() => setNewlyEarnedBadges([]), 5000);
      }

      // Show reflection modal immediately (or after celebration if badges earned)
      if (hasNewBadges) {
        // Wait for celebration to finish if badges were earned
        setTimeout(() => {
          setShowReflection(true);
        }, 3500);
      } else {
        // Show immediately for regular completions
        setTimeout(() => {
          setShowReflection(true);
        }, 500); // Small delay to let the toast appear first
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Could not save this action. You can try again in a moment.');
      toast.error('Failed to save action. Please try again.', 4000);
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

  const handleHideAction = async () => {
    if (!tip.isAction) return; // Only hide actions, not tips
    
    if (!confirm('Hide this action? You won\'t see it again. You can unhide it later in your settings.')) {
      return;
    }

    setIsHiding(true);
    try {
      // Hide the action
      const hideResponse = await fetch('/api/actions/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionId: tip.id }),
      });

      if (!hideResponse.ok) {
        throw new Error('Failed to hide action');
      }

      // Get a replacement action
      const replacementResponse = await fetch('/api/actions/replacement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ excludedActionId: tip.id }),
      });

      if (!replacementResponse.ok) {
        // If no replacement available, just refresh
        toast.success('Action hidden. You won\'t see this one again.');
        window.location.reload();
        return;
      }

      const replacementData = await replacementResponse.json();
      const newAction = replacementData.action;

      toast.success('Action hidden. Showing you a new one! 🎯');
      
      // Update the displayed action
      if (onActionReplaced && newAction) {
        onActionReplaced(newAction);
      } else {
        // Fallback: refresh page
        window.location.reload();
      }
    } catch (error) {
      console.error('Error hiding action:', error);
      toast.error('Failed to hide action. Please try again.');
    } finally {
      setIsHiding(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!tip.isChallengeAction || !tip.challengeId) return;
    
    const confirmed = confirm(
      `Are you sure you want to leave "${tip.challengeName}"? You'll return to regular daily actions.`
    );
    
    if (!confirmed) return;
    
    setIsLeavingEvent(true);
    try {
      const response = await fetch('/api/challenges/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challengeId: tip.challengeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to leave 7-day event');
      }

      const data = await response.json();
      toast.success(data.message || 'You have left the 7-day event. Returning to regular daily actions.');
      
      // Reload page to show regular daily action
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error leaving event:', error);
      toast.error(error.message || 'Failed to leave 7-day event. Please try again.');
      setIsLeavingEvent(false);
    }
  };

  const handleShowMore = async () => {
    if (!tip.isAction) return; // Only for actions
    
    // Show modal first
    setShowMoreModal(true);
  };

  const handleConfirmShowMore = async () => {
    setIsShowingMore(true);
    setShowMoreModal(false);
    
    try {
      const response = await fetch('/api/actions/show-more', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionId: tip.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }

      const data = await response.json();
      toast.success(`Got it! We'll show you more ${tip.category} actions. 🎯`);
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference. Please try again.');
    } finally {
      setIsShowingMore(false);
    }
  };

  const handleCalendarTypeChange = async (type: 'google' | 'outlook' | 'apple') => {
    setCalendarType(type);
    setIsSavingCalendar(true);
    try {
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          auto_add_to_calendar: autoAddToCalendar,
          calendar_type: type,
        }),
      });
    } catch (error) {
      console.error('Error updating calendar type:', error);
    } finally {
      setIsSavingCalendar(false);
    }
  };

  const handleGetFeedUrl = async () => {
    setIsLoadingFeedUrl(true);
    try {
      const response = await fetch('/api/calendar/feed-url');
      if (!response.ok) {
        const error = await response.json();
        if (error.requiresUpgrade) {
          alert('Calendar feed subscription is only available for paid users. Please upgrade to access automatic calendar syncing.');
        } else if (error.requiresEnable) {
          alert('Please enable auto-add to calendar first.');
        } else {
          throw new Error(error.error || 'Failed to get feed URL');
        }
        return;
      }

      const data = await response.json();
      setFeedUrl(data.feedUrl);
      setShowFeedUrl(true);
      // After generating feed URL, user is considered "set up" - can show simplified view
      setShowFullCalendarSettings(false);
    } catch (error: any) {
      console.error('Error getting feed URL:', error);
      alert('Failed to get calendar feed URL. Please try again.');
    } finally {
      setIsLoadingFeedUrl(false);
    }
  };

  const handleDownloadAllActions = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/calendar/actions/download?days=7');
      if (!response.ok) {
        throw new Error('Failed to download calendar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'best-husband-actions-7-days.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading calendar:', error);
      alert('Failed to download calendar. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyFeedUrl = () => {
    if (feedUrl) {
      navigator.clipboard.writeText(feedUrl);
      alert('Calendar feed URL copied to clipboard!');
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

  // Generate Apple Calendar ICS data URL for this action/tip
  const generateAppleCalendarUrl = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = new Date(tomorrow);
    startDate.setHours(9, 0, 0); // 9 AM default
    const endDate = new Date(startDate);
    endDate.setHours(10, 0, 0); // 1 hour event

    const formatDate = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };

    const escapeText = (text: string) => text.replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/;/g, '\\;');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Best Husband Ever//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${tip.id || 'action'}-${Date.now()}@besthusbandever.com
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${escapeText(tip.icon ? `${tip.icon} ${tip.title || tip.name || 'Daily Action'}` : tip.title || tip.name || 'Daily Action')}
DESCRIPTION:${escapeText(tip.description || tip.content || '')}
LOCATION:
STATUS:CONFIRMED
SEQUENCE:0
DTSTAMP:${formatDate(new Date())}
END:VEVENT
END:VCALENDAR`;

    // Create a data URL for the ICS content
    const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    return dataUrl;
  };

  return (
    <>
      <ActionCelebration
        isVisible={showCelebration}
        healthIncrease={healthIncrease}
        isMilestone={isMilestone}
        onComplete={() => setShowCelebration(false)}
      />
      {tip.isAction && tip.benefit && (
        <ShowMoreModal
          isOpen={showMoreModal}
          onClose={() => setShowMoreModal(false)}
          onConfirm={handleConfirmShowMore}
          actionName={tip.name || ''}
          category={tip.category}
          benefit={tip.benefit}
          icon={tip.icon}
        />
      )}
      <motion.div
        initial={false}
        animate={isCompleted ? { scale: [1, 1.02, 1], boxShadow: ['0 0 0px rgba(251, 191, 36, 0)', '0 0 20px rgba(251, 191, 36, 0.5)', '0 0 0px rgba(251, 191, 36, 0)'] } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-gradient-to-br from-slate-900/95 via-amber-950/10 to-slate-900/95 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 mb-4 sm:mb-6 border-2 border-primary-500/20 hover:border-primary-500/30 transition-all relative overflow-hidden"
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-primary-500/20 text-primary-300 text-xs sm:text-sm font-semibold rounded-full mb-2 sm:mb-3 border border-primary-500/30">
                {tip.category}
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-50 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                {tip.icon && <span className="text-2xl sm:text-3xl">{tip.icon}</span>}
                <span className="break-words">{personalizeText(tip.title || tip.name, partnerName)}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              {tip.isAction && (() => {
                const guideSlug = getGuideSlugForAction(tip.name || '', tip.theme);
                return guideSlug ? (
                  <Link
                    href={`/dashboard/how-to-guides/${guideSlug}`}
                    className="px-2 sm:px-3 py-1.5 border border-emerald-500/50 text-emerald-300 text-xs font-medium rounded-lg hover:bg-emerald-500/10 transition-colors flex items-center gap-1 sm:gap-1.5"
                  >
                    <span>📚</span>
                    <span className="hidden sm:inline">How-To Guide</span>
                    <span className="sm:hidden">Guide</span>
                  </Link>
                ) : null;
              })()}
              <button
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                className={`px-2 sm:px-3 py-1.5 border text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-default flex items-center gap-1 sm:gap-1.5 active:scale-95 ${
                  isFavorited
                    ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {isTogglingFavorite ? (
                  '...'
                ) : (
                  <>
                    <span>{isFavorited ? '⭐' : '☆'}</span>
                    <span className="hidden sm:inline">{isFavorited ? 'Favorited' : 'Favorite'}</span>
                  </>
                )}
              </button>
              {tip.isAction && (
                <button
                  onClick={handleHideAction}
                  disabled={isHiding}
                  className="px-2 sm:px-3 py-1.5 border border-slate-700 text-slate-400 text-xs font-medium rounded-lg hover:bg-slate-800 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-default flex items-center gap-1 sm:gap-1.5 active:scale-95"
                  title="Don't show me this action again"
                >
                  {isHiding ? (
                    '...'
                  ) : (
                    <>
                      <span>✕</span>
                      <span className="hidden sm:inline">Hide</span>
                    </>
                  )}
                </button>
              )}
              <div className="text-xs text-slate-500 text-right hidden sm:block" suppressHydrationWarning>
                {mounted ? displayDate : ''}
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-slate-100 text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-line mb-3 sm:mb-4">
              {personalizeText(tip.content || tip.description, partnerName)}
            </p>
            {tip.benefit && (
              <div className="mt-4 sm:mt-5 p-3 sm:p-4 md:p-5 bg-slate-800/60 border-l-4 border-primary-500/60 rounded-r-lg">
                <p className="text-xs sm:text-sm font-bold text-primary-300 mb-1 sm:mb-2">Why this matters:</p>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">{tip.benefit}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-5">
        {/* Primary Action Button */}
        <button
          onClick={handleMarkDone}
          data-mark-done-button="true"
          disabled={isSubmitting || isCompleted}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-sm sm:text-base md:text-lg font-bold rounded-xl hover:bg-primary-400 active:bg-primary-600 transition-all disabled:cursor-default min-h-[56px] touch-manipulation shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] w-full"
        >
          {isCompleted ? 'Action Done!' : isSubmitting ? 'Saving…' : '✓ Mark as done'}
        </button>

        {/* Leave Event button - only show for 7-day event actions */}
        {tip.isChallengeAction && tip.challengeId && (
          <button
            onClick={handleLeaveEvent}
            disabled={isLeavingEvent}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-200 text-xs sm:text-sm font-medium rounded-lg transition-all disabled:cursor-default min-h-[44px] touch-manipulation border border-slate-600 hover:border-slate-500"
          >
            {isLeavingEvent ? 'Leaving…' : 'Leave 7-Day Event'}
          </button>
        )}

        {/* Show me more like this button - only show after completion for actions */}
        {isCompleted && tip.isAction && tip.benefit && (
          <button
            onClick={handleShowMore}
            disabled={isShowingMore}
            className="px-6 py-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm font-semibold rounded-xl hover:bg-emerald-500/30 active:bg-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-default flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
          >
            {isShowingMore ? (
              '...'
            ) : (
              <>
                <span>🎯</span>
                <span>Show me more like this</span>
              </>
            )}
          </button>
        )}

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700/50">
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 border border-slate-700 text-slate-200 text-xs rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors flex items-center gap-1.5 min-h-[44px] touch-manipulation"
              >
                <span>📅</span>
                <span>Google</span>
              </a>
              <a
                href={generateOutlookCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 border border-slate-700 text-slate-200 text-xs rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors flex items-center gap-1.5 min-h-[44px] touch-manipulation"
              >
                <span>📅</span>
                <span>Outlook</span>
              </a>
              <a
                href={generateAppleCalendarUrl()}
                download="best-husband-action.ics"
                className="px-3 py-2 border border-slate-700 text-slate-200 text-xs rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors flex items-center gap-1.5 min-h-[44px] touch-manipulation"
              >
                <span>📅</span>
                <span>Apple</span>
              </a>
            </div>

            {/* Auto-add toggle and calendar options */}
            <div className="pt-3 border-t border-slate-700/50 space-y-3">
              {/* Simplified view for users who have already set up calendar */}
              {isCalendarSetup && !showFullCalendarSettings ? (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-slate-300 font-medium">
                      ✓ You're automatically adding future actions to your {calendarType === 'google' ? 'Google' : calendarType === 'outlook' ? 'Outlook' : 'Apple'} calendar
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isPaidUser ? 'Syncing automatically via calendar subscription' : 'New actions added daily via email'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFullCalendarSettings(true)}
                    className="px-3 py-1.5 text-[10px] text-slate-300 hover:text-slate-100 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
                  >
                    Manage
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-slate-300 font-medium">Auto-add to Calendar</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Automatically add future actions
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={autoAddToCalendar}
                        onChange={async (e) => {
                          const checked = e.target.checked;
                          setAutoAddToCalendar(checked);
                          setIsSavingCalendar(true);
                          try {
                            await fetch('/api/user/preferences', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({
                                auto_add_to_calendar: checked,
                                calendar_type: calendarType,
                              }),
                            });
                            if (!checked) {
                              setShowFullCalendarSettings(false);
                              setShowFeedUrl(false);
                            }
                          } catch (error) {
                            console.error('Error updating preference:', error);
                            setAutoAddToCalendar(!checked); // Revert on error
                          } finally {
                            setIsSavingCalendar(false);
                          }
                        }}
                        disabled={isSavingCalendar}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                  
                  {autoAddToCalendar && (
                <div className="space-y-3 pt-2">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-2">Choose your calendar:</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleCalendarTypeChange('google')}
                        disabled={isSavingCalendar}
                        className={`px-2.5 py-1.5 text-[10px] rounded-lg transition-colors ${
                          calendarType === 'google'
                            ? 'bg-primary-500/20 border border-primary-500/50 text-primary-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                        } disabled:opacity-50`}
                      >
                        Google
                      </button>
                      <button
                        onClick={() => handleCalendarTypeChange('outlook')}
                        disabled={isSavingCalendar}
                        className={`px-2.5 py-1.5 text-[10px] rounded-lg transition-colors ${
                          calendarType === 'outlook'
                            ? 'bg-primary-500/20 border border-primary-500/50 text-primary-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                        } disabled:opacity-50`}
                      >
                        Outlook
                      </button>
                      <button
                        onClick={() => handleCalendarTypeChange('apple')}
                        disabled={isSavingCalendar}
                        className={`px-2.5 py-1.5 text-[10px] rounded-lg transition-colors ${
                          calendarType === 'apple'
                            ? 'bg-primary-500/20 border border-primary-500/50 text-primary-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                        } disabled:opacity-50`}
                      >
                        Apple
                      </button>
                    </div>
                  </div>
                  
                  {isPaidUser ? (
                    <div className="space-y-2">
                      <button
                        onClick={handleGetFeedUrl}
                        disabled={isLoadingFeedUrl}
                        className="w-full px-3 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-xs font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-default flex items-center justify-center gap-2"
                      >
                        {isLoadingFeedUrl ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span>🔗</span>
                            <span>Get Calendar Subscription URL</span>
                          </>
                        )}
                      </button>
                      {showFeedUrl && feedUrl && (
                        <div className="bg-slate-800 rounded-lg p-2.5 space-y-2">
                          <p className="text-[10px] text-slate-300 font-medium">Your Calendar Feed URL:</p>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={feedUrl}
                              readOnly
                              className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-200"
                            />
                            <button
                              onClick={copyFeedUrl}
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] rounded transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="text-[9px] text-slate-400 space-y-0.5">
                            <p><strong>Google:</strong> Settings → Add calendar → From URL → Paste URL</p>
                            <p><strong>Outlook:</strong> Add calendar → Subscribe from web → Paste URL</p>
                            <p><strong>Apple:</strong> File → New Calendar Subscription → Paste URL</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleDownloadAllActions}
                        disabled={isDownloading}
                        className="w-full px-3 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-xs font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-default flex items-center justify-center gap-2"
                      >
                        {isDownloading ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <span>📥</span>
                            <span>Download Next 7 Days</span>
                          </>
                        )}
                      </button>
                      <p className="text-[9px] text-slate-500 mt-1 text-center">
                        Import into {calendarType === 'google' ? 'Google' : calendarType === 'outlook' ? 'Outlook' : 'Apple'} Calendar. New actions added daily via email.
                      </p>
                      <p className="text-[9px] text-primary-400 mt-1 text-center font-medium">
                        💡 Upgrade for automatic syncing (no manual clicks!)
                      </p>
                    </div>
                  )}
                </div>
              )}
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-slate-700/50">
              <SocialShare
                title={tip.title || tip.name || ''}
                text={`Tomorrow's Action: ${tip.title || tip.name} - ${(tip.content || tip.description || '').substring(0, 100)}...`}
              />
            </div>
          </div>

          {errorMessage && (
            <p className="mt-4 text-sm text-rose-400">{errorMessage}</p>
          )}

          {/* Badge notification */}
          {newlyEarnedBadges.length > 0 && (
            <div className="mt-5 p-5 bg-primary-500/10 border border-primary-500/30 rounded-lg">
              <p className="text-sm font-bold text-primary-300 mb-2">🎉 Badge Earned!</p>
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
            isAction={tip.isAction}
          />
        </div>
      </motion.div>
    </>
  );
}

