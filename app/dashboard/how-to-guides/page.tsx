import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';

export default async function HowToGuidesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  // Guide data with slugs for routing
  const guides = [
    {
      slug: 'fix-leaky-faucet',
      title: 'Fix a Leaky Faucet Like a Pro',
      excerpt:
        'Stop that annoying drip-drip-drip. This step-by-step guide will have you fixing faucets in under 20 minutes. Your wife will notice, and you\'ll feel like a boss.',
      category: 'Home Repair',
      difficulty: 'Easy',
      time: '20 min',
    },
    {
      slug: 'organize-garage',
      title: 'Organize the Garage (Without Losing Your Mind)',
      excerpt:
        'Transform that disaster zone into a functional space. Learn the system that actually works and keeps things organized long-term.',
      category: 'Organization',
      difficulty: 'Medium',
      time: '2-3 hours',
    },
    {
      slug: 'build-garden-bed',
      title: 'Build a Simple Raised Garden Bed',
      excerpt:
        'Show off your skills and give your wife fresh herbs or veggies. This project looks impressive but is surprisingly straightforward.',
      category: 'Outdoor',
      difficulty: 'Medium',
      time: '3-4 hours',
    },
    {
      slug: 'deep-clean-oven',
      title: 'Deep Clean the Oven (The Right Way)',
      excerpt:
        'No harsh chemicals, no hours of scrubbing. The method that actually works and doesn\'t make you want to throw the oven out the window.',
      category: 'Cleaning',
      difficulty: 'Easy',
      time: '45 min',
    },
    {
      slug: 'install-smart-thermostat',
      title: 'Install a Smart Thermostat',
      excerpt:
        'Save money, impress your wife, and control the temperature from your phone. This upgrade pays for itself and makes you look tech-savvy.',
      category: 'Smart Home',
      difficulty: 'Medium',
      time: '1 hour',
    },
    {
      slug: 'plan-perfect-date-night',
      title: 'Plan the Perfect, No-Pressure Date Night',
      excerpt:
        'Skip the "what do you want to do?" conversation. Plan a date that actually works, doesn\'t stress her out, and shows you put thought into it.',
      category: 'Relationship',
      difficulty: 'Easy',
      time: '30 min planning',
    },
    {
      slug: 'help-hosting-party',
      title: 'Help When You\'re Hosting the Party',
      excerpt:
        'Don\'t be the husband who disappears when guests arrive. Actually help. Know what to do, when to do it, and how to make hosting easier for her.',
      category: 'Relationship',
      difficulty: 'Easy',
      time: 'Party duration',
    },
    {
      slug: 'give-genuine-compliment',
      title: 'Give a Genuine Compliment That Actually Lands',
      excerpt:
        'Move beyond "you look nice." Learn how to give compliments that feel real, specific, and actually make her feel seen and appreciated.',
      category: 'Relationship',
      difficulty: 'Easy',
      time: '30 seconds',
    },
    {
      slug: 'be-present-quality-time',
      title: 'Be Present During Quality Time (Actually)',
      excerpt:
        'Put the phone down. Actually listen. Be there mentally, not just physically. Learn how to give her your full attention without it feeling forced.',
      category: 'Relationship',
      difficulty: 'Medium',
      time: 'Ongoing',
    },
    {
      slug: 'handle-surprise-right',
      title: 'Plan a Surprise That Doesn\'t Stress Her Out',
      excerpt:
        'Surprises can backfire if you don\'t think them through. Learn how to plan something that feels thoughtful, not overwhelming or inconvenient.',
      category: 'Relationship',
      difficulty: 'Medium',
      time: '1-2 hours planning',
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
              <Link
                key={guide.slug}
                href={`/dashboard/how-to-guides/${guide.slug}`}
                className="block"
              >
                <article className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 hover:border-primary-500/50 hover:bg-slate-900 transition-all cursor-pointer">
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
                      <h2 className="text-xl md:text-2xl font-bold text-slate-50 mb-2 group-hover:text-primary-300 transition-colors">
                        {guide.title}
                      </h2>
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-500 flex-shrink-0 ml-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{guide.excerpt}</p>
                </article>
              </Link>
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

