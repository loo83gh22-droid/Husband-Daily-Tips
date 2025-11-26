'use client';

import { useState, useEffect } from 'react';

interface ActionCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: {
    id: string;
    name: string;
    description: string;
    icon: string | null;
  };
  onComplete: (notes?: string, linkToJournal?: boolean) => Promise<void>; // linkToJournal always true now, but keeping for API compatibility
}

export default function ActionCompletionModal({
  isOpen,
  onClose,
  action,
  onComplete,
}: ActionCompletionModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Fetch favorite status when modal opens
  useEffect(() => {
    if (isOpen && action.id) {
      async function fetchFavoriteStatus() {
        try {
          const response = await fetch('/api/actions/favorites');
          if (response.ok) {
            const data = await response.json();
            const favoritedActionIds = new Set(data.favoritedActions?.map((a: any) => a.id) || []);
            setIsFavorited(favoritedActionIds.has(action.id));
          }
        } catch (error) {
          console.error('Error fetching favorite status:', error);
        }
      }
      fetchFavoriteStatus();
    }
  }, [isOpen, action.id]);

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    try {
      const response = await fetch('/api/actions/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionId: action.id }),
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
    setIsSubmitting(true);

    try {
      // Always link to journal - notes are required for journal entry
      await onComplete(notes.trim() || `Completed: ${action.name}`, true);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error completing action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {action.icon && <span className="text-3xl flex-shrink-0">{action.icon}</span>}
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-slate-50">{action.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{action.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
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
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go? What did you learn? This will be saved to your journal."
              rows={4}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>

          <p className="text-xs text-slate-400">
            Your notes will be automatically saved to your journal as a record of this completion.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-slate-700 text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-default"
            >
              {isSubmitting ? 'Saving...' : 'Mark Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

