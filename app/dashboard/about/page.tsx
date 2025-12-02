import { getSession } from '@auth0/nextjs-auth0';
import DashboardNav from '@/components/DashboardNav';
import AboutContent from '@/components/AboutContent';

export default async function AboutPage() {
  const session = await getSession();
  const isLoggedIn = !!session?.user;

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
            <AboutContent isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </main>
    </div>
  );
}

