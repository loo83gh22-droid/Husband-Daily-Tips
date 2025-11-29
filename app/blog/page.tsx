import Link from 'next/link';
import { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';

export const metadata: Metadata = {
  title: 'Blog - Best Husband Ever | Relationship Tips & Guides',
  description: 'Learn how to become a better husband with our comprehensive guides on relationships, communication, and building stronger marriages.',
  openGraph: {
    title: 'Blog - Best Husband Ever',
    description: 'Learn how to become a better husband with our comprehensive guides on relationships, communication, and building stronger marriages.',
    url: 'https://www.besthusbandever.com/blog',
  },
};

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-become-a-better-husband',
    title: 'How to Become a Better Husband: A Complete Guide',
    description: 'Learn practical, actionable steps to improve your marriage and become the husband your partner deserves.',
    category: 'Relationship Advice',
    date: '2024-01-15',
  },
  {
    slug: 'product-hunt-launch-guide',
    title: 'Complete Product Hunt Launch Guide',
    description: 'Everything you need to know about launching your product on Product Hunt, from finding a hunter to maximizing your launch day.',
    category: 'Business',
    date: '2024-01-10',
  },
  {
    slug: 'seo-setup-guide',
    title: 'SEO Setup Guide: Get Your Site Indexed on Google',
    description: 'Step-by-step guide to setting up SEO for your website, including Google Search Console, sitemaps, and indexing.',
    category: 'Marketing',
    date: '2024-01-05',
  },
  {
    slug: 'launch-announcement-guide',
    title: 'How to Announce Your Product Launch',
    description: 'A comprehensive guide to announcing your product launch across multiple platforms and maximizing your reach.',
    category: 'Marketing',
    date: '2024-01-01',
  },
];

export default function BlogPage() {
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
              className="hidden md:inline-flex text-sm text-primary-400 font-medium"
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

      {/* Blog Header */}
      <header className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4">
            Blog
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Practical guides, relationship advice, and tips to help you become the best husband ever.
          </p>
        </div>
      </header>

      {/* Blog Posts */}
      <main className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 hover:border-primary-500/50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-primary-400 uppercase tracking-wide">
                    {post.category}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-500">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-slate-200 mb-3 group-hover:text-primary-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {post.description}
                </p>
                <div className="mt-4 text-primary-400 text-sm font-medium group-hover:underline">
                  Read more →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

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

