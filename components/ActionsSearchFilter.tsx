'use client';

import { useState, useMemo, useEffect } from 'react';

interface Action {
  id: string;
  name: string;
  description?: string;
  category: string;
  theme?: string;
  icon?: string;
}

interface ActionsSearchFilterProps {
  actions: Action[];
  onFilteredActionsChange: (filtered: Action[]) => void;
  categories: string[];
  completedActionIds?: Set<string>;
}

export default function ActionsSearchFilter({
  actions,
  onFilteredActionsChange,
  categories,
}: ActionsSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [internalCompletedIds, setInternalCompletedIds] = useState<Set<string>>(new Set());

  const finalCompletedIds = completedActionIds || internalCompletedIds;

  // Fetch completed actions if not provided
  useEffect(() => {
    if (completedActionIds) return; // Skip if provided as prop

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
  }, [completedActionIds]);

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
  useMemo(() => {
    onFilteredActionsChange(filteredActions);
  }, [filteredActions, onFilteredActionsChange]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 md:p-6 mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search actions by name, description, or category..."
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
      <div className="flex flex-wrap gap-3">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-400 mb-2">Category</label>
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

        {/* Completion Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-slate-400 mb-2">Status</label>
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

        {/* Results Count */}
        <div className="flex items-end">
          <div className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
            <span className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-200">{filteredActions.length}</span> of {actions.length} actions
            </span>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setCompletionFilter('all');
          }}
          className="px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={() => setCompletionFilter('incomplete')}
          className="px-3 py-1.5 text-xs font-medium bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded-lg hover:bg-primary-500/30 transition-colors"
        >
          Show Incomplete Only
        </button>
        <button
          onClick={() => setCompletionFilter('completed')}
          className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors"
        >
          Show Completed Only
        </button>
      </div>
    </div>
  );
}

