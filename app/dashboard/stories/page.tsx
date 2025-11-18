import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

export default async function StoriesPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/api/auth/login');
  }

  // Sample stories - in the future these could come from a database
  const stories = [
    {
      id: 1,
      title: 'The Morning Question That Changed Everything',
      excerpt:
        'I started asking my wife "How can I make your day better today?" every morning. At first it felt awkward, but after two weeks, I noticed she was actually looking forward to it. It shifted my entire mindset from reactive to proactive.',
      category: 'Communication',
    },
    {
      id: 2,
      title: 'Taking Over the Dishes',
      excerpt:
        'My wife always did the dishes. I never thought about it. Then I read a tip about taking initiative. I started doing them without being asked. No fanfare, no expecting thanks. Just doing it. The relief on her face was worth more than any gift.',
      category: 'Partnership',
    },
    {
      id: 3,
      title: 'The Surprise Date That Wasn\'t',
      excerpt:
        'I planned this elaborate date night. Restaurant, flowers, the works. But she was exhausted. So I cancelled everything, ordered her favorite takeout, and we watched her show on the couch. Best date we\'d had in months. Sometimes less is more.',
      category: 'Romance',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-50 mb-2">
              Stories
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Real experiences from husbands who are putting in the work. Learn what worked, what
              didn&apos;t, and what they&apos;d do differently.
            </p>
          </div>

          <div className="space-y-6">
            {stories.map((story) => (
              <article
                key={story.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full mb-2">
                      {story.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-2">
                      {story.title}
                    </h2>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{story.excerpt}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm">
              More stories coming soon. Share your own experience in Deep Thoughts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

