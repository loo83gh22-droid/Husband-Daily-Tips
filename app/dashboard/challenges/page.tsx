import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import ChallengesList from '@/components/ChallengesList';

async function getChallenges(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return { challenges: [], completedMap: new Map() };

  // Get all challenges
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  // Get user's completed challenges (all instances)
  const { data: completions } = await supabase
    .from('user_challenge_completions')
    .select('id, challenge_id, completed_at, notes')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  // Group completions by challenge_id
  const completedMap = new Map<string, Array<{ id: string; completed_at: string; notes: string | null }>>();
  completions?.forEach((c) => {
    if (!completedMap.has(c.challenge_id)) {
      completedMap.set(c.challenge_id, []);
    }
    completedMap.get(c.challenge_id)!.push({
      id: c.id,
      completed_at: c.completed_at,
      notes: c.notes,
    });
  });

  return {
    challenges: challenges || [],
    completedMap,
    userId: user.id,
  };
}

export default async function ChallengesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const { challenges, completedMap, userId } = await getChallenges(auth0Id);

  // Group challenges by theme/category
  const challengesByTheme: Record<string, Array<typeof challenges[0]>> = {};
  challenges.forEach((challenge) => {
    const theme = challenge.theme || challenge.category.toLowerCase();
    if (!challengesByTheme[theme]) {
      challengesByTheme[theme] = [];
    }
    challengesByTheme[theme].push(challenge);
  });

  // Calculate progress for each theme
  const themeProgress: Record<string, { completed: number; total: number }> = {};
  Object.keys(challengesByTheme).forEach((theme) => {
    const themeChallenges = challengesByTheme[theme];
    const completed = themeChallenges.filter((c) => completedMap.has(c.id)).length;
    themeProgress[theme] = {
      completed,
      total: themeChallenges.length,
    };
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Challenges
            </h1>
            <p className="text-slate-400 text-sm md:text-base mb-4">
              Track specific actions to earn badges. Complete challenges to build toward your goals.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">
                <span className="font-semibold text-primary-300">
                  {Array.from(completedMap.keys()).length}
                </span>{' '}
                / {challenges.length} challenges completed
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                {Math.round((Array.from(completedMap.keys()).length / challenges.length) * 100)}%
                complete
              </span>
            </div>
          </div>

          <div className="space-y-8">
            {Object.entries(challengesByTheme).map(([theme, themeChallenges]) => {
              const progress = themeProgress[theme];
              const themeName =
                theme.charAt(0).toUpperCase() + theme.slice(1).replace(/_/g, ' ');

              return (
                <section
                  key={theme}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-slate-50 flex items-center gap-2">
                      <span>
                        {theme === 'communication'
                          ? '💬'
                          : theme === 'romance'
                            ? '💕'
                            : theme === 'gratitude'
                              ? '🙏'
                              : theme === 'partnership'
                                ? '🤝'
                                : theme === 'intimacy'
                                  ? '💝'
                                  : theme === 'conflict'
                                    ? '⚖️'
                                    : '📋'}
                      </span>
                      {themeName}
                    </h2>
                    <div className="text-sm text-slate-400">
                      <span className="text-primary-300 font-semibold">{progress.completed}</span> /{' '}
                      {progress.total} completed
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(progress.completed / progress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <ChallengesList
                    challenges={themeChallenges}
                    completedMap={completedMap}
                    userId={userId}
                  />
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

