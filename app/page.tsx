import Link from 'next/link';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950">
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50 tracking-tight mb-6">
              Level up your marriage game,
              <span className="block text-primary-400">one action at a time.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
              No fluff. No BS. Just real, actionable steps from dudes who figured it out. 
              One daily action. One clear win. Become the husband you and your partner deserve.
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
                <span>5 minutes a day. That&apos;s it.</span>
              </div>
              <span className="hidden md:inline text-slate-700">•</span>
              <span>For dudes who want to actually be good at this.</span>
            </div>
          </div>

          {/* Hero Right: Health Bar Preview */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-7 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">
                  RELATIONSHIP HEALTH
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  A simple visual of how consistently you&apos;re showing up.
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
              You don&apos;t see your wife as a checklist. This bar is for you:
              a quiet, honest mirror of your follow-through.
            </p>
          </div>
        </div>

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
                  We translate expert relationship research into simple, specific actions you can
                  take in under 5 minutes.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-primary-300 mb-2 uppercase tracking-[0.2em]">
                  02. Health Bar
                </p>
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                  See your consistency at a glance
                </h3>
                <p className="text-sm text-slate-300">
                  Your health bar rises when you follow through and slowly drains when you don&apos;t.
                  It&apos;s not about perfection—just honest momentum.
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
                  Keep a private journal of your reflections and optionally share wins with the community. 
                  See your growth over time and learn from other husbands doing the work.
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
                  Get one personalized action every day. Each action is specific, actionable, and takes less than 5 minutes. Complete actions to build your health bar and earn badges.
                </p>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>60+ actions across Communication, Romance, Partnership, Intimacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    <span>Personalized based on your relationship needs</span>
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
                  Earn badges as you complete actions and build consistency. Badges recognize your progress in different relationship areas and motivate you to keep going.
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
                  After completing each action, reflect on what happened. Your private journal helps you track your growth, notice patterns, and celebrate your wins. Mark favorites to revisit your best moments.
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
                  Share your wins with other husbands who are on the same journey. See real victories, learn from breakthroughs, and build momentum together. It&apos;s a community of dudes actually doing the work.
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
              Pick Your Level
            </h2>
            <p className="text-sm text-slate-400 text-center mb-10 max-w-2xl mx-auto">
              Start free. Upgrade only if the daily structure and health bar are actually helping you
              show up better at home. No BS, no contracts.
            </p>
          <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Tips</h3>
            <p className="text-gray-600">
              Receive expert-curated tips every day to help you become a better partner, husband, and friend.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your journey with streaks, achievements, and insights into your relationship growth.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized</h3>
            <p className="text-gray-600">
              Get tips tailored to your relationship stage, actions, and goals for maximum impact.
            </p>
          </div>
        </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950/60 p-8 rounded-xl shadow-lg border border-slate-800">
              <h3 className="text-2xl font-semibold text-slate-50 mb-2">Free</h3>
              <div className="text-4xl font-bold text-slate-50 mb-4">
                $0<span className="text-lg text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1 action per week
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic tips library
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Access to How To Guides
                </li>
              </ul>
              <Link
                href="/api/auth/login"
                className="block w-full text-center px-6 py-3 border border-slate-700 text-slate-100 rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-primary-600/10 p-8 rounded-xl shadow-xl border border-primary-500/60 transform scale-105">
              <div className="bg-amber-400/90 text-amber-950 text-[11px] font-bold px-3 py-1 rounded-full inline-block mb-4 tracking-[0.16em] uppercase">
                MOST USED PLAN
              </div>
              <h3 className="text-2xl font-semibold text-slate-50 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-slate-50 mb-4">
                $19.99<span className="text-lg text-slate-300">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-amber-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Daily personalized actions
                </li>
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-amber-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Full health bar tracking
                </li>
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-amber-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  &quot;Big husband&quot; bonuses and milestones
                </li>
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-amber-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Achievement badges
                </li>
                <li className="flex items-center text-slate-50">
                  <svg className="w-5 h-5 text-amber-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Expert relationship advice
                </li>
              </ul>
              <Link
                href="/api/auth/login"
                className="block w-full text-center px-6 py-3 bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors font-semibold text-sm"
              >
                Start Premium
              </Link>
            </div>

            <div className="bg-slate-950/60 p-8 rounded-xl shadow-lg border border-slate-800">
              <h3 className="text-2xl font-semibold text-slate-50 mb-2">Pro</h3>
              <div className="text-4xl font-bold text-slate-50 mb-4">
                $29.99<span className="text-lg text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Everything in Premium
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Weekly coaching resources & prompts
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center text-slate-300">
                  <svg className="w-5 h-5 text-emerald-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Advanced relationship analytics
                </li>
              </ul>
              <Link
                href="/api/auth/login"
                className="block w-full text-center px-6 py-3 bg-slate-100 text-slate-950 rounded-lg hover:bg-white transition-colors text-sm font-medium"
              >
                Go Pro
              </Link>
            </div>
          </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Best Husband Ever. Built for husbands who don&apos;t want to sleepwalk through their marriage.
          </p>
          <p className="text-[11px] text-slate-600">
            This is not therapy. It&apos;s a daily practice tool. Use it to support—not replace—honest conversations with your wife.
          </p>
        </div>
      </footer>
    </div>
  );
}


