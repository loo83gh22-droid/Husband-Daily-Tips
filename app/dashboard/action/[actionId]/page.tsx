import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { format } from 'date-fns';

async function getAction(actionId: string) {
  const adminSupabase = getSupabaseAdmin();
  const { data: action, error } = await adminSupabase
    .from('actions')
    .select('*')
    .eq('id', actionId)
    .single();

  if (error || !action) {
    return null;
  }

  return action;
}

async function getUserActionStatus(userId: string, actionId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  // Get the most recent user_daily_actions record for this action
  const { data: dailyAction } = await adminSupabase
    .from('user_daily_actions')
    .select('id, date, completed, dnc')
    .eq('user_id', userId)
    .eq('action_id', actionId)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  return dailyAction;
}

export default async function ActionDetailPage({
  params,
}: {
  params: { actionId: string };
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const adminSupabase = getSupabaseAdmin();

  // Get user
  const { data: user } = await adminSupabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) {
    redirect('/api/auth/login');
  }

  const action = await getAction(params.actionId);

  if (!action) {
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/80 border border-red-500/50 rounded-xl p-8">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Action Not Found</h1>
              <p className="text-slate-300 mb-6">The action you're looking for doesn't exist.</p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-2 bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors font-semibold"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const userActionStatus = await getUserActionStatus(user.id, action.id);

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/dashboard" 
              className="text-sm text-slate-400 hover:text-primary-400 mb-4 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              {action.name}
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-slate-800 text-slate-300 text-sm font-medium rounded-full">
                {action.category}
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full">
                Planning Required
              </span>
              {userActionStatus?.completed && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
                  ✓ Completed
                </span>
              )}
              {userActionStatus?.dnc && (
                <span className="px-3 py-1 bg-slate-500/20 text-slate-400 text-sm font-medium rounded-full">
                  Did Not Complete
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 mb-6">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Description</h2>
            <p className="text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
              {action.description}
            </p>

            {action.benefit && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-primary-400 mb-2">
                  Why this matters:
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {action.benefit}
                </p>
              </div>
            )}

            {userActionStatus?.date && (
              <div className="text-sm text-slate-400 mb-6">
                <p>
                  <strong>Assigned:</strong>{' '}
                  {format(new Date(userActionStatus.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            )}

            {!userActionStatus?.completed && !userActionStatus?.dnc && (
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <Link
                  href={`/dashboard/complete-action?actionId=${action.id}&userId=${user.id}`}
                  className="px-6 py-3 bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors font-semibold"
                >
                  ✓ Mark as Done
                </Link>
                <Link
                  href={`/dashboard/mark-dnc?actionId=${action.id}&userId=${user.id}`}
                  className="px-6 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors font-semibold"
                >
                  ✗ Did Not Complete
                </Link>
              </div>
            )}
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              💡 About Planning Actions
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              This action requires a bit more planning and coordination. You can complete it anytime this week—pick what works for your schedule. 
              Some might need reservations, shopping, or coordinating with your partner. Plan ahead and make it happen!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

