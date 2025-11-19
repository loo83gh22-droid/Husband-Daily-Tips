import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import ActionsList from '@/components/ActionsList';

async function getActions(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { actions: [], completedMap: new Map() };

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

  return {
    actions: uniqueActions,
    completedMap,
    userId: user.id,
  };
}

export default async function ActionsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const { actions, completedMap, userId } = await getActions(auth0Id);

  // Group actions by theme/category (ensure each action appears only once)
  // Use a Map to ensure uniqueness by ID
  const actionsByTheme: Record<string, Array<typeof actions[0]>> = {};
  const seenActionIds = new Set<string>();
  
  // Double-check for duplicates and group by theme
  actions.forEach((action) => {
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

  // Calculate progress for each theme
  const themeProgress: Record<string, { completed: number; total: number }> = {};
  Object.keys(actionsByTheme).forEach((theme) => {
    const themeActions = actionsByTheme[theme];
    const completed = themeActions.filter((a) => completedMap.has(a.id)).length;
    themeProgress[theme] = {
      completed,
      total: themeActions.length,
    };
  });

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

          <div className="space-y-8">
            {Object.entries(actionsByTheme).map(([theme, themeActions]) => {
              const progress = themeProgress[theme];
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
                                    : '📋'}
                      </span>
                      {themeName}
                    </h2>
                    <div className="text-sm text-slate-400">
                      <span className="text-primary-300 font-semibold">{progress.completed}</span> /{' '}
                      {progress.total} completed
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(progress.completed / progress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <ActionsList
                    actions={themeActions}
                    completedMap={completedMap}
                    userId={userId}
                  />
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

