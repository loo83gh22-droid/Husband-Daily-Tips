import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import JournalEntry from '@/components/JournalEntry';
import JournalExportButton from '@/components/JournalExportButton';
import ProgressCharts from '@/components/ProgressCharts';
import CollapsibleSection from '@/components/CollapsibleSection';
import BackToTop from '@/components/BackToTop';
import Link from 'next/link';

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
      .select('journal_entry_id, completed_at, actions(name, icon)')
      .in('journal_entry_id', reflectionIds);

    // Map action info and completion date to reflections
    reflections.forEach((reflection: any) => {
      const completion = actionCompletions?.find(
        (ac: any) => ac.journal_entry_id === reflection.id,
      );
      if (completion) {
        reflection.action = completion.actions;
        reflection.completed_at = completion.completed_at || reflection.created_at;
      } else {
        // If no completion date, use reflection created_at
        reflection.completed_at = reflection.created_at;
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

async function getUserSubscriptionStatus(auth0Id: string) {
  const adminSupabase = getSupabaseAdmin();
  const { data: user } = await adminSupabase
    .from('users')
    .select('subscription_tier, trial_started_at, trial_ends_at, stripe_subscription_id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) {
    return {
      tier: 'free' as const,
      hasActiveTrial: false,
      hasSubscription: false,
      isOnPremium: false,
    };
  }

  const trialEndsAt = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const now = new Date();
  const hasActiveTrial = user?.subscription_tier === 'premium' && 
                        trialEndsAt && 
                        trialEndsAt > now && 
                        !user?.stripe_subscription_id;
  const hasSubscription = !!user?.stripe_subscription_id;
  const isOnPremium = user?.subscription_tier === 'premium' && hasSubscription;

  return {
    tier: (user?.subscription_tier || 'free') as 'free' | 'premium',
    hasActiveTrial,
    hasSubscription,
    isOnPremium,
  };
}

export default async function JournalPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const subscriptionStatus = await getUserSubscriptionStatus(auth0Id);
  
  // Check if user has premium access
  const hasPremiumAccess = subscriptionStatus.isOnPremium || subscriptionStatus.hasActiveTrial;
  
  // If free user, show upgrade message instead of journal
  if (!hasPremiumAccess) {
    return (
      <div className="min-h-screen bg-slate-950">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8 md:py-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
              <div className="mb-6">
                <span className="text-6xl mb-4 block">📔</span>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Journal Access
                </h1>
                <p className="text-lg text-slate-300 mb-2">
                  Journaling is a Premium feature
                </p>
                <p className="text-sm text-slate-400 mb-8">
                  Upgrade to Premium to access your journal, track your reflections, and build a record of your relationship wins.
                </p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">What you get with Premium:</h2>
                <ul className="text-left space-y-3 text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-primary-400 mt-1">✓</span>
                    <span>Full journal access to reflect on your actions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-400 mt-1">✓</span>
                    <span>Complete any action from the Actions page</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-400 mt-1">✓</span>
                    <span>Daily personalized actions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary-400 mt-1">✓</span>
                    <span>Progress tracking and analytics</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard/subscription"
                className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Upgrade to Premium
              </Link>
              
              <p className="text-xs text-slate-500 mt-6">
                Free users can still complete the daily action served on the dashboard
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                  Your Journal
                </h1>
              </div>
              {allReflections.length > 0 && (
                <JournalExportButton reflections={allReflections} />
              )}
            </div>

            {/* Journal Summary and Progress Overview - Side by Side */}
            <div className="grid md:grid-cols-2 gap-4 mb-6 md:items-start">
              <div className="flex flex-col h-full">
                <CollapsibleSection title="Journaling Can Be Hard, and It Works." defaultExpanded={true}>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 leading-relaxed mb-2">
                        Writing it down makes you actually think. No shortcuts, no autopilot—just an honest look at what worked and what didn't. That's where the real growth hides.
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed mb-2">
                        Note what you enjoyed, what clicked, what felt good. Those details become a blueprint you can return to later, a reminder of why the action mattered in the first place.
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed mb-3">
                        After each action you'll get a simple prompt: How'd it go? Write a sentence, write a paragraph, or skip it. Your choice. But every time you reflect, you're building something real and repeatable.
                      </p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 mt-auto">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Quick note:</strong> This journal only shows actions you completed. 
                        Skip something? It won't show up here. This is your record of wins, not misses. 
                        That's intentional.
                      </p>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>

              {/* Progress Overview Chart */}
              {userId && stats && (
                <div className="flex flex-col h-full">
                  <CollapsibleSection title="Progress Overview" defaultExpanded={true}>
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 h-full flex flex-col">
                      <div className="flex-1 min-h-0">
                        <ProgressCharts
                          userId={userId}
                          currentStreak={stats.currentStreak}
                          healthScore={stats.healthScore}
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              )}
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
            <div className="space-y-3">
              {favorites.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <span>⭐</span>
                    <span>Favorites</span>
                  </h2>
                  <div className="space-y-3">
                    {favorites.map((reflection: any) => (
                      <JournalEntry key={reflection.id} reflection={reflection} />
                    ))}
                  </div>
                </div>
              )}

              {regular.length > 0 && (
                <div>
                  {favorites.length > 0 && (
                    <h2 className="text-base font-semibold text-slate-200 mb-3">All Entries</h2>
                  )}
                  <div className="space-y-3">
                    {regular.map((reflection: any) => (
                      <JournalEntry key={reflection.id} reflection={reflection} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <BackToTop />
      </main>
    </div>
  );
}

