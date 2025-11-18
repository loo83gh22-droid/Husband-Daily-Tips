import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNav from '@/components/DashboardNav';

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
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-8">Your Tips History</h1>

          {tips.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-300">
                You haven't received any tips yet. Check back tomorrow!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tips.map((userTip: any) => {
                const tip = userTip.tips;
                if (!tip) return null;

                return (
                  <div
                    key={userTip.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 border-l-4 border-primary-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full mb-2">
                          {tip.category}
                        </span>
                        <h3 className="text-xl md:text-2xl font-semibold text-slate-50 mb-2">
                          {tip.title}
                        </h3>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(userTip.date).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                      {tip.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


