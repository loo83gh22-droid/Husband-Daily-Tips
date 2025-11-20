import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import ActionsList from '@/components/ActionsList';
import Link from 'next/link';

async function getActions(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { actions: [], completedMap: new Map(), favoritedActions: [] };

  // Get all actions - use distinct to avoid duplicates
  const { data: actions } = await supabase
    .from('actions')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  // Remove any duplicates by ID (in case database has duplicates)
  const uniqueActions = actions
    ? actions.filter(
        (action, index, self) =>
          index === self.findIndex((a) => a.id === action.id),
      )
    : [];

  // Get user's completed actions (all instances)
  const { data: completions } = await supabase
    .from('user_action_completions')
    .select('id, action_id, completed_at, notes')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  // Group completions by action_id
  const completedMap = new Map<string, Array<{ id: string; completed_at: string; notes: string | null }>>();
  completions?.forEach((c) => {
    if (!completedMap.has(c.action_id)) {
      completedMap.set(c.action_id, []);
    }
    completedMap.get(c.action_id)!.push({
      id: c.id,
      completed_at: c.completed_at,
      notes: c.notes,
    });
  });

  // Get favorited actions
  const { data: favoritedActionsData } = await supabase
    .from('user_daily_actions')
    .select('*, actions(*)')
    .eq('user_id', user.id)
    .eq('favorited', true)
    .order('date', { ascending: false });

  // Extract unique favorited actions (by action_id)
  const favoritedActionIds = new Set<string>();
  const favoritedActions = favoritedActionsData
    ? favoritedActionsData
        .filter((fad) => {
          const actionId = fad.actions?.id;
          if (!actionId || favoritedActionIds.has(actionId)) return false;
          favoritedActionIds.add(actionId);
          return true;
        })
        .map((fad) => ({
          ...fad.actions,
          favorited: true,
          favoritedDate: fad.date,
        }))
        .filter((action) => action !== null)
    : [];

  return {
    actions: uniqueActions,
    completedMap,
    userId: user.id,
    favoritedActions,
  };
}

export default async function ActionsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const { actions, completedMap, userId, favoritedActions } = await getActions(auth0Id);

  // Filter out favorited actions from main actions list (they'll be shown separately)
  const favoritedActionIds = new Set(favoritedActions.map((fa: any) => fa.id));
  const nonFavoritedActions = actions.filter((action) => !favoritedActionIds.has(action.id));

  // Group actions by theme/category (ensure each action appears only once)
  // Use a Map to ensure uniqueness by ID
  const actionsByTheme: Record<string, Array<typeof actions[0]>> = {};
  const seenActionIds = new Set<string>();
  
  // Double-check for duplicates and group by theme (only non-favorited actions)
  nonFavoritedActions.forEach((action) => {
    // Skip if we've already seen this action ID
    if (seenActionIds.has(action.id)) {
      console.warn(`Duplicate action detected: ${action.name} (${action.id})`);
      return;
    }
    seenActionIds.add(action.id);
    
    const theme = action.theme || action.category.toLowerCase();
    if (!actionsByTheme[theme]) {
      actionsByTheme[theme] = [];
    }
    actionsByTheme[theme].push(action);
  });
  
  // Note: Each theme section renders its own ActionsList component

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Actions
            </h1>
            <p className="text-slate-400 text-sm md:text-base mb-4">
              Track specific actions to earn badges. Complete actions to build toward your goals.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">
                <span className="font-semibold text-primary-300">
                  {Array.from(completedMap.keys()).length}
                </span>{' '}
                / {actions.length} actions completed
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                {Math.round((Array.from(completedMap.keys()).length / actions.length) * 100)}%
                complete
              </span>
            </div>
          </div>

          {/* Favorited Actions Section */}
          {favoritedActions && favoritedActions.length > 0 && (
            <section className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">⭐</span>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
                  Favorites
                </h2>
                <span className="text-sm text-slate-400">
                  ({favoritedActions.length} action{favoritedActions.length !== 1 ? 's' : ''})
                </span>
              </div>
              <ActionsList
                actions={favoritedActions}
                completedMap={completedMap}
                userId={userId}
              />
            </section>
          )}

          <div className="space-y-8">
            {Object.entries(actionsByTheme).map(([theme, themeActions]) => {
              const themeName =
                theme.charAt(0).toUpperCase() + theme.slice(1).replace(/_/g, ' ');

              return (
                <section
                  key={theme}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-slate-50 flex items-center gap-2">
                      <span>
                        {theme === 'communication'
                          ? '💬'
                          : theme === 'romance'
                            ? '💕'
                            : theme === 'gratitude'
                              ? '🙏'
                              : theme === 'partnership'
                                ? '🤝'
                                : theme === 'intimacy'
                                  ? '💝'
                                  : theme === 'conflict'
                                    ? '⚖️'
                                    : theme === 'reconnection'
                                      ? '🔗'
                                      : theme === 'quality_time'
                                        ? '⏰'
                                        : '📋'}
                      </span>
                      {themeName}
                    </h2>
                  </div>

                  <ActionsList
                    actions={themeActions.slice(0, 4)}
                    completedMap={completedMap}
                    userId={userId}
                  />

                  {themeActions.length > 4 && (
                    <div className="mt-6 text-center">
                      <Link
                        href={`/dashboard/actions/${theme}`}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500/10 border border-primary-500/30 text-primary-300 rounded-lg hover:bg-primary-500/20 transition-colors text-sm font-medium"
                      >
                        See More {themeName} Actions
                        <span className="text-xs text-slate-400">
                          ({themeActions.length - 4} more)
                        </span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

