import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

export default async function HowToGuidesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  // Sample guides - in the future these could come from a database
  const guides = [
    {
      id: 1,
      title: 'Fix a Leaky Faucet Like a Pro',
      excerpt:
        'Stop that annoying drip-drip-drip. This step-by-step guide will have you fixing faucets in under 20 minutes. Your wife will notice, and you\'ll feel like a boss.',
      category: 'Home Repair',
      difficulty: 'Easy',
      time: '20 min',
    },
    {
      id: 2,
      title: 'Organize the Garage (Without Losing Your Mind)',
      excerpt:
        'Transform that disaster zone into a functional space. Learn the system that actually works and keeps things organized long-term.',
      category: 'Organization',
      difficulty: 'Medium',
      time: '2-3 hours',
    },
    {
      id: 3,
      title: 'Build a Simple Raised Garden Bed',
      excerpt:
        'Show off your skills and give your wife fresh herbs or veggies. This project looks impressive but is surprisingly straightforward.',
      category: 'Outdoor',
      difficulty: 'Medium',
      time: '3-4 hours',
    },
    {
      id: 4,
      title: 'Deep Clean the Oven (The Right Way)',
      excerpt:
        'No harsh chemicals, no hours of scrubbing. The method that actually works and doesn\'t make you want to throw the oven out the window.',
      category: 'Cleaning',
      difficulty: 'Easy',
      time: '45 min',
    },
    {
      id: 5,
      title: 'Install a Smart Thermostat',
      excerpt:
        'Save money, impress your wife, and control the temperature from your phone. This upgrade pays for itself and makes you look tech-savvy.',
      category: 'Smart Home',
      difficulty: 'Medium',
      time: '1 hour',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">
              🔧 How To Guides
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Practical guides to help you handle things around the house. Build confidence, show
              competence, and actually get stuff done.
            </p>
          </div>

          <div className="space-y-6">
            {guides.map((guide) => (
              <article
                key={guide.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 hover:border-primary-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full">
                        {guide.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {guide.difficulty} • {guide.time}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-50 mb-2">
                      {guide.title}
                    </h2>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{guide.excerpt}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm">
              More guides coming soon. Share your own wins in Hell Yeahs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

