'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ReflectionModal from './ReflectionModal';
import SocialShare from './SocialShare';
import ActionCelebration from './ActionCelebration';
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [healthIncrease, setHealthIncrease] = useState(0);
  const [isMilestone, setIsMilestone] = useState(false);
  const [autoAddToCalendar, setAutoAddToCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'google' | 'outlook' | 'apple'>('google');

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
        setAutoAddToCalendar(data.preferences?.auto_add_to_calendar || false);
        setCalendarType(data.preferences?.calendar_type || 'google');
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

      // Check if this might be a milestone (we'll trigger confetti for significant increases)
      // For now, trigger confetti for any completion, but we could check actual health
      setIsMilestone(false);

      // Show celebration animation
      setShowCelebration(true);

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

      // Show reflection modal after celebration completes
      setTimeout(() => {
        setShowReflection(true);
      }, 3500); // Wait for celebration to finish
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
      <motion.div
        initial={false}
        animate={isCompleted ? { scale: [1, 1.02, 1], boxShadow: ['0 0 0px rgba(251, 191, 36, 0)', '0 0 20px rgba(251, 191, 36, 0.5)', '0 0 0px rgba(251, 191, 36, 0)'] } : {}}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-gradient-to-br from-slate-900/95 via-amber-950/10 to-slate-900/95 rounded-2xl shadow-2xl p-8 md:p-10 mb-6 border-2 border-primary-500/20 hover:border-primary-500/30 transition-all relative overflow-hidden"
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <span className="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-300 text-sm font-semibold rounded-full mb-3 border border-primary-500/30">
                {tip.category}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-50 mb-3 flex items-center gap-3">
                {tip.icon && <span className="text-3xl">{tip.icon}</span>}
                <span>{tip.title || tip.name}</span>
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
            <p className="text-slate-100 text-base md:text-lg leading-relaxed whitespace-pre-line mb-4">
              {tip.content || tip.description}
            </p>
            {tip.benefit && (
              <div className="mt-5 p-5 bg-slate-800/60 border-l-4 border-primary-500/60 rounded-r-lg">
                <p className="text-sm font-bold text-primary-300 mb-2">Why this matters:</p>
                <p className="text-slate-200 text-base leading-relaxed">{tip.benefit}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-5">
        {/* Primary Action Button */}
        <button
          onClick={handleMarkDone}
          disabled={isSubmitting || isCompleted}
          className="px-8 py-4 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-base md:text-lg font-bold rounded-xl hover:bg-primary-400 active:bg-primary-600 transition-all disabled:cursor-default min-h-[56px] touch-manipulation shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isCompleted ? '✓ Marked as done' : isSubmitting ? 'Saving…' : '✓ Mark as done'}
        </button>

            {/* Secondary Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700/50">
              <button
                type="button"
                className="px-4 py-2.5 border border-slate-700 text-slate-200 text-sm rounded-lg hover:bg-slate-800 active:bg-slate-700 transition-colors min-h-[44px] touch-manipulation"
              >
                Save for later
              </button>
              <button
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                className={`px-4 py-2.5 border text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-default flex items-center gap-2 min-h-[44px] touch-manipulation active:scale-95 ${
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
                    <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
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
            {/* Auto-add toggle - compact version */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
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
                    } catch (error) {
                      console.error('Error updating preference:', error);
                      setAutoAddToCalendar(!checked); // Revert on error
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            <div className="flex flex-col gap-2">
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
          />
        </div>
      </motion.div>
    </>
  );
}

