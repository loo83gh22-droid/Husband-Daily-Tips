import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import DeepThoughtsPost from '@/components/DeepThoughtsPost';
import Link from 'next/link';

async function getUserSubscription(auth0Id: string) {
  // Use admin client to bypass RLS (Auth0 context isn't set)
  const adminSupabase = getSupabaseAdmin();
  const { data: user } = await adminSupabase
    .from('users')
    .select('subscription_tier')
    .eq('auth0_id', auth0Id)
    .single();

  return user?.subscription_tier || 'free';
}

async function getTeamWins() {
  // Use admin client to bypass RLS (Auth0 context isn't set)
  const adminSupabase = getSupabaseAdmin();
  const { data: thoughts, error } = await adminSupabase
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
    console.error('Error fetching team wins:', error);
    return [];
  }

  // Get action information for each thought via reflection -> action completion
  if (thoughts && thoughts.length > 0) {
    const reflectionIds = thoughts
      .map((t: any) => t.reflection_id)
      .filter((id: any) => id !== null);

    if (reflectionIds.length > 0) {
      // Get action completions linked to these reflections
      const { data: actionCompletions } = await adminSupabase
        .from('user_action_completions')
        .select('journal_entry_id, actions(name, icon)')
        .in('journal_entry_id', reflectionIds);

      // Map action info to thoughts
      thoughts.forEach((thought: any) => {
        const completion = actionCompletions?.find(
          (ac: any) => ac.journal_entry_id === thought.reflection_id,
        );
        if (completion) {
          thought.action = completion.actions;
        }
      });
    }
  }

  return thoughts || [];
}

export default async function TeamWinsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const subscriptionTier = await getUserSubscription(auth0Id);
  const thoughts = await getTeamWins();
  const isFree = subscriptionTier === 'free';

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Team Wins
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Real wins from husbands who are showing up. Big or small, celebrate what worked, learn from what didn't, and keep moving forward together.
            </p>
          </div>

          {isFree && (
            <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-2xl">👀</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">
                    Viewing Team Wins (Free)
                  </h3>
                  <p className="text-sm text-slate-300 mb-4">
                    You can read and get inspired by other husbands&apos; wins. To share your own wins and join the conversation, 
                    upgrade to Paid.
                  </p>
                  <Link
                    href="/dashboard/subscription"
                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors"
                  >
                    Upgrade to Share Your Wins →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {thoughts.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-12 text-center">
              <p className="text-slate-400 mb-4">No team wins yet.</p>
              <p className="text-sm text-slate-500">
                Complete an action and choose to share your win to see it here.
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
