import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DailyTipCard from '@/components/DailyTipCard';
import StatsCard from '@/components/StatsCard';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import HealthBar from '@/components/HealthBar';
import Link from 'next/link';

async function getUserData(auth0Id: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*, subscription_tier')
    .eq('auth0_id', auth0Id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
  }

  return user;
}

async function getTodayTip(userId: string | null, subscriptionTier: string) {
  if (!userId) return null;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Check if user has already seen today's tip
  const { data: existingTip } = await supabase
    .from('user_tips')
    .select('*, tips(*)')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (existingTip) {
    return existingTip.tips;
  }

  // Get a random tip based on subscription tier
  const { data: tips, error } = await supabase
    .from('tips')
    .select('*')
    .eq('tier', subscriptionTier)
    .limit(100);

  if (error || !tips || tips.length === 0) {
    // Fallback to free tier tips
    const { data: freeTips } = await supabase
      .from('tips')
      .select('*')
      .eq('tier', 'free')
      .limit(100);

    if (!freeTips || freeTips.length === 0) {
      return null;
    }

    const randomTip = freeTips[Math.floor(Math.random() * freeTips.length)];
    
    // Save to user_tips
    if (userId) {
      await supabase.from('user_tips').insert({
        user_id: userId,
        tip_id: randomTip.id,
        date: today,
      });
    }

    return randomTip;
  }

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  // Save to user_tips
  if (userId) {
    await supabase.from('user_tips').insert({
      user_id: userId,
      tip_id: randomTip.id,
      date: today,
    });
  }

  return randomTip;
}

async function getUserStats(userId: string | null) {
  if (!userId) {
    return {
      totalTips: 0,
      currentStreak: 0,
      totalDays: 0,
      healthScore: 0,
    };
  }

  const { data: tips, error } = await supabase
    .from('user_tips')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error || !tips) {
    return {
      totalTips: 0,
      currentStreak: 0,
      totalDays: 0,
      healthScore: 0,
    };
  }

  const totalTips = tips.length;
  const uniqueDays = new Set(tips.map((t) => t.date)).size;

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (tips.some((t) => t.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  /**
   * Derive a simple health score:
   * - Strong streaks are rewarded heavily
   * - Total tips give a slower, long-term boost
   * - Capped between 0 and 100
   */
  const baseFromStreak = Math.min(streak * 8, 70); // up to 70% from consistency
  const fromHistory = Math.min(totalTips * 2, 30); // up to 30% from history
  const healthScore = Math.max(0, Math.min(100, baseFromStreak + fromHistory));

  return { totalTips, currentStreak: streak, totalDays: uniqueDays, healthScore };
}

export default async function Dashboard() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  
  // Get or create user
  let user = await getUserData(auth0Id);
  
  if (!user) {
    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        auth0_id: auth0Id,
        email: session.user.email,
        name: session.user.name || session.user.email,
        subscription_tier: 'free',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      redirect('/api/auth/logout');
    }

    user = newUser;
  }

  const subscriptionTier = user.subscription_tier || 'free';
  const todayTip = await getTodayTip(user.id, subscriptionTier);
  const stats = await getUserStats(user.id);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="bg-slate-950/80 border-b border-slate-900 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-600/10 border border-primary-500/40">
                <span className="text-sm font-semibold text-primary-400">HD</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-wide text-slate-100">
                  Husband Daily Tips
                </h1>
                <p className="text-[11px] text-slate-500">
                  Daily structure, not pressure.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 capitalize hidden md:inline">
                {subscriptionTier} plan
              </span>
              <Link
                href="/api/auth/logout"
                className="px-4 py-2 text-xs md:text-sm text-slate-200 border border-slate-700 rounded-lg hover:bg-slate-900 transition-colors"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 md:py-10">
        {/* Subscription Banner */}
        {subscriptionTier === 'free' && (
          <SubscriptionBanner />
        )}

        <div className="grid lg:grid-cols-[1.4fr,1fr] gap-8 md:gap-10 items-start">
          {/* Left column: Daily tip + health bar */}
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-50">
                  Today&apos;s action
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  One concrete step to move your marriage in the right direction.
                </p>
              </div>
              <div className="hidden md:flex flex-col items-end text-xs text-slate-400">
                <span>Logged in as</span>
                <span className="text-slate-200 font-medium truncate max-w-[160px]">
                  {user.email}
                </span>
              </div>
            </div>

            {todayTip ? (
              <DailyTipCard tip={todayTip} />
            ) : (
              <div className="bg-slate-900/80 rounded-xl shadow-lg p-8 text-center border border-slate-800">
                <p className="text-slate-300">
                  No tips available at the moment. Please check back later.
                </p>
              </div>
            )}

            {/* Previous Tips Link */}
            <div className="mt-6 text-center">
              <Link
                href="/dashboard/tips"
                className="text-primary-300 hover:text-primary-200 text-sm font-semibold"
              >
                View your previous actions →
              </Link>
            </div>
          </div>

          {/* Right column: Health bar + stats */}
          <div className="space-y-5">
            <HealthBar value={stats.healthScore} />

            <div className="grid md:grid-cols-3 gap-4">
              <StatsCard
                title="Current streak"
                value={stats.currentStreak}
                subtitle="days in a row"
                icon="🔥"
              />
              <StatsCard
                title="Total actions"
                value={stats.totalTips}
                subtitle="completed so far"
                icon="📈"
              />
              <StatsCard
                title="Active days"
                value={stats.totalDays}
                subtitle="days you showed up"
                icon="📅"
              />
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-300 mb-1 font-medium">
                How your health works
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your bar climbs when you follow through on daily actions and make intentional
                &quot;big husband&quot; moves. It slowly drains when you disappear. It&apos;s not a score
                for your wife—it&apos;s an honest dashboard for you.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


