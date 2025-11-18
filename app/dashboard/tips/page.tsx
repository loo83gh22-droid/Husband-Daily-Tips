import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
              Husband Daily Tips
            </Link>
            <Link
              href="/api/auth/logout"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Tips History</h1>

        {tips.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">You haven't received any tips yet. Check back tomorrow!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tips.map((userTip: any) => {
              const tip = userTip.tips;
              if (!tip) return null;

              return (
                <div
                  key={userTip.id}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full mb-2">
                        {tip.category}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tip.title}</h3>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(userTip.date).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {tip.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}


