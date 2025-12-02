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
                  text: 'Start with a 7-day free trial—no credit card required. After that, premium membership is $7/month. That\'s less than $0.25 per day for daily actions that can transform your relationship.',
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
                  text: 'Best Husband Ever is designed for husbands, but it\'s not just for husbands. Boyfriends, partners, and anyone committed to leveling up their relationship can benefit. The actions are tailored to your relationship stage.',
                },
              },
              {
                '@type': 'Question',
                name: 'How long does it take to see results?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Many users notice a difference within the first week. Small daily actions compound over time—consistency is key. Track your progress with badges, streaks, and your Husband Health score to see measurable improvement over weeks and months.',
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
                  text: 'Very personalized. Based on your survey, we tailor actions to your work schedule, whether you have kids, your relationship goals, and your country (for holiday-specific actions). Actions adapt to your specific situation, not generic advice.',
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
                  text: 'Yes. Many users find value when their relationship needs attention. Daily actions can help rebuild connection, improve communication, and show consistent effort. However, if you\'re dealing with serious issues, we recommend also seeking professional counseling.',
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
                Daily Actions to Become a Better Husband
              </h1>
              <p className="text-lg md:text-xl text-primary-400 font-semibold mb-4 max-w-2xl">
                Daily actions that show you care. She&apos;ll notice. You&apos;ll both feel the difference.
              </p>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed mb-4 max-w-2xl">
                Consistency transforms your relationship by building trust, connection, and genuine appreciation. It&apos;s the steady, reliable effort that shows you&apos;re committed that truly makes the difference.
              </p>
              <p className="text-sm md:text-base text-slate-400 italic mb-6 max-w-2xl">
                Designed for husbands, but it&apos;s not <span className="text-primary-400 font-semibold not-italic">just</span> for husbands. 
                Boyfriends, partners, and anyone committed to leveling up their relationship can benefit.
              </p>

              {/* Pricing Badge */}
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                <span className="text-sm font-semibold text-primary-300">Just $7/month</span>
                <span className="text-xs text-slate-400">after free trial</span>
              </div>

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
              {/* Trust Signal */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                <span className="text-emerald-400">✓</span>
                <span>No credit card required</span>
              </div>
            </div>

            {/* Mobile Stats Card */}
            <div className="md:hidden mt-8">
              <div className="relative bg-gradient-to-br from-slate-900/98 via-primary-950/30 to-slate-800/98 border-2 border-primary-500/50 rounded-2xl p-6 backdrop-blur-sm shadow-2xl shadow-primary-500/30 overflow-hidden">
                <div className="text-center">
                  <div className="inline-flex flex-col items-center justify-center bg-gradient-to-br from-primary-500/30 via-primary-600/25 to-emerald-500/25 rounded-2xl px-6 py-3 mb-3 border-2 border-primary-400/50 shadow-xl shadow-primary-500/30 backdrop-blur-sm">
                    <div className="text-4xl font-black bg-gradient-to-r from-primary-300 via-primary-400 to-emerald-400 bg-clip-text text-transparent mb-1 leading-none">
                      {actionCount}+
                    </div>
                    <div className="text-xs font-bold text-primary-300 uppercase tracking-widest">Daily Actions</div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Across 8 categories</p>
                </div>
              </div>
            </div>

            {/* Right side - Visual/Stats */}
            <div className="hidden md:block">
              <div className="relative bg-gradient-to-br from-slate-900/98 via-primary-950/30 to-slate-800/98 border-2 border-primary-500/50 rounded-2xl p-7 backdrop-blur-sm shadow-2xl shadow-primary-500/30 overflow-hidden">
                {/* Decorative gradient blobs */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl -ml-16 -mb-16"></div>
                
                <div className="relative z-10">
                  {/* Action Count - Hero */}
                  <div className="text-center mb-6 pb-5 border-b-2 border-gradient-to-r from-transparent via-primary-500/40 to-transparent">
                    <div className="inline-flex flex-col items-center justify-center bg-gradient-to-br from-primary-500/30 via-primary-600/25 to-emerald-500/25 rounded-2xl px-7 py-4 mb-3 border-2 border-primary-400/50 shadow-xl shadow-primary-500/30 backdrop-blur-sm">
                      <div className="text-5xl font-black bg-gradient-to-r from-primary-300 via-primary-400 to-emerald-400 bg-clip-text text-transparent mb-1 leading-none drop-shadow-lg">
                        {actionCount}+
                      </div>
                    </div>
                    <div className="text-sm font-bold text-primary-300 uppercase tracking-widest">Daily Actions</div>
                  </div>
                  
                  {/* Categories Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-emerald-500/60 to-emerald-500/60"></div>
                      <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest px-2">8 Categories</div>
                      <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-emerald-500/60 to-emerald-500/60"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {categories.map((category, idx) => {
                        const colorSchemes = [
                          { bg: 'from-blue-500/25 to-cyan-500/20', border: 'border-blue-500/50', text: 'text-blue-200', hover: 'hover:border-blue-400/70 hover:from-blue-500/35' },
                          { bg: 'from-pink-500/25 to-rose-500/20', border: 'border-pink-500/50', text: 'text-pink-200', hover: 'hover:border-pink-400/70 hover:from-pink-500/35' },
                          { bg: 'from-emerald-500/25 to-teal-500/20', border: 'border-emerald-500/50', text: 'text-emerald-200', hover: 'hover:border-emerald-400/70 hover:from-emerald-500/35' },
                          { bg: 'from-purple-500/25 to-indigo-500/20', border: 'border-purple-500/50', text: 'text-purple-200', hover: 'hover:border-purple-400/70 hover:from-purple-500/35' },
                          { bg: 'from-orange-500/25 to-amber-500/20', border: 'border-orange-500/50', text: 'text-orange-200', hover: 'hover:border-orange-400/70 hover:from-orange-500/35' },
                          { bg: 'from-red-500/25 to-pink-500/20', border: 'border-red-500/50', text: 'text-red-200', hover: 'hover:border-red-400/70 hover:from-red-500/35' },
                          { bg: 'from-violet-500/25 to-purple-500/20', border: 'border-violet-500/50', text: 'text-violet-200', hover: 'hover:border-violet-400/70 hover:from-violet-500/35' },
                          { bg: 'from-cyan-500/25 to-blue-500/20', border: 'border-cyan-500/50', text: 'text-cyan-200', hover: 'hover:border-cyan-400/70 hover:from-cyan-500/35' },
                        ];
                        const scheme = colorSchemes[idx % colorSchemes.length];
                        return (
                          <div 
                            key={category} 
                            className={`group relative bg-gradient-to-br ${scheme.bg} ${scheme.hover} border-2 ${scheme.border} rounded-lg px-3 py-2.5 transition-all duration-300 cursor-default shadow-md hover:shadow-lg hover:scale-105 transform`}
                          >
                            <div className="flex items-center justify-center">
                              <span className={`text-xs font-bold ${scheme.text} group-hover:scale-110 transition-transform`}>
                                {category}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* 7-Day Event Blurb */}
                  <div className="mb-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-xl p-4 border-2 border-blue-500/40 shadow-lg backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-xl drop-shadow-lg">🎯</span>
                      <div>
                        <p className="text-xs font-bold text-slate-100 leading-relaxed">
                          <span className="text-blue-300">Each category</span> contains a focused <span className="text-purple-300 font-extrabold">7-day event</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom CTA */}
                  <div className="border-t-2 border-gradient-to-r from-transparent via-primary-500/50 to-transparent bg-gradient-to-r from-transparent via-primary-500/10 to-transparent pt-5 -mx-2 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg animate-pulse drop-shadow-lg">✨</span>
                      <p className="text-sm font-extrabold text-center bg-gradient-to-r from-primary-300 via-emerald-300 to-primary-300 bg-clip-text text-transparent">
                        Actions tailored to your goals
                      </p>
                      <span className="text-lg animate-pulse drop-shadow-lg">✨</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <section id="how-it-works" className="mt-24 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-3">Take the Survey</h3>
                <p className="text-slate-400">
                  Answer a few questions about your relationship. We&apos;ll create a personalized baseline and identify areas to focus on.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-3">Get Daily & Weekly Actions</h3>
                <p className="text-slate-400">
                  Daily actions delivered to your inbox and dashboard, plus weekly planning actions for bigger gestures. Track your progress with weekly summaries.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-3">Track Progress</h3>
                <p className="text-slate-400">
                  Feel the difference in your relationship. Visual dashboards show your growth.
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
                  Actions tailored to your goals, schedule, and relationship stage. What you need, when you need it—not a one-size-fits-all approach.
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
                  answer: 'Start with a 7-day free trial—no credit card required. After that, premium membership is $7/month. That\'s less than $0.25 per day for daily actions that can transform your relationship.',
                },
                {
                  question: 'Is there really a free trial?',
                  answer: 'Yes. 7 days completely free. No credit card required. No automatic charges. Just sign up, take the survey, and start receiving daily actions. Cancel anytime during the trial with no obligation.',
                },
                {
                  question: 'What if I\'m not married yet?',
                  answer: 'Best Husband Ever is designed for husbands, but it\'s not just for husbands. Boyfriends, partners, and anyone committed to leveling up their relationship can benefit. The actions are tailored to your relationship stage.',
                },
                {
                  question: 'How long does it take to see results?',
                  answer: 'Many users notice a difference within the first week. Small daily actions compound over time—consistency is key. Track your progress with badges, streaks, and your Husband Health score to see measurable improvement over weeks and months.',
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
                  answer: 'Very personalized. Based on your survey, we tailor actions to your work schedule, whether you have kids, your relationship goals, and your country (for holiday-specific actions). Actions adapt to your specific situation, not generic advice.',
                },
                {
                  question: 'What if I\'m in a long-distance relationship?',
                  answer: 'Many actions work great for long-distance relationships. We have actions specifically designed for couples who are apart, including virtual date ideas, thoughtful messages, and ways to stay connected across distance.',
                },
                {
                  question: 'Can I use this if my relationship is struggling?',
                  answer: 'Yes. Many users find value when their relationship needs attention. Daily actions can help rebuild connection, improve communication, and show consistent effort. However, if you\'re dealing with serious issues, we recommend also seeking professional counseling.',
                },
              ]}
            />
          </section>

          {/* CTA Section */}
          <section className="mt-24 md:mt-32 text-center">
            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/40 rounded-2xl p-12 max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-slate-50 mb-4">
                Ready to Become the Best Husband Ever?
              </h2>
              <p className="text-lg text-slate-300 mb-4">
                Start your 7-day free trial. Just commitment to showing up.
              </p>
              {/* Trust Signal - Prominent */}
              <div className="mb-6 flex items-center justify-center gap-2 text-base font-semibold text-emerald-400">
                <span>✓</span>
                <span>No credit card required</span>
              </div>
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
              {/* Pricing Badge in CTA */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-300">
                <span>After trial:</span>
                <span className="font-semibold text-primary-400">$7/month</span>
                <span className="text-slate-500">• Cancel anytime</span>
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
                <Link href="/about" className="hover:text-slate-200 transition-colors">
                  About
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
