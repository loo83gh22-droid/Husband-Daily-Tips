import Link from 'next/link';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';
import { getMarketingMessage } from '@/lib/marketing-messages';
import ReferralCodeHandler from '@/components/ReferralCodeHandler';

export const metadata: Metadata = {
  title: 'Best Husband Ever - Daily Actions to Level Up Your Marriage',
  description: 'Stop winging it. Start winning it. Get daily personalized actions delivered to help you become the best husband ever. One small action a day. One moment where you actually show up. No grand gestures needed. Just consistent, real effort.',
  keywords: ['best husband', 'marriage tips', 'relationship advice', 'husband daily actions', 'marriage improvement', 'relationship goals', 'daily relationship tips', 'husband guide', 'marriage help', 'relationship building', 'become better husband', 'marriage advice for men'],
  openGraph: {
    title: 'Best Husband Ever - Daily Actions to Level Up Your Marriage',
    description: 'Stop winging it. Start winning it. Get daily personalized actions delivered to help you become the best husband ever.',
    url: 'https://www.besthusbandever.com',
    siteName: 'Best Husband Ever',
    images: [
      {
        url: 'https://www.besthusbandever.com/og-image.png?v=2',
        width: 1200,
        height: 630,
        alt: 'Best Husband Ever - Daily Actions for Better Relationships',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Husband Ever - Daily Actions to Level Up Your Marriage',
    description: 'Stop winging it. Start winning it. Get daily personalized actions delivered to help you become the best husband ever.',
    images: ['https://www.besthusbandever.com/og-image.png?v=2'],
  },
};

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
    <>
      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Best Husband Ever',
            url: 'https://www.besthusbandever.com',
            description: 'Daily actions to level up your marriage game. One move today. One wife smile tomorrow.',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.besthusbandever.com/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Best Husband Ever',
            url: 'https://www.besthusbandever.com',
            logo: 'https://www.besthusbandever.com/logo.png',
            description: 'Daily actions to help husbands become better partners. One small action a day for a stronger marriage.',
            sameAs: [
              // Add your social media links here when you have them
            ],
          }),
        }}
      />

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
                Marriage is hard. You know it. But here&apos;s the thing, it doesn&apos;t have to be complicated. 
                One small action a day. One moment where you actually show up. No grand gestures needed. 
                Just consistent, real effort. Become the husband you and your partner deserve.
              </p>
              <p className="text-sm md:text-base text-slate-400 italic mb-8 max-w-2xl">
                Designed for husbands, but it&apos;s not <span className="text-primary-400 font-semibold not-italic">just</span> for husbands. 
                Boyfriends, partners, and anyone committed to leveling up their relationship can benefit.
              </p>

              <div className="mb-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/survey"
                  className="inline-flex items-center justify-center px-10 py-5 rounded-xl bg-primary-500 text-slate-950 text-lg font-bold shadow-2xl shadow-primary-500/30 hover:bg-primary-400 transition-all transform hover:scale-105"
                >
                  Get Your Husband Score →
                </Link>
                <Link
                  href="/api/auth/login"
                  className="inline-flex items-center justify-center px-10 py-5 rounded-xl border-2 border-primary-500 text-primary-400 text-lg font-bold hover:bg-primary-500/10 transition-all transform hover:scale-105"
                >
                  Start Free Trial →
                </Link>
              </div>
            </div>

            {/* Right side - Visual/Stats */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-400 mb-1">100+</div>
                    <div className="text-xs text-slate-400">Daily Actions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400 mb-1">8</div>
                    <div className="text-xs text-slate-400">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-1">131</div>
                    <div className="text-xs text-slate-400">Badges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">7-Day</div>
                    <div className="text-xs text-slate-400">Events</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center">
                  Personalized daily actions based on your relationship goals
                </p>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <section id="how-it-works" className="mt-24 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Take the Survey</h3>
                <p className="text-slate-400">
                  Answer a few questions about your relationship. We&apos;ll create a personalized baseline and identify areas to focus on.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Get Daily Actions</h3>
                <p className="text-slate-400">
                  Receive a personalized action every day. Each one is designed to strengthen your relationship and show you care.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Track Progress</h3>
                <p className="text-slate-400">
                  Complete actions, earn badges, and watch your &quot;Husband Health&quot; score improve. See real progress over time.
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="mt-24 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 text-center mb-12">
              What Makes Us Different
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-3">🎯 Action-Based, Not Advice</h3>
                <p className="text-slate-400">
                  We don&apos;t just tell you what to do. We give you specific, actionable steps you can take today.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-3">📊 Track Your Growth</h3>
                <p className="text-slate-400">
                  See your progress with badges, streaks, and your &quot;Husband Health&quot; score. Real metrics for real improvement.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-3">🎮 Gamified & Fun</h3>
                <p className="text-slate-400">
                  Make relationship improvement engaging. Earn badges, build streaks, and stay motivated to keep showing up.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-3">💝 Personalized for You</h3>
                <p className="text-slate-400">
                  Actions are tailored to your relationship goals and areas that need the most attention.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-24 md:mt-32 text-center">
            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/40 rounded-2xl p-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">
                Ready to Become the Best Husband Ever?
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Start your 7-day free trial. No credit card required. Just commitment to showing up.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/survey"
                  className="inline-flex items-center justify-center px-10 py-5 rounded-xl bg-primary-500 text-slate-950 text-lg font-bold shadow-2xl shadow-primary-500/30 hover:bg-primary-400 transition-all transform hover:scale-105"
                >
                  Get Your Husband Score →
                </Link>
                <Link
                  href="/api/auth/login"
                  className="inline-flex items-center justify-center px-10 py-5 rounded-xl border-2 border-primary-500 text-primary-400 text-lg font-bold hover:bg-primary-500/10 transition-all transform hover:scale-105"
                >
                  Start Free Trial →
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 mt-24 md:mt-32">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <BrandLogo variant="nav" showTagline={false} />
              <div className="flex gap-6 text-sm text-slate-400">
                <Link href="/dashboard/about" className="hover:text-slate-200 transition-colors">
                  About
                </Link>
                <Link href="/dashboard/feedback" className="hover:text-slate-200 transition-colors">
                  Feedback
                </Link>
                <Link href="/dashboard/subscription" className="hover:text-slate-200 transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-slate-500">
              © {new Date().getFullYear()} Best Husband Ever. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
