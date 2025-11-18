import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DailyTipCard from '@/components/DailyTipCard';
import StatsCard from '@/components/StatsCard';
import SubscriptionBanner from '@/components/SubscriptionBanner';
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
  if (!userId) return { totalTips: 0, currentStreak: 0, totalDays: 0 };

  const { data: tips, error } = await supabase
    .from('user_tips')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error || !tips) {
    return { totalTips: 0, currentStreak: 0, totalDays: 0 };
  }

  const totalTips = tips.length;
  const uniqueDays = new Set(tips.map(t => t.date)).size;

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (tips.some(t => t.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return { totalTips, currentStreak: streak, totalDays: uniqueDays };
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Husband Daily Tips</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 capitalize">
                {subscriptionTier} Plan
              </span>
              <Link
                href="/api/auth/logout"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Subscription Banner */}
        {subscriptionTier === 'free' && (
          <SubscriptionBanner />
        )}

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Current Streak"
            value={stats.currentStreak}
            subtitle="days in a row"
            icon="🔥"
          />
          <StatsCard
            title="Total Tips"
            value={stats.totalTips}
            subtitle="tips received"
            icon="💡"
          />
          <StatsCard
            title="Active Days"
            value={stats.totalDays}
            subtitle="days active"
            icon="📅"
          />
        </div>

        {/* Daily Tip Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Today's Tip</h2>
          
          {todayTip ? (
            <DailyTipCard tip={todayTip} />
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">No tips available at the moment. Please check back later!</p>
            </div>
          )}

          {/* Previous Tips Link */}
          <div className="mt-8 text-center">
            <Link
              href="/dashboard/tips"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              View All Tips →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


