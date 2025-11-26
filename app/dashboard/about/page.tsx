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
              <p className="text-slate-300 leading-relaxed mb-4">
                I built this for myself but I see value in it for others so I&apos;m building it out. It&apos;s a work in progress that I will stay engaged with and continue to bring you more value.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                We&apos;ve all been there. Things come up, distractions, kids, and though it can be good, it&apos;s great to inject some clear intentional daily effort back into your relationship.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                I started this because I wanted to improve myself as a husband. Simple as that. I&apos;ve had trouble communicating, on big things and small things. I&apos;d get defensive when my wife tried to tell me something wasn&apos;t working. I&apos;d wait to be asked to help instead of just noticing what needed doing. I&apos;d forget to express appreciation for all the things she does every single day.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                Sound familiar? Yeah, me too.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                The thing is, I love being a husband. I love my wife. I love our family. But I realized I wasn&apos;t being the partner I wanted to be, the partner she deserved. I was coasting, assuming that showing up was enough. It&apos;s not.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                So I started looking for daily, actionable ways to be better. Not grand gestures (though those are nice). Not expensive gifts (though those are appreciated). Just small, consistent actions that show I&apos;m paying attention, that I care, that I&apos;m actually in this partnership.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                I couldn&apos;t find what I was looking for. So I built it.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                <strong className="text-slate-100">Best Husband Ever</strong> is my attempt to make being a great husband easier, more fun, and more consistent. It&apos;s daily actions, not just advice. It&apos;s gamification that actually matters. It&apos;s a way to track progress and see real improvement.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                The idea is simple: <strong className="text-slate-100">small daily actions compound into big relationship improvements.</strong> One action today. Another tomorrow. Before you know it, you&apos;re the husband you want to be, and your relationship is stronger because of it.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                This isn&apos;t about perfection. It&apos;s about progress. It&apos;s about showing up consistently. It&apos;s about making being a great husband a daily practice, not just something you think about occasionally.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                If you&apos;re here, you probably want the same thing I do: to be a better partner, to bring more joy to your marriage, and to make your family dynamic stronger. Welcome. Let&apos;s do this together.
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

