'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipId: string;
  tipTitle: string;
  onSuccess: () => void;
  subscriptionTier?: string;
  isAction?: boolean; // Whether this is an action (vs a tip)
}

export default function ReflectionModal({
  isOpen,
  onClose,
  tipId,
  tipTitle,
  onSuccess,
  subscriptionTier = 'free',
  isAction = false,
}: ReflectionModalProps) {
  const [reflection, setReflection] = useState('');
  const [shareToForum, setShareToForum] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const isFree = subscriptionTier === 'free';

  // Fetch favorite status when modal opens (for actions only)
  useEffect(() => {
    if (isOpen && isAction) {
      fetchFavoriteStatus();
    }
  }, [isOpen, isAction, tipId]);

  const fetchFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/actions/favorites');
      if (response.ok) {
        const data = await response.json();
        const favoritedActionIds = new Set(data.favoritedActions?.map((a: any) => a.id) || []);
        setIsFavorited(favoritedActionIds.has(tipId));
      }
    } catch (error) {
      console.error('Error fetching favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAction) return;
    
    setIsTogglingFavorite(true);
    try {
      const response = await fetch('/api/actions/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionId: tipId }),
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) {
      setError('Please write something before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reflections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipId,
          content: reflection,
          shareToForum,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save reflection');
      }

      setReflection('');
      setShareToForum(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-50">Reflect on this action</h3>
          <div className="flex items-center gap-2">
            {isAction && (
              <button
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-default ${
                  isFavorited
                    ? 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                aria-label={isFavorited ? 'Unfavorite' : 'Favorite'}
                title={isFavorited ? 'Unfavorite this action' : 'Favorite this action'}
              >
                <span className="text-lg">{isFavorited ? '⭐' : '☆'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-2">What you completed:</p>
        <p className="text-slate-200 mb-6 font-medium">{tipTitle}</p>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            How did it go? What did you learn?
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Take a moment to reflect on what happened, what you noticed, or what you'd do differently..."
            className="w-full h-40 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />

          <div className="mt-4">
            {isFree ? (
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                <p className="text-sm text-slate-300 mb-2">
                  <span className="font-medium">Share to Team Wins</span> — Upgrade to Paid to share your wins
                </p>
                <Link
                  href="/dashboard/subscription"
                  className="text-xs text-primary-400 hover:text-primary-300 underline"
                >
                  Upgrade now →
                </Link>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="shareToForum"
                  checked={shareToForum}
                  onChange={(e) => setShareToForum(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 bg-slate-800 border-slate-700 rounded focus:ring-primary-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="shareToForum" className="text-sm text-slate-300 cursor-pointer">
                  <span className="font-medium">Share to Team Wins</span>
                  <span className="block text-xs text-slate-500 mt-1">
                    Other members can see this (anonymously) and comment. Help others learn from your
                    experience.
                  </span>
                </label>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

