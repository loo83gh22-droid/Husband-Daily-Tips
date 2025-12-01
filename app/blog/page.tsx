import Link from 'next/link';
import { Metadata } from 'next';
import BrandLogo from '@/components/BrandLogo';
import { guides, getGuidesByCategory } from '@/lib/guides-data';

export const metadata: Metadata = {
  title: 'How To Guides - Best Husband Ever | Practical Relationship Guides',
  description: 'Learn how to become a better husband with our comprehensive guides on relationships, communication, intimacy, partnership, and building stronger marriages.',
  openGraph: {
    title: 'How To Guides - Best Husband Ever',
    description: 'Learn how to become a better husband with our comprehensive guides on relationships, communication, intimacy, partnership, and building stronger marriages.',
    url: 'https://www.besthusbandever.com/blog',
  },
};

// Get guides organized by category from shared source
// This automatically includes all guides from the dashboard
// When you add a guide to the dashboard, it automatically appears here!
const guidesByCategory = getGuidesByCategory(guides);

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

      {/* Header */}
      <header className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4">
            How To Guides
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Practical guides organized by relationship priorities. Learn how to communicate better, build intimacy, show up as a partner, and strengthen your connection.
          </p>
        </div>
      </header>

      {/* How To Guides */}
      <main className="container mx-auto px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-12">
            {Object.entries(guidesByCategory).map(([categoryKey, category]) => (
              <section key={categoryKey} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-50">{category.name}</h2>
                    <p className="text-sm text-slate-400">{category.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {category.guides.map((guide: any) => (
                    <Link
                      key={guide.slug}
                      href={`/blog/how-to-guides/${guide.slug}`}
                      className="block"
                    >
                      <article className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-primary-500/50 hover:bg-slate-900 transition-all cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-500">
                                {guide.difficulty} • {guide.time}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-50 mb-2">
                              {guide.title}
                            </h3>
                          </div>
                          <svg
                            className="w-4 h-4 text-slate-500 flex-shrink-0 ml-3 mt-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>

                        <p className="text-sm text-slate-300 leading-relaxed">{guide.excerpt}</p>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm">
              More guides coming soon. <Link href="/api/auth/login" className="text-primary-400 hover:text-primary-300 transition-colors">Sign up</Link> to access all guides and track your progress.
            </p>
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

