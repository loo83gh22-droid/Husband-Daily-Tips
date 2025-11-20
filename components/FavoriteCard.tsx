'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface FavoriteCardProps {
  favorite: {
    id: string;
    type: 'tip' | 'action';
    date: string;
    item: any; // Tip or Action object
    userItemId: string;
  };
}

export default function FavoriteCard({ favorite }: FavoriteCardProps) {
  const [isFavorited, setIsFavorited] = useState(true);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    try {
      const endpoint = favorite.type === 'action' ? '/api/actions/favorite' : '/api/tips/favorite';
      const body = favorite.type === 'action' 
        ? { actionId: favorite.item.id }
        : { tipId: favorite.item.id };
      
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
      
      // If unfavorited, remove from view after a brief delay
      if (!data.favorited) {
        setTimeout(() => {
          const card = document.getElementById(`favorite-${favorite.type}-${favorite.id}`);
          if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-20px)';
            setTimeout(() => card.remove(), 300);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite. Please try again.');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const isAction = favorite.type === 'action';
  const title = isAction ? favorite.item.name : favorite.item.title;
  const content = isAction ? favorite.item.description : favorite.item.content;
  const benefit = isAction ? favorite.item.benefit : null;

  return (
    <div
      id={`favorite-${favorite.type}-${favorite.id}`}
      className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 transition-all duration-300 border-l-4 border-yellow-500/50"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full">
              {favorite.item.category}
            </span>
            <span className="inline-block px-2 py-1 bg-yellow-500/10 text-yellow-300 text-xs font-semibold rounded-full">
              {isAction ? 'Action' : 'Tip'}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-slate-50 mb-2 flex items-center gap-2">
            {favorite.item.icon && <span>{favorite.item.icon}</span>}
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="text-xs text-slate-500 text-right">
            {format(new Date(favorite.date), 'MMM d, yyyy')}
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
      
      <div className="prose max-w-none">
        <p className="text-slate-200 leading-relaxed whitespace-pre-line mb-3">
          {content}
        </p>
        {benefit && (
          <div className="mt-4 p-4 bg-slate-800/50 border-l-4 border-primary-500/50 rounded-r-lg">
            <p className="text-xs font-semibold text-primary-300 mb-1">Why this matters:</p>
            <p className="text-slate-300 text-sm leading-relaxed">{benefit}</p>
          </div>
        )}
      </div>
    </div>
  );
}
