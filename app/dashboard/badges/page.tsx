import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';

async function getUserBadges(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { badges: [], earnedMap: new Map() };

  // Get all badges - deduplicate at query level using DISTINCT
  const { data: allBadges } = await supabase
    .from('badges')
    .select('*')
    .order('badge_type', { ascending: true })
    .order('requirement_value', { ascending: true });

  // Get user's earned badges
  const { data: earnedBadges } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', user.id);

  const earnedMap = new Map(
    earnedBadges?.map((eb) => [eb.badge_id, eb.earned_at]) || [],
  );

  const badgesWithStatus = (allBadges || []).map((badge) => ({
    ...badge,
    earned_at: earnedMap.get(badge.id) || undefined,
  }));

  return { badges: badgesWithStatus, earnedMap };
}

export default async function BadgesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const { badges } = await getUserBadges(auth0Id);

  // Deduplicate badges by ID (in case of database duplicates)
  const uniqueBadges = Array.from(
    new Map(badges.map((badge) => [badge.id, badge])).values()
  );

  // Group badges by challenge theme/category
  const badgeThemes = {
    Communication: uniqueBadges.filter((b) =>
      b.name.toLowerCase().includes('communication') ||
      b.name.toLowerCase().includes('listener') ||
      b.name.toLowerCase().includes('apology') ||
      b.name.toLowerCase().includes('conflict') ||
      b.name.toLowerCase().includes('peacemaker')
    ),
    Romance: uniqueBadges.filter((b) =>
      b.name.toLowerCase().includes('romance') ||
      b.name.toLowerCase().includes('date night') ||
      b.name.toLowerCase().includes('surprise')
    ),
    Gratitude: uniqueBadges.filter((b) =>
      b.name.toLowerCase().includes('gratitude')
    ),
    Partnership: uniqueBadges.filter((b) =>
      b.name.toLowerCase().includes('partnership') ||
      b.name.toLowerCase().includes('support system') ||
      b.name.toLowerCase().includes('relationship architect')
    ),
    Intimacy: uniqueBadges.filter((b) =>
      b.name.toLowerCase().includes('intimacy') ||
      b.name.toLowerCase().includes('love language')
    ),
    Conflict: uniqueBadges.filter((b) =>
      b.name.toLowerCase().includes('conflict') ||
      b.name.toLowerCase().includes('peacemaker')
    ),
    Consistency: uniqueBadges.filter((b) => b.badge_type === 'consistency'),
  };

  const earnedCount = uniqueBadges.filter((b) => b.earned_at).length;
  const totalCount = uniqueBadges.length;

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Badges
            </h1>
            <p className="text-slate-400 text-sm md:text-base mb-4">
              Track your progress across different areas of relationship growth. Earn badges through
              consistency and meaningful actions.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">
                <span className="font-semibold text-primary-300">{earnedCount}</span> / {totalCount}{' '}
                earned
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                {Math.round((earnedCount / totalCount) * 100)}% complete
              </span>
            </div>
          </div>

          <div className="space-y-12">
            {Object.entries(badgeThemes).map(([theme, themeBadges]) => {
              if (themeBadges.length === 0) return null;

              return (
                <section key={theme} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-6 flex items-center gap-2">
                    <span>
                      {theme === 'Communication' ? '💬' : 
                       theme === 'Romance' ? '💕' : 
                       theme === 'Intimacy' ? '💝' : 
                       theme === 'Partnership' ? '🤝' : 
                       theme === 'Gratitude' ? '🙌' :
                       theme === 'Conflict' ? '⚖️' :
                       '🔥'}
                    </span>
                    {theme}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {themeBadges.map((badge) => {
                      const isEarned = !!badge.earned_at;
                      return (
                        <div
                          key={badge.id}
                          className={`p-4 rounded-lg border transition-all ${
                            isEarned
                              ? 'bg-primary-500/10 border-primary-500/30'
                              : 'bg-slate-800/30 border-slate-700/50 opacity-60'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-2">{badge.icon}</div>
                            <h3 className="text-sm font-semibold text-slate-200 mb-1">
                              {badge.name}
                            </h3>
                            <p className="text-xs text-slate-400 mb-2 leading-tight">
                              {badge.description}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs">
                              {badge.health_bonus > 0 && (
                                <span className="text-primary-300">
                                  +{badge.health_bonus} health
                                </span>
                              )}
                              {isEarned && (
                                <span className="text-green-400">✓ Earned</span>
                              )}
                            </div>
                            {badge.requirement_value && (
                              <p className="text-[10px] text-slate-500 mt-2">
                                Requires: {badge.requirement_value}{' '}
                                {badge.requirement_type === 'streak_days'
                                  ? 'days'
                                  : badge.requirement_type === 'total_actions'
                                    ? 'actions'
                                    : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

