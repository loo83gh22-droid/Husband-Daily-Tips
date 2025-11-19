'use client';

import { useState } from 'react';

interface JournalEntryProps {
  reflection: {
    id: string;
    content: string;
    created_at: string;
    favorited: boolean;
    shared_to_forum: boolean;
    user_tips?: {
      tips?: {
        title: string;
        category: string;
      };
    };
    action?: {
      name: string;
      icon: string;
    };
  };
}

export default function JournalEntry({ reflection }: JournalEntryProps) {
  const [isFavorited, setIsFavorited] = useState(reflection.favorited || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const tip = reflection.user_tips?.tips;
  const isShared = reflection.shared_to_forum;
  const action = reflection.action;

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    try {
      const response = await fetch('/api/reflections/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reflectionId: reflection.id }),
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

  const isFavorite = isFavorited;

  return (
    <article
      className={`bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 ${
        isFavorite ? 'border-l-4 border-yellow-500/50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {action && (
            <div className="mb-2">
              <span className="text-xs text-slate-500">Action completed:</span>
              <div className="flex items-center gap-2 mt-1">
                {action.icon && <span className="text-lg">{action.icon}</span>}
                <p className="text-sm font-medium text-slate-200">{action.name}</p>
              </div>
            </div>
          )}
          {tip && (
            <div className="mb-2">
              <span className="text-xs text-slate-500">Reflection on:</span>
              <p className="text-sm font-medium text-slate-200 mt-1">{tip.title}</p>
              {tip.category && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/10 text-primary-300 text-xs rounded-full">
                  {tip.category}
                </span>
              )}
            </div>
          )}
          <time className="text-xs text-slate-500">
            {new Date(reflection.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </time>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-default ${
              isFavorite
                ? 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
            title={isFavorite ? 'Unfavorite this entry' : 'Favorite this entry'}
          >
            <span className="text-lg">{isFavorite ? '⭐' : '☆'}</span>
          </button>
          {isShared && (
            <span className="text-xs px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full border border-primary-500/30">
              Shared to Team Wins
            </span>
          )}
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-slate-200 leading-relaxed whitespace-pre-line">
          {reflection.content}
        </p>
      </div>
    </article>
  );
}

