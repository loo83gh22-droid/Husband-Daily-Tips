import Link from 'next/link';
import { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';

export const metadata: Metadata = {
  title: 'SEO Setup Guide: Get Your Site Indexed on Google - Best Husband Ever Blog',
  description: 'Step-by-step guide to setting up SEO for your website, including Google Search Console, sitemaps, and indexing.',
  openGraph: {
    title: 'SEO Setup Guide: Get Your Site Indexed on Google',
    description: 'Step-by-step guide to setting up SEO for your website, including Google Search Console, sitemaps, and indexing.',
    url: 'https://www.besthusbandever.com/blog/seo-setup-guide',
    type: 'article',
    publishedTime: '2024-01-05',
  },
};

export default function SEOSetupGuidePage() {
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
                Marketing
              </span>
              <span className="text-slate-600">•</span>
              <time className="text-xs text-slate-500" dateTime="2024-01-05">
                January 5, 2024
              </time>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-6">
              SEO Setup Guide: Get Your Site Indexed on Google
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Step-by-step guide to setting up SEO for your website, including Google Search Console, sitemaps, and indexing.
            </p>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-slate max-w-none">
            <div className="text-slate-300 leading-relaxed space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Why You're Not Showing Up on Google</h2>
                <p>
                  If someone searches for your site and you don't appear, it's likely because:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>Google hasn't indexed your site yet - New sites can take weeks/months to be indexed</li>
                  <li>No sitemap submitted - Google doesn't know your pages exist</li>
                  <li>Missing Google Search Console setup - You can't request indexing without it</li>
                  <li>Limited backlinks - New sites need time to build authority</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">What We've Already Implemented</h2>
                <p>Your site includes:</p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li><strong>Enhanced Metadata</strong> - Comprehensive meta tags, Open Graph, Twitter Cards</li>
                  <li><strong>Structured Data (JSON-LD)</strong> - WebSite and Organization schema</li>
                  <li><strong>Sitemap</strong> - Automatically generates /sitemap.xml</li>
                  <li><strong>Robots.txt</strong> - Allows search engines to crawl public pages</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Step 1: Set Up Google Search Console</h2>
                <ol className="list-decimal list-inside space-y-4">
                  <li>Go to <a href="https://search.google.com/search-console" className="text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">Google Search Console</a></li>
                  <li>Add your property (your website URL)</li>
                  <li>Verify ownership using one of the provided methods (HTML file, meta tag, etc.)</li>
                  <li>Once verified, you'll have access to indexing tools</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Step 2: Submit Your Sitemap</h2>
                <ol className="list-decimal list-inside space-y-4">
                  <li>In Google Search Console, go to "Sitemaps" in the left sidebar</li>
                  <li>Enter your sitemap URL: <code className="bg-slate-800 px-2 py-1 rounded">https://www.besthusbandever.com/sitemap.xml</code></li>
                  <li>Click "Submit"</li>
                  <li>Google will start crawling your sitemap</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Step 3: Request Indexing for Key Pages</h2>
                <ol className="list-decimal list-inside space-y-4">
                  <li>Use the "URL Inspection" tool in Google Search Console</li>
                  <li>Enter your homepage URL</li>
                  <li>Click "Request Indexing"</li>
                  <li>Repeat for important pages (blog posts, key landing pages)</li>
                </ol>
                <p className="mt-4">
                  <strong>Note:</strong> Don't request indexing for every page - focus on your most important pages first.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Step 4: Monitor Your Progress</h2>
                <p>Check Google Search Console regularly to see:</p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>How many pages are indexed</li>
                  <li>Search queries that bring people to your site</li>
                  <li>Click-through rates</li>
                  <li>Any indexing errors</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">Best Practices</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Create quality, original content regularly</li>
                  <li>Use descriptive, keyword-rich titles and descriptions</li>
                  <li>Ensure your site is mobile-friendly</li>
                  <li>Keep page load times fast</li>
                  <li>Build backlinks naturally through quality content</li>
                  <li>Update your sitemap when you add new pages</li>
                </ul>
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
          <div className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Best Husband Ever. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

