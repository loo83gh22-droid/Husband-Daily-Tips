import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';

// Helper function to get Monday of current week (ISO week start)
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

async function getOutstandingActions(userId: string) {
  const adminSupabase = getSupabaseAdmin();
  
  // Get current week's Monday
  const mondayDate = getMondayOfWeek(new Date());
  const weekStartDate = mondayDate.toISOString().split('T')[0];
  
  // Get planning actions for this week
  const { data: weeklyPlan } = await adminSupabase
    .from('user_weekly_planning_actions')
    .select('action_ids')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartDate)
    .single();

  if (!weeklyPlan?.action_ids || weeklyPlan.action_ids.length === 0) {
    return [];
  }

  // Get the actual action details
  const { data: actions } = await adminSupabase
    .from('actions')
    .select('*')
    .in('id', weeklyPlan.action_ids);

  if (!actions || actions.length === 0) {
    return [];
  }

  // Get completed actions for this week
  const weekEnd = new Date(mondayDate);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const { data: completions } = await adminSupabase
    .from('user_action_completions')
    .select('action_id')
    .eq('user_id', userId)
    .in('action_id', weeklyPlan.action_ids)
    .gte('completed_at', weekStartDate)
    .lte('completed_at', weekEndStr);

  const completedActionIds = new Set(completions?.map(c => c.action_id) || []);

  // Return actions with completion status
  return actions.map(action => ({
    ...action,
    completed: completedActionIds.has(action.id),
  }));
}

export default async function OutstandingActionsPage() {
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

  const outstandingActions = await getOutstandingActions(user.id);
  const completedCount = outstandingActions.filter(a => a.completed).length;
  const totalCount = outstandingActions.length;

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
              Outstanding Actions
            </h1>
            <p className="text-slate-400">
              Planning actions for this week. Complete them anytime that works for your schedule.
            </p>
          </div>

          {outstandingActions.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-300 mb-4">
                No planning actions for this week yet. Check back on Monday!
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-2 bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors font-semibold"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              {/* Progress Summary */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-200">This Week's Progress</h2>
                  <span className="text-sm text-slate-400">
                    {completedCount} of {totalCount} completed
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Actions List */}
              <div className="space-y-4">
                {outstandingActions.map((action) => (
                  <div
                    key={action.id}
                    className={`bg-slate-900/80 border rounded-xl p-6 ${
                      action.completed
                        ? 'border-green-500/50 bg-green-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-slate-50">
                            {action.name}
                          </h3>
                          {action.completed && (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 mb-3 leading-relaxed">
                          {action.description}
                        </p>
                        {action.benefit && (
                          <div className="bg-slate-800/50 rounded-lg p-4 mb-3">
                            <p className="text-sm font-semibold text-primary-400 mb-1">
                              Why this matters:
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {action.benefit}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-medium rounded-full">
                            {action.category}
                          </span>
                          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                            Planning Required
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-8 bg-blue-950/30 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  💡 About Planning Actions
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  These actions require a bit more planning and coordination. You can complete them anytime this week—pick what works for your schedule. 
                  Some might need reservations, shopping, or coordinating with your partner. Plan ahead and make it happen!
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

