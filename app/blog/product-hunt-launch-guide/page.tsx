import Link from 'next/link';
import { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';

export const metadata: Metadata = {
  title: 'Complete Product Hunt Launch Guide - Best Husband Ever Blog',
  description: 'Everything you need to know about launching your product on Product Hunt, from finding a hunter to maximizing your launch day success.',
  openGraph: {
    title: 'Complete Product Hunt Launch Guide',
    description: 'Everything you need to know about launching your product on Product Hunt, from finding a hunter to maximizing your launch day success.',
    url: 'https://www.besthusbandever.com/blog/product-hunt-launch-guide',
    type: 'article',
    publishedTime: '2024-01-10',
  },
};

export default function ProductHuntGuidePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <BrandLogo variant="nav" showTagline={false} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="hidden md:inline-flex text-sm text-slate-300 hover:text-white transition-colors"
            >
              Blog
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
      </nav>

      {/* Article */}
      <article className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Back to Blog */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary-400 mb-8 transition-colors"
          >
            ← Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-wide">
                Business
              </span>
              <span className="text-slate-600">•</span>
              <time className="text-xs text-slate-500" dateTime="2024-01-10">
                January 10, 2024
              </time>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6">
              Complete Product Hunt Launch Guide
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Everything you need to know about launching your product on Product Hunt, from finding a hunter to maximizing your launch day success.
            </p>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-slate max-w-none">
            <div className="text-slate-300 leading-relaxed space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">What is Product Hunt?</h2>
                <p>
                  Product Hunt is a platform where people discover new products. It's like "Hacker News for products." Getting featured on Product Hunt can drive thousands of visitors to your site in a single day.
                </p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>Products are ranked by upvotes within a 24-hour period</li>
                  <li>Top products get featured on the homepage</li>
                  <li>Can drive 1,000-10,000+ visitors in one day</li>
                  <li>Great for early traction and press coverage</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Why You Can't Post Your Own Product</h2>
                <p>
                  <strong>Product Hunt Rule</strong>: Makers (the people who built the product) cannot post their own products. You need someone else to "hunt" it for you.
                </p>
                <p className="mt-4">
                  <strong>Why?</strong> This prevents self-promotion spam and keeps the community authentic.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Step 1: Find a Hunter</h2>
                <p>
                  A "hunter" is someone with a Product Hunt account who will post your product for you.
                </p>
                <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Where to Find Hunters:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Ask Friends/Network</strong> - Do you know anyone active on Product Hunt?</li>
                  <li><strong>Product Hunt Community</strong> - Join Product Hunt's Slack community and post in #hunters channel</li>
                  <li><strong>Twitter/X</strong> - Search for "Product Hunt hunter" or "PH hunter"</li>
                  <li><strong>Indie Hackers / Reddit</strong> - Post on r/indiehackers or r/SideProject</li>
                  <li><strong>Hire a Hunter</strong> - Some people offer hunting services (usually $50-200)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Step 2: Prepare Your Product Hunt Listing</h2>
                <p>You need to prepare everything BEFORE launch day. Your hunter will need:</p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li><strong>Product Name</strong> - Example: "Best Husband Ever"</li>
                  <li><strong>Tagline</strong> - One sentence, max 60 characters</li>
                  <li><strong>Description</strong> - 2-4 paragraphs explaining what it is</li>
                  <li><strong>Product URL</strong> - Your website URL</li>
                  <li><strong>Product Logo</strong> - 512x512px square image</li>
                  <li><strong>Product Screenshots</strong> - At least 3, recommended 5-7</li>
                  <li><strong>Product Video</strong> - Optional but recommended (30-60 second demo)</li>
                  <li><strong>Topics/Tags</strong> - Choose 3-5 relevant topics</li>
                  <li><strong>Maker Comment</strong> - Your story (you write this after launch)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Step 3: Choose Your Launch Date</h2>
                <p><strong>Best Days</strong>: Tuesday, Wednesday, or Thursday</p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>Avoid Monday (busy start of week)</li>
                  <li>Avoid Friday (people check out)</li>
                  <li>Avoid weekends (lower traffic)</li>
                </ul>
                <p className="mt-4">
                  <strong>Best Time</strong>: 12:01 AM PST (Pacific Standard Time)
                </p>
                <p className="mt-4">
                  Product Hunt resets at midnight PST. Posting at 12:01 AM gives you the full day and more visibility = better ranking.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Step 4: Launch Day Process</h2>
                <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">The Night Before (11:30 PM PST):</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Final check of all assets</li>
                  <li>Hunter confirmed and ready</li>
                  <li>Your Product Hunt account created</li>
                  <li>You're ready to respond to comments</li>
                </ul>
                <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">At 12:01 AM PST:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Hunter posts your product</li>
                  <li>You claim your product immediately</li>
                  <li>Add your maker comment</li>
                </ul>
                <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Throughout Launch Day:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Share everywhere (Twitter, LinkedIn, communities)</li>
                  <li>Engage actively - respond to every comment</li>
                  <li>Monitor ranking (Top 5 = featured on homepage)</li>
                  <li>Stay active and genuine</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Pro Tips for Success</h2>
                <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">Before Launch:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Build an email list and email them on launch day</li>
                  <li>Prepare your network - tell friends/family about launch day</li>
                  <li>Create great assets - clear screenshots, professional logo</li>
                  <li>Write compelling copy - clear, engaging description</li>
                </ul>
                <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3">During Launch:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Respond quickly - first hour is critical</li>
                  <li>Be genuine - don't be salesy, share your real story</li>
                  <li>Engage with community - upvote other products too</li>
                  <li>Share strategically - don't spam, share in relevant communities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Success Metrics</h2>
                <p><strong>What's Considered Success:</strong></p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li><strong>Top 5</strong>: Amazing! Featured on homepage, thousands of visitors</li>
                  <li><strong>Top 20</strong>: Great success! Significant traffic and visibility</li>
                  <li><strong>Top 50</strong>: Good success! Decent traffic and engagement</li>
                  <li><strong>Top 100</strong>: Solid launch! Good visibility</li>
                  <li><strong>100+ upvotes</strong>: Strong community support</li>
                </ul>
                <p className="mt-4">
                  <strong>Realistic Expectations:</strong> First launch: 50-200 upvotes is common. Don't expect to be #1 on first try. Focus on engagement and feedback.
                </p>
              </section>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/40 rounded-xl">
            <h3 className="text-2xl font-bold text-slate-50 mb-4">
              Ready to Become the Best Husband Ever?
            </h3>
            <p className="text-slate-300 mb-6">
              Start your 7-day free trial. No credit card required.
            </p>
            <Link
              href="/api/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-500 text-slate-950 text-lg font-bold hover:bg-primary-400 transition-all"
            >
              Start Free Trial →
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <BrandLogo variant="nav" showTagline={false} />
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/blog" className="hover:text-slate-200 transition-colors">
                Blog
              </Link>
              <Link href="/api/auth/login" className="hover:text-slate-200 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Best Husband Ever. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

