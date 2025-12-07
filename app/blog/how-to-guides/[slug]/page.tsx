import { Metadata } from 'next';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { guides } from '@/app/dashboard/how-to-guides/[slug]/page';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides[slug];
  
  if (!guide) {
    return {
      title: 'Guide Not Found - Best Husband Ever',
    };
  }

  return {
    title: `${guide.title} - Best Husband Ever`,
    description: guide.excerpt,
    openGraph: {
      title: guide.title,
      description: guide.excerpt,
      type: 'article',
      url: `https://www.besthusbandever.com/blog/how-to-guides/${slug}`,
    },
  };
}

// Generate static params for all guides (for better SEO)
export async function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({
    slug,
  }));
}

export default async function PublicGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides[slug];

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-950">
        <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <BrandLogo variant="nav" showTagline={false} />
            </Link>
            <Link
              href="/api/auth/login"
              className="px-4 py-2 text-sm font-semibold bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-slate-50 mb-4">Guide Not Found</h1>
          <Link href="/blog" className="text-primary-400 hover:text-primary-300">
            ← Back to Blog
          </Link>
        </main>
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to How To Guides
          </Link>

          <article className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full">
                {guide.category}
              </span>
              <span className="text-xs text-slate-500">
                {guide.difficulty} • {guide.time}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">{guide.title}</h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">{guide.excerpt}</p>

            <div className="prose prose-invert prose-lg max-w-none">
              {guide.content.split('\n\n').map((section: string, idx: number) => {
                if (section.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-2xl font-bold text-slate-50 mt-8 mb-4">
                      {section.replace('## ', '')}
                    </h2>
                  );
                }
                if (section.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-xl font-bold text-slate-50 mt-6 mb-3">
                      {section.replace('### ', '')}
                    </h3>
                  );
                }
                if (section.startsWith('- ')) {
                  const items = section.split('\n').filter((l) => l.startsWith('- '));
                  return (
                    <ul key={idx} className="list-disc list-inside mb-4 space-y-2 ml-4">
                      {items.map((item, i) => (
                        <li key={i} className="text-slate-200">
                          {item.replace('- ', '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                // Regular paragraph
                const lines = section.split('\n');
                return (
                  <div key={idx} className="mb-6">
                    {lines.map((line, i) => {
                      if (line.trim() === '') return null;
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={i} className="font-bold text-slate-100 mt-4 mb-2">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      return (
                        <p key={i} className="text-slate-200 mb-3 leading-relaxed">
                          {line}
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* CTA to sign up */}
            <div className="mt-12 pt-8 border-t border-slate-800">
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-slate-50 mb-2">
                  Ready to Transform Your Relationship?
                </h3>
                <p className="text-slate-300 mb-4">
                  Get daily actions, track your progress, and access all our guides. Start your 7-day free trial today.
                </p>
                <Link
                  href="/api/auth/login"
                  className="inline-block px-6 py-3 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors"
                >
                  Start Free Trial →
                </Link>
              </div>
            </div>
          </article>
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

