'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  difficulty: string;
  time: string;
}

interface GuideCategorySectionProps {
  categoryKey: string;
  category: {
    name: string;
    description: string;
    icon: string;
    guides: Guide[];
  };
  visitCounts: Record<string, number>;
  defaultExpanded?: boolean;
}

export default function GuideCategorySection({
  categoryKey,
  category,
  visitCounts,
  defaultExpanded = false,
}: GuideCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Sort guides by visit count (most visited first)
  const sortedGuides = [...category.guides].sort((a, b) => {
    const aVisits = visitCounts[a.slug] || 0;
    const bVisits = visitCounts[b.slug] || 0;
    return bVisits - aVisits; // Descending order
  });

  const topGuides = sortedGuides.slice(0, 2);
  const remainingGuides = sortedGuides.slice(2);
  const hasMoreGuides = category.guides.length > 2;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{category.icon}</span>
        <div>
          <h2 className="text-2xl font-bold text-slate-50">{category.name}</h2>
          <p className="text-sm text-slate-400">{category.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {topGuides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/dashboard/how-to-guides/${guide.slug}`}
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

        {isExpanded && remainingGuides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/dashboard/how-to-guides/${guide.slug}`}
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

      {hasMoreGuides && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500/10 border border-primary-500/30 text-primary-300 rounded-lg hover:bg-primary-500/20 transition-colors text-sm font-medium"
          >
            {isExpanded ? (
              <>
                Show Less {category.name} Guides
                <svg
                  className="w-4 h-4 transform rotate-180"
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
              </>
            ) : (
              <>
                See All {category.name} Guides
                <span className="text-xs text-slate-400">
                  ({category.guides.length - 2} more)
                </span>
                <svg
                  className="w-4 h-4"
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
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

