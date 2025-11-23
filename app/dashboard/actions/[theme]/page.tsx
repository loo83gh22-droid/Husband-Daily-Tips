import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import ActionsList from '@/components/ActionsList';
import Link from 'next/link';

async function getActionsByTheme(auth0Id: string, theme: string) {
  // Use admin client to bypass RLS (Auth0 context isn't set)
  const adminSupabase = getSupabaseAdmin();
  
  const { data: user } = await adminSupabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { actions: [], completedMap: {} };

  // Get all actions for this theme
  // First try to match by theme, then by category if theme doesn't match
  const { data: actions } = await adminSupabase
    .from('actions')
    .select('*')
    .eq('theme', theme)
    .order('name', { ascending: true });

  // Get user's completed actions
  const { data: completions } = await adminSupabase
    .from('user_action_completions')
    .select('id, action_id, completed_at, notes')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  // Group completions by action_id - convert to plain object for serialization
  const completedMap: Record<string, Array<{ id: string; completed_at: string; notes: string | null }>> = {};
  completions?.forEach((c) => {
    if (!completedMap[c.action_id]) {
      completedMap[c.action_id] = [];
    }
    completedMap[c.action_id].push({
      id: c.id,
      completed_at: c.completed_at,
      notes: c.notes,
    });
  });

  return {
    actions: actions || [],
    completedMap,
    userId: user.id,
  };
}

export default async function ActionsByThemePage({
  params,
}: {
  params: { theme: string };
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const { actions, completedMap, userId } = await getActionsByTheme(auth0Id, params.theme);

  // Format theme name - handle special cases
  let themeName = params.theme.charAt(0).toUpperCase() + params.theme.slice(1).replace(/_/g, ' ');
  if (params.theme === 'quality_time') {
    themeName = 'Quality Time';
  } else if (params.theme === 'conflict_resolution') {
    themeName = 'Conflict Resolution';
  }

  const themeIcon =
    params.theme === 'communication'
      ? '💬'
      : params.theme === 'intimacy'
        ? '💝'
        : params.theme === 'partnership'
          ? '🤝'
          : params.theme === 'romance'
            ? '💕'
            : params.theme === 'gratitude'
              ? '🙏'
              : params.theme === 'conflict_resolution'
                ? '⚖️'
                : params.theme === 'reconnection'
                  ? '🔗'
                  : params.theme === 'quality_time'
                    ? '⏰'
                    : '📋';

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href="/dashboard/actions"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to All Actions
            </Link>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2 flex items-center gap-3">
              <span>{themeIcon}</span>
              {themeName} Actions
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              {actions.length} action{actions.length !== 1 ? 's' : ''} available
            </p>
          </div>

          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8">
            <ActionsList
              actions={actions || []}
              completedMap={new Map(Object.entries(completedMap))}
              userId={userId}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

