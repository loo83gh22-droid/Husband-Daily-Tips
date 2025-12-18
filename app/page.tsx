import Link from 'next/link';
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';
import { getMarketingMessage } from '@/lib/marketing-messages';
import ReferralCodeHandler from '@/components/ReferralCodeHandler';
import { getSupabaseAdmin } from '@/lib/supabase';
import FAQAccordion from '@/components/FAQAccordion';

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

async function getActionCount() {
  try {
    const adminSupabase = getSupabaseAdmin();
    const { count, error } = await adminSupabase
      .from('actions')
      .select('*', { count: 'exact', head: true });
    
    if (error || count === null) {
      return 100; // Fallback to 100 if error
    }
    
    // Round to nearest 10
    return Math.ceil(count / 10) * 10;
  } catch (error) {
    console.error('Error fetching action count:', error);
    return 100; // Fallback
  }
}

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  // Get action count and round to nearest 10
  const actionCount = await getActionCount();

  // Get a random pricing message for the landing page
  let pricingMessage = null;
  try {
    pricingMessage = await getMarketingMessage('pricing', 'landing_page');
  } catch (error) {
    // Silently fail if marketing messages aren't available yet (migration not run)
    console.error('Error fetching marketing message:', error);
  }

  // The 8 categories
  const categories = [
    'Communication',
    'Intimacy',
    'Partnership',
    'Romance',
    'Gratitude',
    'Conflict Resolution',
    'Reconnection',
    'Quality Time'
  ];

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
            description: 'Daily actions to level up your marriage game. One move today. One smile tomorrow.',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How does Best Husband Ever work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Take a quick survey about your relationship, then receive daily personalized actions delivered to your inbox and dashboard. Each action is tailored to your goals, schedule, and relationship stage. You\'ll also get weekly planning actions for bigger gestures and a weekly summary to track your progress.',
                },
              },
              {
                '@type': 'Question',
                name: 'What makes this different from other relationship advice?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We don\'t give generic tips. Every action is specific, actionable, and personalized. Instead of reading articles about what you "should" do, you get daily steps that tell you exactly what to do, when to do it, and why it matters. It\'s action-based, not advice-based.',
                },
              },
              {
                '@type': 'Question',
                name: 'How much does it cost?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Start with a 7-day free trial, no credit card required. After that, premium membership is $7/month. That\'s less than $0.25 per day for daily actions that can transform your relationship.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is there really a free trial?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. 7 days completely free. No credit card required. No automatic charges. Just sign up, take the survey, and start receiving daily actions. Cancel anytime during the trial with no obligation.',
                },
              },
              {
                '@type': 'Question',
                name: 'What if I\'m not married yet?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Best Husband Ever is designed for husbands, but it\'s not just for husbands. Boyfriends, partners, and anyone committed to leveling up their relationship can benefit.',
                },
              },
              {
                '@type': 'Question',
                name: 'How long does it take to see results?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Small daily actions compound over time, and consistency is key. Track your progress with badges, streaks, and your Husband Health score to see measurable improvement over weeks and months. You\'ll also start feeling the positive impact in your relationship as you consistently show up.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I cancel anytime?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Absolutely. Cancel anytime from your account settings. No long-term contracts, no cancellation fees, no questions asked. Your subscription will remain active until the end of your current billing period.',
                },
              },
              {
                '@type': 'Question',
                name: 'What types of actions will I receive?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'You\'ll get daily routine actions (quick wins you can do today) and weekly planning actions (bigger gestures that require more thought). Actions cover 8 categories: Communication, Intimacy, Partnership, Romance, Gratitude, Conflict Resolution, Reconnection, and Quality Time.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do I need to use the app every day?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'No pressure. You\'ll receive daily actions via email and can access them on the dashboard whenever you\'re ready. The weekly summary email helps you catch up if you miss a few days. Consistency helps, but flexibility is built in.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is my information private?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Your relationship information is completely private and secure. We never share your data with third parties. Your survey responses are used solely to personalize your daily actions. Your privacy is our priority.',
                },
              },
              {
                '@type': 'Question',
                name: 'How personalized are the actions?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Based on your survey, we tailor actions to your work schedule, whether you have kids, your relationship goals, and your country (for holiday-specific actions). Actions adapt to your specific situation, not generic advice.',
                },
              },
              {
                '@type': 'Question',
                name: 'What if I\'m in a long-distance relationship?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Many actions work great for long-distance relationships. We have actions specifically designed for couples who are apart, including virtual date ideas, thoughtful messages, and ways to stay connected across distance.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I use this if my relationship is struggling?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Daily actions can help rebuild connection, improve communication, and show consistent effort. However, if you\'re dealing with serious issues, we recommend also seeking professional counseling.',
                },
              },
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
                href="/blog"
                className="hidden md:inline-flex text-sm text-slate-300 hover:text-white transition-colors"
              >
                Blog
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/api/auth/login?returnTo=/dashboard"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/api/auth/login?returnTo=/dashboard"
                  className="px-4 py-2 text-sm font-semibold bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Enhanced Visual Hierarchy */}
        <main className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-6xl mx-auto">
            {/* Desktop: Single column with stats integrated */}
            <div className="md:grid md:grid-cols-[1.2fr,1fr] md:gap-12 lg:gap-16 items-center">
            <div className="order-2 md:order-1">
              <p className="text-xs sm:text-sm font-bold tracking-[0.2em] text-primary-400 uppercase mb-3 sm:mb-4">
                STOP WINGING IT. START WINNING IT.
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-50 tracking-tight mb-4 sm:mb-6 leading-tight">
                Daily Actions to Become a Better Husband
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-primary-400 font-bold mb-4 sm:mb-6 max-w-2xl">
                Daily actions that show you care. She&apos;ll notice. You&apos;ll both feel the difference.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed mb-4 sm:mb-6 max-w-2xl">
                One personalized action. Every day. No guesswork. Just clear steps that show you care.
              </p>

              {/* Quick Benefits List */}
              <div className="mb-4 sm:mb-6 space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400 text-xl">✓</span>
                  <span>Daily personalized actions delivered to your inbox</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400 text-xl">✓</span>
                  <span>Covering all 8 relationship categories</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400 text-xl">✓</span>
                  <span>Track your progress and see results</span>
                </div>
              </div>

              {/* Simple Access Message */}
              <div className="mb-4 sm:mb-6 p-4 bg-slate-800/50 border border-primary-500/30 rounded-lg max-w-2xl">
                <p className="text-sm sm:text-base text-slate-300">
                  <span className="font-semibold text-primary-400">Premium access</span> for subscribers after 7 days. <span className="font-semibold text-emerald-400">Free tier users</span> have basic access.
                </p>
              </div>

              {/* Single, Larger CTA */}
              <div className="mb-4 sm:mb-6">
                <Link
                  href="/api/auth/login?returnTo=/dashboard"
                  className="inline-flex items-center justify-center px-10 sm:px-12 py-5 sm:py-6 rounded-xl bg-primary-500 text-slate-950 text-lg sm:text-xl md:text-2xl font-bold shadow-2xl shadow-primary-500/30 hover:bg-primary-400 transition-all transform hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  Start 7-Day Free Trial →
                </Link>
              </div>

              {/* Trust Text */}
              <p className="text-sm text-slate-400 mb-4">
                No credit card required • Cancel anytime • 100% Secure
              </p>

              {/* Social Proof */}
              <div className="mt-4">
                <p className="text-sm text-slate-400">
                  Join <span className="text-primary-400 font-semibold">hundreds of husbands</span> improving their relationships daily
                </p>
              </div>
            </div>

            {/* Mobile CTA Card - Enhanced */}
            <div className="md:hidden mt-6 order-1 md:order-2">
              <div className="relative bg-gradient-to-br from-emerald-500/20 via-primary-500/20 to-primary-600/20 border-2 border-emerald-500/60 rounded-2xl p-6 backdrop-blur-sm shadow-2xl shadow-emerald-500/30 overflow-hidden">
                {/* Animated gradient blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500/20 rounded-full blur-xl -ml-12 -mb-12"></div>
                
                <div className="relative z-10 text-center">
                  {/* CTA Message */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/30 border-2 border-emerald-400/60 rounded-lg mb-3">
                    <span className="text-xl">🎯</span>
                    <span className="text-sm font-bold text-emerald-200">NO STRINGS ATTACHED</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-50 mb-2">
                    Try Premium Free for 7 Days
                  </h2>
                  <p className="text-sm text-slate-200 mb-2">
                    No credit card. No commitment.
                  </p>
                  <p className="text-xs text-emerald-300 font-semibold mb-4">
                    Free tier continues after trial
                  </p>

                  {/* CTA Button */}
                  <Link
                    href="/api/auth/login?returnTo=/dashboard"
                    className="block w-full text-center px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-lg font-black shadow-2xl shadow-emerald-500/50 transition-all transform hover:scale-105 active:scale-95 border-2 border-emerald-400 mb-4"
                  >
                    JOIN FREE NOW →
                  </Link>

                  {/* Trust Signals */}
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center justify-center gap-2 text-emerald-300">
                      <span>✓</span>
                      <span className="font-semibold">7-Day Premium Trial</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-emerald-300">
                      <span>✓</span>
                      <span className="font-semibold">No Credit Card</span>
                    </div>
                  </div>

                  {/* Free Tier Info */}
                  <div className="p-2 bg-slate-800/40 border border-emerald-500/20 rounded">
                    <p className="text-xs text-slate-300 text-center">
                      <span className="font-semibold text-primary-400">Premium</span> for subscribers. <span className="font-semibold text-emerald-300">Free tier</span> has basic access.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Prominent CTA Box - Desktop */}
            <div className="hidden md:block order-1 md:order-2">
              <div className="relative bg-gradient-to-br from-emerald-500/20 via-primary-500/20 to-primary-600/20 border-2 border-emerald-500/60 rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-emerald-500/30 overflow-hidden">
                {/* Animated gradient blobs for visual interest */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl -ml-16 -mb-16"></div>
                
                <div className="relative z-10">
                  {/* Main CTA Message */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/30 border-2 border-emerald-400/60 rounded-lg mb-4">
                      <span className="text-2xl">🎯</span>
                      <span className="text-lg font-bold text-emerald-200">NO STRINGS ATTACHED</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-50 mb-3 leading-tight">
                      Try Premium Free for 7 Days
                    </h2>
                    <p className="text-lg text-slate-200 mb-4">
                      No credit card. No commitment.
                    </p>
                  </div>

                  {/* Large CTA Button */}
                  <div className="mb-6">
                    <Link
                      href="/api/auth/login?returnTo=/dashboard"
                      className="block w-full text-center px-8 py-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xl font-black shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all transform hover:scale-105 active:scale-95 border-2 border-emerald-400"
                    >
                      JOIN FREE NOW →
                    </Link>
                  </div>

                  {/* Trust Signals - Prominent */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-center gap-2 text-emerald-300">
                      <span className="text-2xl">✓</span>
                      <span className="font-bold text-base">7-Day Premium Trial</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-emerald-300">
                      <span className="text-2xl">✓</span>
                      <span className="font-bold text-base">No Credit Card Required</span>
                    </div>
                  </div>

                  {/* Free Tier Info */}
                  <div className="mb-6 p-3 bg-slate-800/40 border border-emerald-500/20 rounded-lg">
                    <p className="text-xs text-slate-300 text-center">
                      <span className="font-semibold text-primary-400">Premium access</span> for subscribers after 7 days. <span className="font-semibold text-emerald-300">Free tier</span> users have basic access.
                    </p>
                  </div>

                  {/* Stats - Compact but visible */}
                  <div className="pt-6 border-t border-emerald-500/30">
                    <div className="text-center">
                      <div className="text-3xl font-black bg-gradient-to-r from-primary-300 via-emerald-300 to-emerald-400 bg-clip-text text-transparent mb-1">
                        {actionCount}+
                      </div>
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Daily Actions</div>
                      <p className="text-xs text-slate-400 mt-1">Across 8 categories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* How It Works Section - Enhanced & More Visible */}
          <section id="how-it-works" className="mt-20 sm:mt-24 md:mt-32 scroll-mt-20">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-50 mb-3 sm:mb-4">
                How It Works
              </h2>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
                Three simple steps to transform your relationship
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-2 border-primary-500/30 rounded-xl p-6 sm:p-8 text-center hover:border-primary-500/60 transition-all hover:shadow-xl hover:shadow-primary-500/20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500/30 to-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-primary-500/50">
                  <span className="text-3xl sm:text-4xl">📝</span>
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-primary-500 text-slate-950 rounded-full text-sm font-black mb-3 sm:mb-4">
                  1
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-200 mb-3 sm:mb-4">Sign Up & Complete Survey</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  Sign up for free, then answer a few questions about your relationship. We&apos;ll create a personalized baseline and identify areas to focus on.
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-2 border-primary-500/30 rounded-xl p-6 sm:p-8 text-center hover:border-primary-500/60 transition-all hover:shadow-xl hover:shadow-primary-500/20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500/30 to-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-primary-500/50">
                  <span className="text-3xl sm:text-4xl">📅</span>
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-primary-500 text-slate-950 rounded-full text-sm font-black mb-3 sm:mb-4">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-200 mb-3 sm:mb-4">Get Daily & Weekly Actions</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  Daily actions delivered to your inbox and dashboard, plus weekly planning actions for bigger gestures. Track your progress with weekly summaries.
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-2 border-primary-500/30 rounded-xl p-6 sm:p-8 text-center hover:border-primary-500/60 transition-all hover:shadow-xl hover:shadow-primary-500/20 sm:col-span-2 md:col-span-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500/30 to-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-primary-500/50">
                  <span className="text-3xl sm:text-4xl">🏆</span>
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-primary-500 text-slate-950 rounded-full text-sm font-black mb-3 sm:mb-4">
                  3
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-200 mb-3 sm:mb-4">Track Progress</h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  Feel the difference in your relationship. Visual dashboards show your growth with badges, streaks, and your Husband Health score.
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="mt-24 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 text-center mb-12">
              What Makes Us Different
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                <h3 className="text-xl font-semibold text-slate-200 mb-3">⚡ Action-Based, Not Advice</h3>
                <p className="text-slate-400">
                  No generic tips. Get specific, actionable steps delivered daily. You know exactly what to do, when to do it, and why it matters.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                <h3 className="text-xl font-semibold text-slate-200 mb-3">🎯 Personalized for Your Relationship</h3>
                <p className="text-slate-400">
                  Actions tailored to your goals, schedule, and relationship stage. What you need, when you need it, not a one-size-fits-all approach.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                <h3 className="text-xl font-semibold text-slate-200 mb-3">📈 See Real Results</h3>
                <p className="text-slate-400">
                  Track your progress, build streaks, and watch your relationship improve. Small daily actions compound into meaningful change.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mt-24 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <FAQAccordion
              items={[
                {
                  question: 'How does Best Husband Ever work?',
                  answer: 'Take a quick survey about your relationship, then receive daily personalized actions delivered to your inbox and dashboard. Each action is tailored to your goals, schedule, and relationship stage. You\'ll also get weekly planning actions for bigger gestures and a weekly summary to track your progress.',
                },
                {
                  question: 'What makes this different from other relationship advice?',
                  answer: 'We don\'t give generic tips. Every action is specific, actionable, and personalized. Instead of reading articles about what you "should" do, you get daily steps that tell you exactly what to do, when to do it, and why it matters. It\'s action-based, not advice-based.',
                },
                {
                  question: 'How much does it cost?',
                  answer: 'Start with a 7-day free trial, no credit card required. After that, premium membership is $7/month. That\'s less than $0.25 per day for daily actions that can transform your relationship.',
                },
                {
                  question: 'Is there really a free trial?',
                  answer: 'Yes. 7 days completely free. No credit card required. No automatic charges. Just sign up, take the survey, and start receiving daily actions. Cancel anytime during the trial with no obligation.',
                },
                {
                  question: 'What if I\'m not married yet?',
                  answer: 'Best Husband Ever is designed for husbands, but it\'s not just for husbands. Boyfriends, partners, and anyone committed to leveling up their relationship can benefit.',
                },
                {
                  question: 'How long does it take to see results?',
                  answer: 'Small daily actions compound over time, and consistency is key. Track your progress with badges, streaks, and your Husband Health score to see measurable improvement over weeks and months. You\'ll also start feeling the positive impact in your relationship as you consistently show up.',
                },
                {
                  question: 'Can I cancel anytime?',
                  answer: 'Absolutely. Cancel anytime from your account settings. No long-term contracts, no cancellation fees, no questions asked. Your subscription will remain active until the end of your current billing period.',
                },
                {
                  question: 'What types of actions will I receive?',
                  answer: 'You\'ll get daily routine actions (quick wins you can do today) and weekly planning actions (bigger gestures that require more thought). Actions cover 8 categories: Communication, Intimacy, Partnership, Romance, Gratitude, Conflict Resolution, Reconnection, and Quality Time.',
                },
                {
                  question: 'Do I need to use the app every day?',
                  answer: 'No pressure. You\'ll receive daily actions via email and can access them on the dashboard whenever you\'re ready. The weekly summary email helps you catch up if you miss a few days. Consistency helps, but flexibility is built in.',
                },
                {
                  question: 'Is my information private?',
                  answer: 'Yes. Your relationship information is completely private and secure. We never share your data with third parties. Your survey responses are used solely to personalize your daily actions. Your privacy is our priority.',
                },
                {
                  question: 'How personalized are the actions?',
                  answer: 'Based on your survey, we tailor actions to your work schedule, whether you have kids, your relationship goals, and your country (for holiday-specific actions). Actions adapt to your specific situation, not generic advice.',
                },
                {
                  question: 'What if I\'m in a long-distance relationship?',
                  answer: 'Many actions work great for long-distance relationships. We have actions specifically designed for couples who are apart, including virtual date ideas, thoughtful messages, and ways to stay connected across distance.',
                },
                {
                  question: 'Can I use this if my relationship is struggling?',
                  answer: 'Yes. Daily actions can help rebuild connection, improve communication, and show consistent effort. However, if you\'re dealing with serious issues, we recommend also seeking professional counseling.',
                },
              ]}
            />
          </section>

          {/* CTA Section - Enhanced with Trust Signals */}
          <section className="mt-20 sm:mt-24 md:mt-32 text-center">
            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 border-2 border-primary-500/40 rounded-2xl p-8 sm:p-12 max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-50 mb-4 sm:mb-6">
                Ready to Become the Best Husband Ever?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-6 sm:mb-8">
                Try Premium free for 7 days. No credit card required. Premium access for subscribers after 7 days. Free tier users have basic access.
              </p>
              
              {/* Enhanced Trust Signals */}
              <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base">
                <div className="flex items-center gap-2 font-semibold text-emerald-400">
                  <span className="text-lg">✓</span>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-emerald-400">
                  <span className="text-lg">🔒</span>
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-emerald-400">
                  <span className="text-lg">↩️</span>
                  <span>Cancel anytime</span>
                </div>
              </div>
              
              {/* Single, Larger CTA */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <Link
                  href="/api/auth/login?returnTo=/dashboard"
                  className="inline-flex items-center justify-center px-10 sm:px-12 py-5 sm:py-6 rounded-xl bg-primary-500 text-slate-950 text-lg sm:text-xl md:text-2xl font-bold shadow-2xl shadow-primary-500/30 hover:bg-primary-400 transition-all transform hover:scale-105 active:scale-95"
                >
                  Start 7-Day Free Trial →
                </Link>
              </div>
              
              {/* Enhanced Pricing & Guarantee Info */}
              <div className="space-y-3 sm:space-y-4 pt-6 border-t border-primary-500/30">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base text-slate-300">
                  <span>After trial:</span>
                  <span className="font-bold text-primary-400">$7/month for Premium</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-400 font-semibold">Free tier has basic access</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
                  <span className="text-primary-400">✓</span>
                  <span>7-Day Money-Back Guarantee • SSL Encrypted • GDPR Compliant</span>
                </div>
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
                <Link href="/blog" className="hover:text-slate-200 transition-colors">
                  Blog
                </Link>
                <Link href="/dashboard/about" className="hover:text-slate-200 transition-colors">
                  About
                </Link>
                <Link href="/dashboard/subscription" className="hover:text-slate-200 transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Best Husband Ever. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
