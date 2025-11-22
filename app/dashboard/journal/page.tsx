import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import JournalEntry from '@/components/JournalEntry';

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

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Your Journal
            </h1>
            <p className="text-slate-400 text-sm md:text-base mb-6">
              Private reflections on your journey. Favorites appear at the top.
            </p>

            {/* Journal Summary */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-50 mb-3">
                Why Journaling Matters (And Why We Make It Easy)
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Look, journaling is hard. We get it. Sitting down to write about what happened, 
                what you learned, what surprised you—that takes effort. But here's the thing: 
                that effort is exactly why it works. When you actually reflect on what you did 
                and how it went, you start seeing patterns. You notice what works. You catch 
                yourself doing things differently. That's how real change happens.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                We make it easy by prompting you right after you complete each daily action. 
                No need to remember to journal later. No blank page staring back at you. 
                Just a simple question: "How did it go?" Write a sentence. Write a paragraph. 
                Or skip it. But when you do write, you're building something real—a record 
                of your actual journey, not just a checklist of completed tasks.
              </p>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mt-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Note:</strong> Your journal only shows actions you've completed. 
                  If you skip an action or mark it as "not for me," it won't appear here. 
                  This is your record of what you actually did, not what you didn't do. 
                  That's by design—we want you to focus on your wins, not your misses.
                </p>
              </div>
            </div>
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

