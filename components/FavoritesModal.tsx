'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getGuideSlugForAction } from '@/lib/action-guide-mapping';
import ActionDetailModal from './ActionDetailModal';

interface FavoriteAction {
  id: string;
  name: string;
  description: string;
  category: string;
  theme?: string;
  icon?: string | null;
  benefit?: string | null;
  requirement_type?: string | null;
  favoritedDate?: string;
}

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string | null;
}

export default function FavoritesModal({ isOpen, onClose, partnerName }: FavoritesModalProps) {
  const [favorites, setFavorites] = useState<FavoriteAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<FavoriteAction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFavorites();
    }
  }, [isOpen]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/actions/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (action: FavoriteAction) => {
    setSelectedAction(action);
    setIsDetailModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-yellow-500/30 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">⭐</span>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-50">Favorites</h2>
                        <p className="text-sm text-slate-400 mt-1">
                          {isLoading ? 'Loading...' : `${favorites.length} favorited action${favorites.length !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                      aria-label="Close"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400">Loading favorites...</p>
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">⭐</span>
                      <p className="text-slate-300 text-lg mb-2">No favorites yet</p>
                      <p className="text-slate-400 text-sm">
                        Star actions you want to save for later
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {favorites.map((action) => {
                        const guideSlug = getGuideSlugForAction(action.name, action.theme);
                        return (
                          <div
                            key={action.id}
                            className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:border-yellow-500/50 transition-all cursor-pointer"
                            onClick={() => handleViewDetails(action)}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              {action.icon && <span className="text-lg">{action.icon}</span>}
                              <h3 className="text-sm font-semibold text-slate-200 flex-1">
                                {action.name}
                              </h3>
                              <span className="text-yellow-400">⭐</span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                              {action.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 bg-slate-700/50 text-[10px] text-slate-400 rounded">
                                {action.category}
                              </span>
                              {guideSlug && (
                                <Link
                                  href={`/dashboard/how-to-guides/${guideSlug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                >
                                  <span>📚</span>
                                  <span>Guide</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      {selectedAction && (
        <ActionDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAction(null);
          }}
          action={selectedAction}
          partnerName={partnerName}
          isFavorited={true}
        />
      )}
    </>
  );
}

