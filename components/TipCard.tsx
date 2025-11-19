'use client';

import { useState } from 'react';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  tier: string;
  created_at: string;
}

interface TipCardProps {
  tip: Tip;
  userTip: {
    id: string;
    date: string;
    favorited: boolean;
  };
}

export default function TipCard({ tip, userTip }: TipCardProps) {
  const [isFavorited, setIsFavorited] = useState(userTip.favorited || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

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
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 border-l-4 border-primary-600">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full mb-2">
            {tip.category}
          </span>
          <h3 className="text-xl md:text-2xl font-semibold text-slate-50 mb-2">
            {tip.title}
          </h3>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="text-xs text-slate-500 text-right">
            {new Date(userTip.date).toLocaleDateString()}
          </div>
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-default ${
              isFavorited
                ? 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className="text-lg">{isFavorited ? '⭐' : '☆'}</span>
          </button>
        </div>
      </div>
      <p className="text-slate-200 leading-relaxed whitespace-pre-line">
        {tip.content}
      </p>
    </div>
  );
}

