import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';
import TipCard from '@/components/TipCard';

async function getUserTips(auth0Id: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth0_id', auth0Id)
    .single();

  if (!user) return [];

  const { data: userTips, error } = await supabase
    .from('user_tips')
    .select('*, tips(*)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(50);

  if (error || !userTips) {
    return [];
  }

  return userTips;
}

export default async function TipsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  const auth0Id = session.user.sub;
  const tips = await getUserTips(auth0Id);

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-8">Your Actions History</h1>

          {tips.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-300">
                You haven't completed any actions yet. Check back tomorrow!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tips.map((userTip: any) => {
                const tip = userTip.tips;
                if (!tip) return null;

                return (
                  <TipCard
                    key={userTip.id}
                    tip={tip}
                    userTip={userTip}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


