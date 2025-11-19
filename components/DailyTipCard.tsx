'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import ReflectionModal from './ReflectionModal';
import SocialShare from './SocialShare';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  tier: string;
  created_at: string;
  favorited?: boolean;
  userTipId?: string;
}

interface DailyTipCardProps {
  tip: Tip;
}

export default function DailyTipCard({ tip }: DailyTipCardProps) {
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

  const handleMarkDone = async () => {
    if (isSubmitting || isCompleted) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tips/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipId: tip.id }),
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
      const response = await fetch('/api/tips/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipId: tip.id }),
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

  return (
    <div className="bg-slate-900/80 rounded-xl shadow-lg p-8 mb-6 border border-slate-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full mb-2">
            {tip.category}
          </span>
          <h3 className="text-2xl font-semibold text-slate-50 mb-2">{tip.title}</h3>
        </div>
        <div className="text-xs text-slate-500 text-right">
          {format(new Date(), 'MMM d, yyyy')}
        </div>
      </div>
      
      <div className="prose max-w-none">
        <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line">
          {tip.content}
        </p>
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
            onClick={handleExportToCalendar}
            disabled={isExportingCalendar}
            className="px-4 py-2 border border-primary-500/50 text-primary-300 text-sm font-medium rounded-lg hover:bg-primary-500/10 transition-colors disabled:opacity-50 disabled:cursor-default flex items-center gap-2"
          >
            {isExportingCalendar ? (
              'Exporting...'
            ) : (
              <>
                <span>📅</span>
                <span>Send to Calendar</span>
              </>
            )}
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
        <div className="flex flex-col gap-2">
              <p className="text-[11px] text-slate-500">
                Completing this boosts your health bar. Skipping it won&apos;t break anything—but
                consistency is what actually moves the needle.
              </p>
          <SocialShare
            title={tip.title}
            text={`Today's action: ${tip.title} - ${tip.content.substring(0, 100)}...`}
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
        tipTitle={tip.title}
        onSuccess={() => {
          // Refresh page to show updated stats
          window.location.reload();
        }}
      />
    </div>
  );
}

