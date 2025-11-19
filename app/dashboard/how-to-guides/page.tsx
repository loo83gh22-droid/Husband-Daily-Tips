import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';

export default async function HowToGuidesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  // Guide data organized by category (ordered by importance)
  const guidesByCategory = {
    'connect-better': {
      name: 'Connect Better',
      description: 'Listen, communicate, and actually be there.',
      icon: '💬',
      guides: [
        {
          slug: 'be-present-quality-time',
          title: 'Be Present During Quality Time (Actually)',
          excerpt:
            'Put the phone down. Actually listen. Be there mentally, not just physically. Learn how to give her your full attention without it feeling forced.',
          difficulty: 'Medium',
          time: 'Ongoing',
        },
        {
          slug: 'listen-without-fixing',
          title: 'Listen Without Trying to Fix Everything',
          excerpt:
            'Sometimes she just needs to vent. She doesn\'t need solutions. She needs you to listen. Learn the difference and when to just be there.',
          difficulty: 'Medium',
          time: 'Varies',
        },
        {
          slug: 'have-hard-conversation',
          title: 'Have a Hard Conversation (Without It Becoming a Fight)',
          excerpt:
            'Difficult conversations don\'t have to turn into arguments. Learn how to communicate about tough topics without defensiveness or escalation.',
          difficulty: 'Hard',
          time: '30-60 min',
        },
        {
          slug: 'ask-better-questions',
          title: 'Ask Questions That Actually Matter',
          excerpt:
            'Move beyond "how was your day?" Learn how to ask questions that show you\'re actually interested and help you understand what\'s going on with her.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'apologize-right-way',
          title: 'Apologize the Right Way (Without Excuses)',
          excerpt:
            'A real apology doesn\'t include "but" or excuses. Learn how to take responsibility, acknowledge impact, and actually make things right.',
          difficulty: 'Medium',
          time: '5-10 min',
        },
      ],
    },
    'show-up-right': {
      name: 'Show Up & Step Up (HELP!)',
      description: 'Actually help. Be a partner, not just a passenger.',
      icon: '🤝',
      guides: [
        {
          slug: 'help-hosting-party',
          title: 'Help When You\'re Hosting the Party',
          excerpt:
            'Don\'t be the husband who disappears when guests arrive. Actually help. Know what to do, when to do it, and how to make hosting easier for her.',
          difficulty: 'Easy',
          time: 'Party duration',
        },
        {
          slug: 'handle-morning-routine',
          title: 'Take Over the Morning Routine (Without Being Asked)',
          excerpt:
            'Give her a break. Handle breakfast, kids, whatever needs doing. Show up without her having to ask or manage you.',
          difficulty: 'Easy',
          time: 'Morning routine',
        },
        {
          slug: 'notice-what-needs-doing',
          title: 'Notice What Needs Doing (And Do It)',
          excerpt:
            'Stop waiting to be told. Look around. See what needs doing. Do it. This is what being a partner actually looks like.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
        {
          slug: 'help-when-shes-stressed',
          title: 'Help When She\'s Stressed (The Right Way)',
          excerpt:
            'Don\'t try to fix it. Don\'t make it about you. Actually help. Learn what she needs when she\'s overwhelmed and how to provide it.',
          difficulty: 'Medium',
          time: 'Varies',
        },
        {
          slug: 'handle-household-tasks',
          title: 'Own Household Tasks (Without Resentment)',
          excerpt:
            'Pick something and own it. Don\'t do it for credit. Don\'t do it to be thanked. Do it because it needs doing and you\'re a partner.',
          difficulty: 'Easy',
          time: 'Ongoing',
        },
      ],
    },
    'romance-that-works': {
      name: 'Romance Right',
      description: 'Dates, surprises, and making her feel special—without the cheesy stuff.',
      icon: '💕',
      guides: [
        {
          slug: 'plan-perfect-date-night',
          title: 'Plan the Perfect, No-Pressure Date Night',
          excerpt:
            'Skip the "what do you want to do?" conversation. Plan a date that actually works, doesn\'t stress her out, and shows you put thought into it.',
          difficulty: 'Easy',
          time: '30 min planning',
        },
        {
          slug: 'handle-surprise-right',
          title: 'Plan a Surprise That Doesn\'t Stress Her Out',
          excerpt:
            'Surprises can backfire if you don\'t think them through. Learn how to plan something that feels thoughtful, not overwhelming or inconvenient.',
          difficulty: 'Medium',
          time: '1-2 hours planning',
        },
        {
          slug: 'give-genuine-compliment',
          title: 'Give a Genuine Compliment That Actually Lands',
          excerpt:
            'Move beyond "you look nice." Learn how to give compliments that feel real, specific, and actually make her feel seen and appreciated.',
          difficulty: 'Easy',
          time: '30 seconds',
        },
        {
          slug: 'write-love-note',
          title: 'Write a Love Note That Doesn\'t Sound Cheesy',
          excerpt:
            'Skip the Hallmark card. Write something real that actually means something. Learn how to express yourself without it feeling forced or fake.',
          difficulty: 'Easy',
          time: '10 min',
        },
        {
          slug: 'plan-weekend-getaway',
          title: 'Plan a Weekend Getaway She\'ll Actually Enjoy',
          excerpt:
            'Not just any trip—one that she\'ll actually want to go on. Think through the details, match her energy, and make it about connection, not just a destination.',
          difficulty: 'Medium',
          time: '2-3 hours planning',
        },
      ],
    },
    'fix-it-yourself': {
      name: 'Mr. Fix It (Around the House)',
      description: 'Handle home repairs and DIY projects like a boss.',
      icon: '🔧',
      guides: [
        {
          slug: 'fix-leaky-faucet',
          title: 'Fix a Leaky Faucet Like a Pro',
          excerpt:
            'Stop that annoying drip-drip-drip. This step-by-step guide will have you fixing faucets in under 20 minutes. Your wife will notice, and you\'ll feel like a boss.',
          difficulty: 'Easy',
          time: '20 min',
        },
        {
          slug: 'organize-garage',
          title: 'Organize the Garage (Without Losing Your Mind)',
          excerpt:
            'Transform that disaster zone into a functional space. Learn the system that actually works and keeps things organized long-term.',
          difficulty: 'Medium',
          time: '2-3 hours',
        },
        {
          slug: 'build-garden-bed',
          title: 'Build a Simple Raised Garden Bed',
          excerpt:
            'Show off your skills and give your wife fresh herbs or veggies. This project looks impressive but is surprisingly straightforward.',
          difficulty: 'Medium',
          time: '3-4 hours',
        },
        {
          slug: 'install-smart-thermostat',
          title: 'Install a Smart Thermostat',
          excerpt:
            'Save money, impress your wife, and control the temperature from your phone. This upgrade pays for itself and makes you look tech-savvy.',
          difficulty: 'Medium',
          time: '1 hour',
        },
        {
          slug: 'deep-clean-oven',
          title: 'Deep Clean the Oven (The Right Way)',
          excerpt:
            'No harsh chemicals, no hours of scrubbing. The method that actually works and doesn\'t make you want to throw the oven out the window.',
          difficulty: 'Easy',
          time: '45 min',
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">
              🔧 How To Guides
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Practical guides organized by what you need. Fix things, show up right, connect better,
              and make her feel special.
            </p>
          </div>

          <div className="space-y-12">
            {Object.entries(guidesByCategory).map(([categoryKey, category]) => (
              <section key={categoryKey} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-50">{category.name}</h2>
                    <p className="text-sm text-slate-400">{category.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {category.guides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/dashboard/how-to-guides/${guide.slug}`}
                      className="block"
                    >
                      <article className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-primary-500/50 hover:bg-slate-900 transition-all cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-500">
                                {guide.difficulty} • {guide.time}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-50 mb-2">
                              {guide.title}
                            </h3>
                          </div>
                          <svg
                            className="w-4 h-4 text-slate-500 flex-shrink-0 ml-3 mt-1"
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

                        <p className="text-sm text-slate-300 leading-relaxed">{guide.excerpt}</p>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm">
              More guides coming soon. Share your own wins in Team Wins.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

