import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DailyTipCard from '@/components/DailyTipCard';
import StatsCard from '@/components/StatsCard';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import HealthBar from '@/components/HealthBar';
import BadgesDisplay from '@/components/BadgesDisplay';
import DashboardNav from '@/components/DashboardNav';
import CalendarExport from '@/components/CalendarExport';
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
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday

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

  // Check for recurring tips due today (e.g., weekly check-in)
  const { data: recurringTips } = await supabase
    .from('tips')
    .select('*')
    .eq('is_recurring', true)
    .eq('recurrence_type', 'weekly')
    .eq('recurrence_day', dayOfWeek);

  if (recurringTips && recurringTips.length > 0) {
    // Check if already completed this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    for (const recurringTip of recurringTips) {
      const { data: completion } = await supabase
        .from('recurring_tip_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('tip_id', recurringTip.id)
        .gte('scheduled_date', weekStart.toISOString().split('T')[0])
        .eq('completed', true)
        .single();

      // If not completed this week, this is today's tip
      if (!completion) {
        // Schedule it
        await supabase.from('recurring_tip_completions').upsert({
          user_id: userId,
          tip_id: recurringTip.id,
          scheduled_date: today,
          completed: false,
        });

        // Save to user_tips
        await supabase.from('user_tips').insert({
          user_id: userId,
          tip_id: recurringTip.id,
          date: today,
        });

        return recurringTip;
      }
    }
  }

  // Get a random tip - all tips accessible during testing
  const { data: tips, error } = await supabase
    .from('tips')
    .select('*')
    .eq('is_recurring', false) // Don't show recurring tips as random tips
    .limit(100);

  if (error || !tips || tips.length === 0) {
    // Fallback: get any tip if no non-recurring tips
    const { data: allTips } = await supabase.from('tips').select('*').limit(100);
    if (!allTips || allTips.length === 0) {
      return null;
    }
    const randomTip = allTips[Math.floor(Math.random() * allTips.length)];

    await supabase.from('user_tips').insert({
      user_id: userId,
      tip_id: randomTip.id,
      date: today,
    });

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

  // Get last action date for decay
  const lastActionDate = tips.length > 0 ? tips[0].date : undefined;

  // Get badge bonuses
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badges(health_bonus)')
    .eq('user_id', userId);

  const totalBadgeBonuses =
    userBadges?.reduce((sum: number, ub: any) => sum + (ub.badges?.health_bonus || 0), 0) || 0;

  // Calculate health with decay using the new formula
  const { calculateHealthScore } = await import('@/lib/health');
  const healthScore = calculateHealthScore(
    {
      totalTips,
      currentStreak: streak,
      totalDays: uniqueDays,
      lastActionDate,
    },
    totalBadgeBonuses,
  );

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
  // Remove tier restrictions - all tips accessible to all users during testing
  const todayTip = await getTodayTip(user.id, 'premium'); // Use premium to get better tips
  const stats = await getUserStats(user.id);

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

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

            <BadgesDisplay userId={user.id} />

            <CalendarExport />

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


