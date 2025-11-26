import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

export default async function AboutPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              About
            </h1>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-slate-200 leading-relaxed mb-4">
                I built this for myself. Then I thought, "holy shit, every husband could benefit from this."
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                So I wanted to make it available and affordable for everyone to enjoy.
              </p>
              <p className="text-slate-300 leading-relaxed">
                I enjoy doing the daily prompts. They can be an awesome reminder about the things that sometimes slip over time.
              </p>
              <p className="text-slate-400 text-sm mt-6 pt-6 border-t border-slate-800">
                — Rob
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

