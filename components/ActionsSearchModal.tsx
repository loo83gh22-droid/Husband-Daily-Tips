'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Action {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: string;
  requirement_type: string | null;
  icon: string | null;
}

interface ActionsSearchModalProps {
  actions: Action[];
  onFilteredActionsChange: (filtered: Action[]) => void;
  categories: string[];
  completedActionIds?: Set<string>;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActionsSearchModal({
  actions,
  onFilteredActionsChange,
  categories,
  completedActionIds: propCompletedIds,
  isOpen,
  onClose,
}: ActionsSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [internalCompletedIds, setInternalCompletedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const finalCompletedIds = propCompletedIds || internalCompletedIds;

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fetch completed actions if not provided
  useEffect(() => {
    if (propCompletedIds) return;

    async function fetchCompleted() {
      try {
        const response = await fetch('/api/actions/completed', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setInternalCompletedIds(new Set(data.completedIds || []));
        }
      } catch (error) {
        console.error('Error fetching completed actions:', error);
      }
    }
    fetchCompleted();
  }, [propCompletedIds]);

  // Filter actions based on search, category, and completion status
  const filteredActions = useMemo(() => {
    let filtered = [...actions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (action) =>
          action.name.toLowerCase().includes(query) ||
          action.description?.toLowerCase().includes(query) ||
          action.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((action) => {
        const theme = action.theme?.toLowerCase() || action.category.toLowerCase();
        return theme === selectedCategory.toLowerCase() || action.category.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Completion filter
    if (completionFilter === 'completed') {
      filtered = filtered.filter((action) => finalCompletedIds.has(action.id));
    } else if (completionFilter === 'incomplete') {
      filtered = filtered.filter((action) => !finalCompletedIds.has(action.id));
    }

    return filtered;
  }, [actions, searchQuery, selectedCategory, completionFilter, finalCompletedIds]);

  // Update parent when filtered actions change
  useEffect(() => {
    onFilteredActionsChange(filteredActions);
  }, [filteredActions, onFilteredActionsChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      // Don't prevent default for typing in the input
      if (event.target === inputRef.current) {
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setCompletionFilter('all');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[10000]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[10001] flex items-start justify-center p-4 pt-20 pointer-events-none"
          >
            <div
              className="bg-slate-900 border-2 border-primary-500 rounded-xl p-6 max-w-2xl w-full max-h-[70vh] overflow-hidden flex flex-col pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-50">Search Actions</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-200 text-xl"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by name, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Status</label>
                  <select
                    value={completionFilter}
                    onChange={(e) => setCompletionFilter(e.target.value as 'all' | 'completed' | 'incomplete')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Actions</option>
                    <option value="completed">Completed</option>
                    <option value="incomplete">Not Completed</option>
                  </select>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setCompletionFilter('incomplete')}
                  className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                    completionFilter === 'incomplete'
                      ? 'bg-primary-500/30 border-primary-500/50 text-primary-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Incomplete Only
                </button>
                <button
                  onClick={() => setCompletionFilter('completed')}
                  className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                    completionFilter === 'completed'
                      ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Completed Only
                </button>
              </div>

              {/* Results Count */}
              <div className="mb-4 pb-4 border-b border-slate-700">
                <span className="text-xs text-slate-400">
                  Showing <span className="font-semibold text-slate-200">{filteredActions.length}</span> of {actions.length} actions
                </span>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>
                      <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Esc</kbd> to close
                    </span>
                    <span>
                      <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">Ctrl/Cmd + K</kbd> to open
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

