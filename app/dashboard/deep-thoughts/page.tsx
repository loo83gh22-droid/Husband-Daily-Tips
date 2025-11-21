import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import DeepThoughtsPost from '@/components/DeepThoughtsPost';

async function getDeepThoughts() {
  const { data: thoughts, error } = await supabase
    .from('deep_thoughts')
    .select(`
      *,
      users:user_id (name, username, wedding_date, post_anonymously),
      deep_thoughts_comments (
        *,
        users:user_id (name, username, post_anonymously)
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
              {thoughts.map((thought: any) => (
                <DeepThoughtsPost key={thought.id} thought={thought} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

