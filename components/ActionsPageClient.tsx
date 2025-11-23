'use client';

import { useState, useMemo, useEffect } from 'react';
import ActionsList from './ActionsList';
import ActionsSearchFilter from './ActionsSearchFilter';
import FeaturedEvents from './FeaturedChallenges';
import CategoryCard from './CategoryCard';
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
}

export default function ActionsPageClient({
  allActions,
  completedMap,
  userId,
  favoritedActions,
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

  const [filteredActions, setFilteredActions] = useState<Action[]>(normalizedActions);
  
  // Update filteredActions when normalizedActions changes
  useEffect(() => {
    setFilteredActions(normalizedActions);
  }, [normalizedActions]);
  
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

  // Group filtered actions by theme
  const actionsByTheme = useMemo(() => {
    const grouped: Record<string, Action[]> = {};
    filteredActions.forEach((action) => {
      const theme = action.theme?.toLowerCase() || action.category.toLowerCase();
      if (!grouped[theme]) {
        grouped[theme] = [];
      }
      grouped[theme].push(action);
    });
    return grouped;
  }, [filteredActions]);

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

  // Filter out favorited actions from main list
  const favoritedActionIds = useMemo(() => {
    if (!favoritedActions || !Array.isArray(favoritedActions)) return new Set<string>();
    return new Set(favoritedActions.filter(fa => fa && fa.id).map((fa) => fa.id));
  }, [favoritedActions]);
  
  const nonFavoritedFiltered = useMemo(() => {
    return filteredActions.filter((action) => !favoritedActionIds.has(action.id));
  }, [filteredActions, favoritedActionIds]);

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

  // Fetch challenges for category cards
  const [challenges, setChallenges] = useState<Array<{ id: string; theme: string; name: string }>>([]);
  const [userChallenges, setUserChallenges] = useState<Array<{ challenge_id: string }>>([]);

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
          setUserChallenges(data.allChallenges || data.challenges || []);
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
        // Refresh challenges
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
          setUserChallenges(data.allChallenges || data.challenges || []);
        }
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  return (
    <>
      {/* Featured Events */}
      <FeaturedEvents />

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
              />
            );
          })}
        </div>
      </section>

      {/* Search and Filter */}
      <ActionsSearchFilter
        actions={normalizedActions}
        onFilteredActionsChange={setFilteredActions}
        categories={categories}
        completedActionIds={completedActionIds}
      />

      {/* Favorited Actions Section */}
      {favoritedActions && Array.isArray(favoritedActions) && favoritedActions.length > 0 && favoritedActions.some(fa => fa && fa.id) && (
        <section className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">⭐</span>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-50">Favorites</h2>
            <span className="text-sm text-slate-400">
              ({favoritedActions.length} action{favoritedActions.length !== 1 ? 's' : ''})
            </span>
          </div>
          <ActionsList 
            actions={favoritedActions.filter(fa => fa && fa.id)} 
            completedMap={completedMapInstance} 
            userId={userId} 
          />
        </section>
      )}

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
                  actions={themeActions.slice(0, 10)}
                  completedMap={completedMapInstance}
                  userId={userId}
                />

                {themeActions.length > 10 && (
                  <div className="mt-6 text-center">
                    <Link
                      href={`/dashboard/actions/${theme}`}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500/10 border border-primary-500/30 text-primary-300 rounded-lg hover:bg-primary-500/20 transition-colors text-sm font-medium"
                    >
                      See More {formatThemeName(theme)} Actions
                      <span className="text-xs text-slate-400">({themeActions.length - 10} more)</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
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

