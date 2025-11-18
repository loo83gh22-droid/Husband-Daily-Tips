import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';

async function getDeepThoughts() {
  const { data: thoughts, error } = await supabase
    .from('deep_thoughts')
    .select(`
      *,
      users:user_id (name, email),
      deep_thoughts_comments (
        *,
        users:user_id (name, email)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching deep thoughts:', error);
    return [];
  }

  return thoughts || [];
}

export default async function DeepThoughtsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const thoughts = await getDeepThoughts();

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Deep Thoughts
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Real reflections from husbands who are putting in the work. Learn from their
              experiences, share your own, and build something better together.
            </p>
          </div>

          {thoughts.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center">
              <p className="text-slate-400 mb-4">No shared reflections yet.</p>
              <p className="text-sm text-slate-500">
                Complete an action and choose to share your reflection to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {thoughts.map((thought: any) => {
                const user = thought.users;
                const displayName = user?.name || user?.email?.split('@')[0] || 'Anonymous';

                return (
                  <article
                    key={thought.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-slate-500">From</span>
                          <span className="text-sm font-medium text-slate-200">{displayName}</span>
                          {thought.tip_category && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-400 capitalize">
                                {thought.tip_category}
                              </span>
                            </>
                          )}
                        </div>
                        <time className="text-xs text-slate-500">
                          {new Date(thought.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                        {thought.content}
                      </p>
                    </div>

                    {thought.deep_thoughts_comments &&
                      thought.deep_thoughts_comments.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-800">
                          <p className="text-xs text-slate-400 mb-3">
                            {thought.deep_thoughts_comments.length} comment
                            {thought.deep_thoughts_comments.length !== 1 ? 's' : ''}
                          </p>
                          <div className="space-y-4">
                            {thought.deep_thoughts_comments.map((comment: any) => {
                              const commentUser = comment.users;
                              const commentName =
                                commentUser?.name ||
                                commentUser?.email?.split('@')[0] ||
                                'Anonymous';

                              return (
                                <div
                                  key={comment.id}
                                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-medium text-slate-300">
                                      {commentName}
                                    </span>
                                    <time className="text-xs text-slate-500">
                                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </time>
                                  </div>
                                  <p className="text-sm text-slate-300 leading-relaxed">
                                    {comment.content}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
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

