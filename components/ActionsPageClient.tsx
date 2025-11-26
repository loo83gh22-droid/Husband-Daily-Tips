'use client';

import { useState, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ActionsList from './ActionsList';
import ActionsSearchModal from './ActionsSearchModal';
import CategoryCard from './CategoryCard';
import FavoritesModal from './FavoritesModal';
import Link from 'next/link';

interface Action {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: string;
  requirement_type: string | null;
  icon: string | null;
  display_order?: number;
}

interface ActionsPageClientProps {
  allActions: Action[];
  completedMap: Record<string, any[]> | Map<string, any[]>;
  userId: string;
  favoritedActions: Action[];
  partnerName?: string | null;
}

export default function ActionsPageClient({
  allActions,
  completedMap,
  userId,
  favoritedActions,
  partnerName,
}: ActionsPageClientProps) {
  // Scroll to category if hash is present in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        // Wait for content to render, then scroll
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Highlight the section briefly
            element.classList.add('ring-2', 'ring-primary-500', 'ring-opacity-50');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-primary-500', 'ring-opacity-50');
            }, 2000);
          }
        }, 300);
      }
    }
  }, []);
  // Ensure all actions have required fields
  const normalizedActions = useMemo(() => {
    if (!allActions || !Array.isArray(allActions)) {
      return [];
    }
    return allActions
      .filter(action => action && action.id) // Filter out any null/undefined actions
      .map((action) => ({
        ...action,
        description: action.description || '',
        theme: action.theme || action.category || 'other',
        requirement_type: action.requirement_type ?? null,
        icon: action.icon ?? null,
      }));
  }, [allActions]);

  const pathname = usePathname();
  const [filteredActions, setFilteredActions] = useState<Action[]>(normalizedActions);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  // Update filteredActions when normalizedActions changes
  useEffect(() => {
    setFilteredActions(normalizedActions);
  }, [normalizedActions]);

  // Keyboard shortcut to open search (Ctrl/Cmd + K) - only on actions page
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only work on actions page
      if (pathname !== '/dashboard/actions') return;

      // Don't trigger when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname]);
  
  // Convert completedMap to Map if it's a plain object (must be done in useMemo to avoid hydration issues)
  const completedMapInstance = useMemo(() => {
    if (!completedMap) {
      return new Map<string, any[]>();
    }
    if (completedMap instanceof Map) {
      return completedMap;
    }
    // It's a plain object, convert to Map
    const map = new Map<string, any[]>();
    if (typeof completedMap === 'object' && completedMap !== null) {
      Object.entries(completedMap).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          map.set(key, value);
        }
      });
    }
    return map;
  }, [completedMap]);
  
  // Convert Set to Array for serialization, then back to Set in state
  const completedActionIdsArray = useMemo(() => {
    return Array.from(completedMapInstance.keys());
  }, [completedMapInstance]);
  
  const [completedActionIds, setCompletedActionIds] = useState<Set<string>>(
    new Set(completedActionIdsArray)
  );
  
  // Update completedActionIds when completedMapInstance changes
  useEffect(() => {
    setCompletedActionIds(new Set(completedActionIdsArray));
  }, [completedActionIdsArray]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    normalizedActions.forEach((action) => {
      const theme = action.theme?.toLowerCase() || action.category.toLowerCase();
      cats.add(theme);
    });
    return Array.from(cats).sort();
  }, [normalizedActions]);

  // Group filtered actions by theme and randomize per category (once per page load)
  const actionsByTheme = useMemo(() => {
    const grouped: Record<string, Action[]> = {};
    filteredActions.forEach((action) => {
      const theme = action.theme?.toLowerCase() || action.category.toLowerCase();
      if (!grouped[theme]) {
        grouped[theme] = [];
      }
      grouped[theme].push(action);
    });
    
    // Randomize actions within each category (shuffle once per memoization)
    const randomized: Record<string, Action[]> = {};
    Object.keys(grouped).forEach((theme) => {
      const actions = [...grouped[theme]];
      // Fisher-Yates shuffle for randomization
      for (let i = actions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [actions[i], actions[j]] = [actions[j], actions[i]];
      }
      randomized[theme] = actions;
    });
    
    return randomized;
  }, [filteredActions]);
  
  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  
  const toggleCategory = (theme: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(theme)) {
        next.delete(theme);
      } else {
        next.add(theme);
      }
      return next;
    });
  };

  const themeOrder = [
    'communication',
    'intimacy',
    'partnership',
    'romance',
    'gratitude',
    'conflict_resolution',
    'reconnection',
    'quality_time',
  ];

  const sortedThemes = Object.keys(actionsByTheme).sort((a, b) => {
    const aIndex = themeOrder.indexOf(a);
    const bIndex = themeOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  const formatThemeName = (theme: string) => {
    if (theme === 'quality_time') return 'Quality Time';
    if (theme === 'conflict_resolution') return 'Conflict Resolution';
    return theme.charAt(0).toUpperCase() + theme.slice(1).replace(/_/g, ' ');
  };

  const getThemeIcon = (theme: string) => {
    const icons: Record<string, string> = {
      communication: '💬',
      intimacy: '💝',
      partnership: '🤝',
      romance: '💕',
      gratitude: '🙏',
      conflict_resolution: '⚖️',
      reconnection: '🔗',
      quality_time: '⏰',
    };
    return icons[theme] || '📋';
  };

  // Get favorited action IDs for star indicators
  const favoritedActionIds = useMemo(() => {
    if (!favoritedActions || !Array.isArray(favoritedActions)) return new Set<string>();
    return new Set(favoritedActions.filter(fa => fa && fa.id).map((fa) => fa.id));
  }, [favoritedActions]);
  
  // Don't filter out favorited actions - show them in their categories with stars
  const nonFavoritedFiltered = useMemo(() => {
    return filteredActions;
  }, [filteredActions]);

  // Calculate category stats for category cards
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};
    sortedThemes.forEach((theme) => {
      const themeActions = normalizedActions.filter(
        (action) => (action.theme?.toLowerCase() || action.category.toLowerCase()) === theme
      );
      const completed = themeActions.filter((action) => completedActionIds.has(action.id)).length;
      stats[theme] = { total: themeActions.length, completed };
    });
    return stats;
  }, [normalizedActions, sortedThemes, completedActionIds]);

  // Fetch challenges for category cards and category sections
  const [challenges, setChallenges] = useState<Array<{ 
    id: string; 
    theme: string; 
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    challenge_actions?: Array<{
      day_number: number;
      actions: {
        id: string;
        name: string;
        description: string;
        icon: string;
      };
    }>;
    userCompletionCount?: number;
    duration_days?: number;
  }>>([]);
  const [userChallenges, setUserChallenges] = useState<Array<{ 
    challenge_id: string;
    id: string;
    joined_date: string;
    completed_days: number;
    completed: boolean;
    progress: number;
    totalDays: number;
    remainingDays: number;
    completionCount?: number;
  }>>([]);

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const [challengesRes, userChallengesRes] = await Promise.all([
          fetch('/api/challenges/active', { credentials: 'include' }),
          fetch('/api/challenges/user', { credentials: 'include' }),
        ]);
        if (challengesRes.ok) {
          const data = await challengesRes.json();
          setChallenges(data.challenges || []);
        }
        if (userChallengesRes.ok) {
          const data = await userChallengesRes.json();
          // Transform user challenges to match expected format
          // The API returns challenges with nested 'challenges' property
          const transformed = (data.allChallenges || data.challenges || []).map((uc: any) => {
            const challenge = uc.challenges || uc.challenge;
            return {
              challenge_id: uc.challenge_id || challenge?.id || uc.id,
              id: uc.id,
              joined_date: uc.joined_date,
              completed_days: uc.completed_days || 0,
              completed: uc.completed || false,
              progress: uc.progress || 0,
              totalDays: uc.totalDays || challenge?.challenge_actions?.length || 7,
              remainingDays: uc.remainingDays || 0,
              completionCount: uc.completionCount,
            };
          });
          setUserChallenges(transformed);
        }
      } catch (error) {
        // Silently handle errors
      }
    }
    fetchChallenges();
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch('/api/challenges/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ challengeId }),
      });
      if (response.ok) {
        // Refresh challenges and user challenges
        const [challengesRes, userChallengesRes] = await Promise.all([
          fetch('/api/challenges/active', { credentials: 'include' }),
          fetch('/api/challenges/user', { credentials: 'include' }),
        ]);
        if (challengesRes.ok) {
          const data = await challengesRes.json();
          setChallenges(data.challenges || []);
        }
        if (userChallengesRes.ok) {
          const data = await userChallengesRes.json();
          // Transform user challenges to match expected format
          const transformed = (data.allChallenges || data.challenges || []).map((uc: any) => {
            const challenge = uc.challenges || uc.challenge;
            return {
              challenge_id: uc.challenge_id || challenge?.id || uc.id,
              id: uc.id,
              joined_date: uc.joined_date,
              completed_days: uc.completed_days || 0,
              completed: uc.completed || false,
              progress: uc.progress || 0,
              totalDays: uc.totalDays || challenge?.challenge_actions?.length || 7,
              remainingDays: uc.remainingDays || 0,
              completionCount: uc.completionCount,
            };
          });
          setUserChallenges(transformed);
        }
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  return (
    <>
      {/* Category Cards Grid */}
      <section className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-50 mb-4">Categories</h2>
        <p className="text-sm text-slate-400 mb-6">
          Explore actions by category. Each category has a 7-day event you can start anytime.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedThemes.map((theme) => {
            const stats = categoryStats[theme];
            const event = challenges.find((c) => c.theme === theme);
            const isEnrolled = event ? userChallenges.some((uc) => uc.challenge_id === event.id) : false;
            
            return (
              <CategoryCard
                key={theme}
                theme={theme}
                name={formatThemeName(theme)}
                icon={getThemeIcon(theme)}
                actionCount={stats?.total || 0}
                completedCount={stats?.completed || 0}
                eventId={event?.id}
                eventName={event?.name}
                isEnrolled={isEnrolled}
                onJoinEvent={handleJoinChallenge}
                challenge={event || null}
              />
            );
          })}
        </div>
      </section>

      {/* Search and Favorites Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:border-slate-600 transition-colors text-sm font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Actions
            <kbd className="ml-2 px-1.5 py-0.5 bg-slate-900 border border-slate-600 rounded text-xs font-mono text-slate-400">
              Ctrl+K
            </kbd>
          </button>
          <button
            onClick={() => setIsFavoritesModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:border-slate-600 transition-colors text-sm font-medium"
          >
            <span className="text-yellow-400">⭐</span>
            Favorites
            {favoritedActionIds.size > 0 && (
              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                {favoritedActionIds.size}
              </span>
            )}
          </button>
          {filteredActions.length !== normalizedActions.length && (
            <span className="text-sm text-slate-400">
              Showing {filteredActions.length} of {normalizedActions.length} actions
            </span>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <ActionsSearchModal
        actions={normalizedActions}
        onFilteredActionsChange={setFilteredActions}
        categories={categories}
        completedActionIds={completedActionIds}
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        partnerName={partnerName}
      />

      {/* Filtered Actions by Theme */}
      {nonFavoritedFiltered.length > 0 ? (
        <div className="space-y-8">
          {sortedThemes.map((theme) => {
            const themeActions = actionsByTheme[theme] || [];
            if (themeActions.length === 0) return null;

            return (
              <section
                key={theme}
                id={`category-${theme}`}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8 scroll-mt-24"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-50 flex items-center gap-2">
                    <span>{getThemeIcon(theme)}</span>
                    {formatThemeName(theme)}
                  </h2>
                </div>

                <ActionsList
                  actions={
                    expandedCategories.has(theme)
                      ? themeActions
                      : themeActions.slice(0, 4)
                  }
                  completedMap={completedMapInstance}
                  userId={userId}
                  favoritedActionIds={favoritedActionIds}
                  partnerName={partnerName}
                />

                {themeActions.length > 4 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => toggleCategory(theme)}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500/10 border border-primary-500/30 text-primary-300 rounded-lg hover:bg-primary-500/20 transition-colors text-sm font-medium"
                    >
                      {expandedCategories.has(theme) ? (
                        <>
                          See Less
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          See More {formatThemeName(theme)} Actions
                          <span className="text-xs text-slate-400">({themeActions.length - 4} more)</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 mb-2">No actions match your filters.</p>
          <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </>
  );
}

