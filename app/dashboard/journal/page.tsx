import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';

async function getUserReflections(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return [];

  const { data: reflections, error } = await supabase
    .from('reflections')
    .select(`
      *,
      user_tips (
        tips (title, category)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching reflections:', error);
    return [];
  }

  return reflections || [];
}

export default async function JournalPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const reflections = await getUserReflections(auth0Id);

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Your Journal
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Private reflections on your journey. These are yours alone—unless you choose to
              share them.
            </p>
          </div>

          {reflections.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center">
              <p className="text-slate-400 mb-4">No reflections yet.</p>
              <p className="text-sm text-slate-500">
                Complete an action and write a reflection to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reflections.map((reflection: any) => {
                const tip = reflection.user_tips?.tips;
                const isShared = reflection.shared_to_forum;

                return (
                  <article
                    key={reflection.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        {tip && (
                          <div className="mb-2">
                            <span className="text-xs text-slate-500">Reflection on:</span>
                            <p className="text-sm font-medium text-slate-200 mt-1">
                              {tip.title}
                            </p>
                            {tip.category && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/10 text-primary-300 text-xs rounded-full">
                                {tip.category}
                              </span>
                            )}
                          </div>
                        )}
                        <time className="text-xs text-slate-500">
                          {new Date(reflection.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                      {isShared && (
                        <span className="text-xs px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full border border-primary-500/30">
                          Shared to Deep Thoughts
                        </span>
                      )}
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                        {reflection.content}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

