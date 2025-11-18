import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
      <nav className="bg-slate-950/80 border-b border-slate-900 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-600/10 border border-primary-500/40">
                <span className="text-sm font-semibold text-primary-400">HD</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-wide text-slate-100">
                  Husband Daily Tips
                </h1>
                <p className="text-[11px] text-slate-500">Daily structure, not pressure.</p>
              </div>
            </Link>
            <Link
              href="/api/auth/logout"
              className="px-4 py-2 text-xs md:text-sm text-slate-200 border border-slate-700 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary-300 hover:text-primary-200 text-sm font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>

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

