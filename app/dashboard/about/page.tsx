import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';

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
                We&apos;ve all felt it, that slow drift of the months slipping by, kids need you, work needs you, and the relationship you care about most gets whatever scraps of energy survive the day. Things are still fine, but you know they could be better. More intentional. More connected.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                We started this because we wanted to become better husbands. Plain and simple. Two buddies that wanted to improve their marriage games.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                We built this for ourselves first. But as soon as we started on it, we could see how much it might help other men. So we kept going. We&apos;re still building, still refining, still committed to making it genuinely useful.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                We love being husbands. We love our wives. We love our families. But we realized we weren&apos;t consistently being the partners we believed we could be. We struggled with communication sometimes. We&apos;d get defensive. We&apos;d wait to be asked to help instead of noticing what needed doing. We&apos;d forget to acknowledge the countless things they do every single day.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                So we began looking for small, daily ways to be better. Not flashy gestures. Not expensive gifts. Just steady, meaningful actions that show care, attention, presence.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                Nothing like that existed in the way we needed it. So we created it.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                <strong className="text-slate-100">Best Husband Ever</strong> is our attempt to make showing up easier, more fun, and more consistent. It&apos;s not just advice, it&apos;s daily action. It&apos;s gamified accountability that should strengthen your relationship. It&apos;s a way to track your growth and see real progress over time.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                The idea is simple: tiny habits compound. One intentional action today, another tomorrow, and suddenly you&apos;re becoming the partner you want to be. This isn&apos;t about perfection. It&apos;s about practice. About choosing your relationship on purpose, every single day.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                And because this is a work in progress, we genuinely want your perspective. If you see a way this could be more helpful, more practical, or more meaningful, we&apos;d appreciate hearing from you.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                <Link href="/dashboard/feedback" className="text-primary-400 hover:text-primary-300 underline">
                  Give Feedback
                </Link> with us anytime with ideas, critiques, or suggestions.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                If you&apos;re here, you probably want the same thing we do, to be a better partner, to bring more joy into your marriage, and to strengthen the family you&apos;re building.
              </p>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                Let&apos;s grow together.
              </p>
              
              <p className="text-slate-400 text-sm mt-6 pt-6 border-t border-slate-800">
                — Rob & Ashish
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

