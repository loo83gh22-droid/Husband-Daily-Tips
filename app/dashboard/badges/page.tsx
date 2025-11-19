import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import { calculateBadgeProgress } from '@/lib/badges';

async function getUserStats(userId: string) {
  // Get tips for stats
  const { data: tips } = await supabase
    .from('user_tips')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  const totalTips = tips?.length || 0;
  const uniqueDays = new Set(tips?.map((t) => t.date)).size;

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (tips?.some((t) => t.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  // Get action completions for actionCounts
  const { data: actionCompletions } = await supabase
    .from('user_action_completions')
    .select('actions(requirement_type)')
    .eq('user_id', userId);

  const actionCounts: Record<string, number> = {};
  actionCompletions?.forEach((ac: any) => {
    const reqType = ac.actions?.requirement_type;
    if (reqType) {
      actionCounts[reqType] = (actionCounts[reqType] || 0) + 1;
    }
  });

  return {
    totalTips,
    currentStreak: streak,
    totalDays: uniqueDays,
    actionCounts,
  };
}

async function getUserBadges(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { badges: [], earnedMap: new Map() };

  // Get user stats for progress calculation
  const stats = await getUserStats(user.id);

  // Get all badges
  const { data: allBadges } = await supabase
    .from('badges')
    .select('*')
    .order('badge_type', { ascending: true })
    .order('requirement_value', { ascending: true });

  // Deduplicate badges by name + requirement_type + requirement_value
  // Keep the one with the lowest ID (oldest badge)
  const badgeKeyMap = new Map<string, any>();
  (allBadges || []).forEach((badge) => {
    const key = `${badge.name}-${badge.requirement_type}-${badge.requirement_value || ''}`;
    const existing = badgeKeyMap.get(key);
    if (!existing || badge.id < existing.id) {
      badgeKeyMap.set(key, badge);
    }
  });

  const uniqueBadges = Array.from(badgeKeyMap.values());

  // Get user's earned badges
  const { data: earnedBadges } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', user.id);

  const earnedMap = new Map(
    earnedBadges?.map((eb) => [eb.badge_id, eb.earned_at]) || [],
  );

  // Calculate progress for each badge and combine with earned status
  const badgesWithProgress = await Promise.all(
    uniqueBadges.map(async (badge) => {
      const earned_at = earnedMap.get(badge.id);
      let progress = null;

      // Only calculate progress for unearned badges
      if (!earned_at) {
        progress = await calculateBadgeProgress(supabase, user.id, badge, stats);
      }

      return {
        ...badge,
        earned_at: earned_at || undefined,
        progress,
      };
    }),
  );

  return { badges: badgesWithProgress, earnedMap };
}

export default async function BadgesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const { badges } = await getUserBadges(auth0Id);

  // Group badges by action theme/category
  const badgeThemes = {
    Communication: badges.filter((b) =>
      b.name.toLowerCase().includes('communication') ||
      b.name.toLowerCase().includes('listener') ||
      b.name.toLowerCase().includes('apology') ||
      b.name.toLowerCase().includes('conflict') ||
      b.name.toLowerCase().includes('peacemaker')
    ),
    Romance: badges.filter((b) =>
      b.name.toLowerCase().includes('romance') ||
      b.name.toLowerCase().includes('date night') ||
      b.name.toLowerCase().includes('surprise')
    ),
    Gratitude: badges.filter((b) =>
      b.name.toLowerCase().includes('gratitude')
    ),
    Partnership: badges.filter((b) =>
      b.name.toLowerCase().includes('partnership') ||
      b.name.toLowerCase().includes('support system') ||
      b.name.toLowerCase().includes('relationship architect')
    ),
    Intimacy: badges.filter((b) =>
      b.name.toLowerCase().includes('intimacy') ||
      b.name.toLowerCase().includes('love language')
    ),
    Conflict: badges.filter((b) =>
      b.name.toLowerCase().includes('conflict') ||
      b.name.toLowerCase().includes('peacemaker')
    ),
    Consistency: badges.filter((b) => b.badge_type === 'consistency'),
  };

  const earnedCount = badges.filter((b) => b.earned_at).length;
  const totalCount = badges.length;

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
                      const progress = badge.progress;
                      const showProgress = !isEarned && progress && progress.target > 0;

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
                            <div className={`text-4xl mb-2 ${isEarned ? '' : 'grayscale opacity-50'}`}>
                              {badge.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-slate-200 mb-1">
                              {badge.name}
                            </h3>
                            <p className="text-xs text-slate-400 mb-2 leading-tight">
                              {badge.description}
                            </p>
                            
                            {/* Progress indicator */}
                            {showProgress && (
                              <div className="mb-2">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                  <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden max-w-[120px]">
                                    <div
                                      className="bg-primary-500 h-full rounded-full transition-all"
                                      style={{ width: `${progress.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                    {progress.current}/{progress.target}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500">
                                  {progress.percentage}% complete
                                </p>
                              </div>
                            )}

                            <div className="flex flex-col items-center gap-1 text-xs">
                              {badge.health_bonus > 0 && (
                                <span className="text-primary-300">
                                  +{badge.health_bonus} health
                                </span>
                              )}
                              {isEarned && (
                                <span className="text-green-400 font-medium">✓ Earned</span>
                              )}
                            </div>
                            
                            {/* Requirement info - only show if not earned and no progress */}
                            {!isEarned && !showProgress && badge.requirement_value && (
                              <p className="text-[10px] text-slate-500 mt-2">
                                Requires: {badge.requirement_value}{' '}
                                {badge.requirement_type === 'streak_days'
                                  ? 'days'
                                  : badge.requirement_type === 'total_actions'
                                    ? 'actions'
                                    : badge.requirement_type === 'category_count'
                                      ? 'in category'
                                      : badge.requirement_type?.replace('_', ' ') || ''}
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

