import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import JournalEntry from '@/components/JournalEntry';
import JournalExportButton from '@/components/JournalExportButton';
import ProgressCharts from '@/components/ProgressCharts';
import CollapsibleSection from '@/components/CollapsibleSection';

async function getUserData(auth0Id: string) {
  // Use admin client to bypass RLS (Auth0 context isn't set)
  const adminSupabase = getSupabaseAdmin();
  const { data: user } = await adminSupabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { userId: null, stats: null };
  
  // Get user stats
  const { data: surveySummary } = await adminSupabase
    .from('survey_summary')
    .select('baseline_health')
    .eq('user_id', user.id)
    .single();
  
  const baselineHealth = surveySummary?.baseline_health || null;

  const { data: tips } = await adminSupabase
    .from('user_tips')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  const totalTips = tips?.length || 0;
  const uniqueDays = new Set(tips?.map((t) => t.date) || []).size;

  // Calculate current streak
  let currentStreak = 0;
  if (tips && tips.length > 0) {
    const sortedDates = Array.from(new Set(tips.map((t) => t.date))).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (sortedDates.includes(today) || sortedDates.includes(yesterdayStr)) {
      currentStreak = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = new Date(sortedDates[i]);
        const nextDate = new Date(sortedDates[i + 1]);
        const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Get health score
  const { data: healthData } = await adminSupabase
    .from('user_health_history')
    .select('health_score')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  const healthScore = healthData?.health_score || baselineHealth || 0;

  return {
    userId: user.id,
    stats: {
      totalTips,
      currentStreak,
      totalDays: uniqueDays,
      healthScore,
    },
  };
}

async function getUserReflections(auth0Id: string) {
  // Use admin client to bypass RLS (Auth0 context isn't set)
  const adminSupabase = getSupabaseAdmin();
  const { data: user } = await adminSupabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { favorites: [], regular: [] };

  // Get all reflections
  const { data: reflections, error } = await adminSupabase
    .from('reflections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  // Get tip info separately if user_tip_id exists
  if (reflections && reflections.length > 0) {
    const tipIds = reflections
      .map((r: any) => r.user_tip_id)
      .filter((id: any) => id !== null);

    if (tipIds.length > 0) {
      const { data: userTips } = await adminSupabase
        .from('user_tips')
        .select('id, tips(title, category)')
        .in('id', tipIds);

      // Map tip info to reflections
      reflections.forEach((reflection: any) => {
        const userTip = userTips?.find((ut: any) => ut.id === reflection.user_tip_id);
        reflection.user_tips = userTip;
      });
    }

    // Get action completions linked to reflections
    const reflectionIds = reflections.map((r: any) => r.id);
    const { data: actionCompletions } = await adminSupabase
      .from('user_action_completions')
      .select('journal_entry_id, actions(name, icon)')
      .in('journal_entry_id', reflectionIds);

    // Map action info to reflections
    reflections.forEach((reflection: any) => {
      const completion = actionCompletions?.find(
        (ac: any) => ac.journal_entry_id === reflection.id,
      );
      if (completion) {
        reflection.action = completion.actions;
      }
    });
  }

  if (error) {
    console.error('Error fetching reflections:', error);
    return { favorites: [], regular: [] };
  }

  // Separate favorites and regular entries, both sorted chronologically (newest first)
  // Use reflection.favorited field directly
  const favorites = (reflections || [])
    .filter((r: any) => r.favorited === true)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const regular = (reflections || [])
    .filter((r: any) => !r.favorited)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { favorites, regular };
}

export default async function JournalPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const { favorites, regular } = await getUserReflections(auth0Id);
  const allReflections = [...favorites, ...regular];
  const { userId, stats } = await getUserData(auth0Id);

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Your Journal
                </h1>
              </div>
              {allReflections.length > 0 && (
                <JournalExportButton reflections={allReflections} />
              )}
            </div>

            {/* Journal Summary */}
            <CollapsibleSection title="Journaling Can Be Hard, and It Works." defaultExpanded={true}>
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  Writing down what happened forces you to actually think about it. No shortcuts. 
                  No autopilot. Just you, being honest about what worked and what didn't. That's 
                  where the real change happens, not in doing the action, but in reflecting on it.
                </p>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  Capture the details. What did you enjoy? How did it feel? What made it work? 
                  When you write down the enjoyment and the details, you're creating a blueprint 
                  for the future. Revisit these entries later, and you can put those actions on 
                  autopilot because you remember why they mattered and how good they felt.
                </p>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  We prompt you right after you complete an action. No blank page. No "I'll do it later." 
                  Just: "How'd it go?" Write one sentence. Write ten. Or skip it. Your call. But when 
                  you write, you're building something real.
                </p>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mt-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Quick note:</strong> This journal only shows actions you completed. 
                    Skip something? It won't show up here. This is your record of wins, not misses. 
                    That's intentional.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Progress Overview Chart */}
            {userId && stats && (
              <CollapsibleSection title="Progress Overview" defaultExpanded={true}>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
                  <ProgressCharts
                    userId={userId}
                    currentStreak={stats.currentStreak}
                    healthScore={stats.healthScore}
                  />
                </div>
              </CollapsibleSection>
            )}
          </div>

          {allReflections.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center">
              <p className="text-slate-400 mb-4">No reflections yet.</p>
              <p className="text-sm text-slate-500">
                Complete an action and write a reflection to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {favorites.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <span>⭐</span>
                    <span>Favorites</span>
                  </h2>
                  <div className="space-y-6">
                    {favorites.map((reflection: any) => (
                      <JournalEntry key={reflection.id} reflection={reflection} />
                    ))}
                  </div>
                </div>
              )}

              {regular.length > 0 && (
                <div>
                  {favorites.length > 0 && (
                    <h2 className="text-lg font-semibold text-slate-200 mb-4">All Entries</h2>
                  )}
                  <div className="space-y-6">
                    {regular.map((reflection: any) => (
                      <JournalEntry key={reflection.id} reflection={reflection} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

