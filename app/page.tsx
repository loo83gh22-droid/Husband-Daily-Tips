import Link from 'next/link';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { getMarketingMessage } from '@/lib/marketing-messages';
import ReferralCodeHandler from '@/components/ReferralCodeHandler';

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  // Get a random pricing message for the landing page
  let pricingMessage = null;
  try {
    pricingMessage = await getMarketingMessage('pricing', 'landing_page');
  } catch (error) {
    // Silently fail if marketing messages aren't available yet (migration not run)
    console.error('Error fetching marketing message:', error);
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Suspense fallback={null}>
        <ReferralCodeHandler />
      </Suspense>
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <BrandLogo variant="nav" showTagline={false} />

          <div className="flex items-center gap-3">
            <Link
              href="#how-it-works"
              className="hidden md:inline-flex text-sm text-slate-300 hover:text-white transition-colors"
            >
              How it works
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/survey"
                className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Take Survey
              </Link>
              <Link
                href="/api/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/api/auth/login"
                className="px-4 py-2 text-sm font-semibold bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[3fr,2fr] gap-12 items-start">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-primary-400 uppercase mb-4">
              STOP WINGING IT. START WINNING IT.
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 tracking-tight mb-4">
              Your daily action, delivered.
              <span className="block text-primary-400">one step at a time.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-400 font-semibold mb-4 max-w-2xl">
              Daily actions that show you care. She&apos;ll notice. You&apos;ll both feel the difference.
            </p>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-4 max-w-2xl">
              Marriage is hard. You know it, we know it. But here&apos;s the thing, it doesn&apos;t have to be complicated. 
              One small action a day. One moment where you actually show up. No grand gestures needed. 
              Just consistent, real effort. Become the husband you and your partner deserve.
            </p>
            <p className="text-sm md:text-base text-slate-400 italic mb-8 max-w-2xl">
              Designed for husbands, but it&apos;s not <span className="text-primary-400 font-semibold not-italic">just</span> for husbands. 
              Boyfriends, partners, and anyone committed to leveling up their relationship can benefit.
            </p>

            <div className="mb-8">
              <Link
                href="/survey"
                className="inline-flex items-center justify-center px-10 py-5 rounded-xl bg-primary-500 text-slate-950 text-lg font-bold shadow-2xl shadow-primary-500/30 hover:bg-primary-400 transition-all transform hover:scale-105"
              >
                Get Your Husband Score →
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link
                href="/api/auth/login"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-slate-700 text-sm font-semibold text-slate-100 hover:bg-slate-900 transition-colors"
              >
                Sign Up / Sign In
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>5 minutes a day. Seriously.</span>
              </div>
              <span className="hidden md:inline text-slate-700">•</span>
              <span>For guys who are tired of winging it and ready to actually figure this out.</span>
            </div>
          </div>

          {/* Hero Right: Husband Health Preview */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-7 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">
                  RELATIONSHIP HEALTH BAR
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Your honest, no-BS relationship meter. It tells you what you need to hear.
                </p>
              </div>
              <span className="text-xl">❤️</span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Today</span>
                <span>Strong</span>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500"
                  style={{ width: '78%' }}
                />
              </div>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Daily actions keep your health bar full.
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-yellow-400" />
                Miss days in a row and it slowly drains.
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
                Big husband moments give visible health boosts.
              </li>
            </ul>

            <p className="mt-4 text-[11px] text-slate-500">
              This isn&apos;t about checking boxes. It&apos;s about being honest with yourself 
              about whether you&apos;re actually showing up or just going through the motions.
            </p>
          </div>
        </div>

        {/* Distraction Message Section */}
        <section className="mt-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-primary-500/10 via-slate-900/60 to-primary-500/10 border border-primary-500/20 rounded-2xl p-8 md:p-10 text-center">
              <p className="text-lg md:text-xl text-slate-200 leading-relaxed max-w-3xl mx-auto">
                Look at your phone. Now look at your marriage. Now back to your phone. 
                <span className="text-primary-400 font-semibold"> Your phone is still a phone. But your marriage? That can be legendary.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="how-it-works"
          className="mt-24 border-t border-slate-800 pt-12"
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-50">
                How it works
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">
                SIMPLE, PRACTICAL, REPEATABLE
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-primary-300 mb-2 uppercase tracking-[0.2em]">
                  01. Daily Action
                </p>
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                  One clear thing to do today
                </h3>
                <p className="text-sm text-slate-300">
                  No vague advice. No &quot;communicate better&quot; nonsense. Just one specific thing you can do 
                  right now that actually makes a difference. Takes 5 minutes. No excuses. 
                  <span className="text-primary-400 font-semibold"> You&apos;re welcome.</span>
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-primary-300 mb-2 uppercase tracking-[0.2em]">
                  02. Husband Health
                </p>
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                  See your consistency at a glance
                </h3>
                <p className="text-sm text-slate-300">
                  When you show up, it goes up. When you don&apos;t, it goes down. Simple. 
                  No judgment, just truth. It&apos;s the accountability partner you didn&apos;t know you needed.
                  <span className="text-primary-400 font-semibold"> And it never lies.</span>
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-primary-300 mb-2 uppercase tracking-[0.2em]">
                  03. Track & Reflect
                </p>
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                  Journal your journey, share your wins
                </h3>
                <p className="text-sm text-slate-300">
                  Write down what actually happened. What worked. What didn&apos;t. What surprised you. 
                  Keep it private, or share your wins with other guys who get it. Real talk from real husbands.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Actions & Badges Section */}
        <section className="mt-24 border-t border-slate-800 pt-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-50">
                Actions & Badges
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">
                GAMIFIED GROWTH
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🎯</span>
                  <h3 className="text-xl font-semibold text-slate-50">
                    Daily Actions
                  </h3>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Every morning, you get one thing to do. Not a lecture. Not a theory. Just one concrete action 
                  that takes less than 5 minutes. Do it, mark it done, watch your health bar grow. 
                  It&apos;s that simple, and that powerful. 
                  <span className="text-primary-400 font-semibold"> You&apos;re becoming the husband you want to be. Daily.</span>
                </p>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>60+ actions across Communication, Romance, Partnership, Intimacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Actions that fit your situation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Track your progress and see your consistency</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🏆</span>
                  <h3 className="text-xl font-semibold text-slate-50">
                    Achievement Badges
                  </h3>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Yeah, we gamified it. Because sometimes you need that little dopamine hit when you&apos;ve 
                  actually followed through for 7 days straight. Badges celebrate the small wins that add up 
                  to big changes. And honestly? It feels good to see that progress.
                </p>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Consistency badges for daily streaks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Category badges for Communication, Romance, Partnership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Visual progress tracking and milestones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journal & Team Wins Section */}
        <section className="mt-24 border-t border-slate-800 pt-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-50">
                Journal & Team Wins
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">
                REFLECT & CONNECT
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📔</span>
                  <h3 className="text-xl font-semibold text-slate-50">
                    Private Journal
                  </h3>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  After you do the thing, write down what actually happened. Did it go well? Did it surprise you? 
                  Did you learn something? This is your space to be honest about what&apos;s working and what isn&apos;t. 
                  No one else sees it. Just you, being real with yourself.
                </p>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Private reflections on every action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Favorite your best entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Track your journey over time</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">💪</span>
                  <h3 className="text-xl font-semibold text-slate-50">
                    Team Wins
                  </h3>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Sometimes you nail it. Sometimes you try something and it actually works. Share those moments 
                  with other guys who get it. Read their wins. Get inspired. Realize you&apos;re not the only one 
                  trying to figure this marriage thing out. We&apos;re all in this together.
                </p>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Share your wins (optional, always private by default)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>See real victories from other husbands</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Build momentum and learn from the community</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="mt-24 border-t border-slate-800 pt-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-50 mb-2 text-center">
              Try Everything Free for 7 Days
            </h2>
            <p className="text-sm text-slate-400 text-center mb-4 max-w-2xl mx-auto">
              All features unlocked. No credit card required. After 7 days, choose what works for you.
            </p>
            <p className="text-xs text-slate-500 text-center mb-10 max-w-2xl mx-auto">
              No BS, no contracts. Cancel anytime.
            </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-950/60 p-8 rounded-xl shadow-lg border border-slate-800">
              <div className="bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 rounded-full inline-block mb-4 text-xs font-medium text-emerald-300">
                7-DAY FREE TRIAL
              </div>
              <h3 className="text-2xl font-semibold text-slate-50 mb-2">Free</h3>
              <div className="text-4xl font-bold text-slate-50 mb-2">
                $0<span className="text-lg text-slate-400">/month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">After 7-day trial</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1 action per week
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic action library
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Account access
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-slate-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-500">No health bar tracking</span>
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-slate-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-500">No badges</span>
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-slate-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-500">No journal</span>
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  View Team Wins (read-only, cannot post)
                </li>
              </ul>
              <Link
                href="/api/auth/login"
                className="block w-full text-center px-6 py-3 border border-slate-700 text-slate-100 rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="bg-primary-600/10 p-8 rounded-xl shadow-xl border border-primary-500/60 transform scale-105">
              <div className="bg-amber-400/90 text-amber-950 text-[11px] font-bold px-3 py-1 rounded-full inline-block mb-2 tracking-[0.16em] uppercase">
                7-DAY FREE TRIAL
              </div>
              <div className="bg-primary-500/20 text-primary-300 text-[11px] font-bold px-3 py-1 rounded-full inline-block mb-4 tracking-[0.16em] uppercase">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-semibold text-slate-50 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-slate-50 mb-2">
                $7<span className="text-lg text-slate-300">/month</span>
              </div>
              <p className="text-sm text-primary-400 font-semibold mb-6">
                {pricingMessage?.message || '$7 a month. Less than $0.25 a day. A no-brainer to level up your biggest win.'}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Daily personalized actions
                </li>
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Full health bar tracking
                </li>
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Achievement badges
                </li>
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Private journal & Team Wins
                </li>
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  All features unlocked
                </li>
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real, practical relationship tips
                </li>
              </ul>
              <Link
                href="/api/auth/login"
                className="block w-full text-center px-6 py-3 bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors font-semibold text-sm"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Best Husband Ever. Built for husbands who don&apos;t want to sleepwalk through their marriage.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href="/legal/terms" className="hover:text-slate-300 transition-colors">
                Terms of Service
              </Link>
              <span className="text-slate-700">•</span>
              <Link href="/legal/privacy" className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 text-center md:text-left">
            This is not therapy. It&apos;s a daily practice tool. Use it to support, not replace, honest conversations with your wife.
          </p>
          <p className="text-[11px] text-slate-600 text-center md:text-left mt-2">
            Business Number: 856744057
          </p>
        </div>
      </footer>
    </div>
  );
}


