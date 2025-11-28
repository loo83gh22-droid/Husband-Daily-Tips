'use client';

import { useEffect, useState } from 'react';

interface Quote {
  id: string;
  quote_text: string;
  author: string | null;
}

interface QuotesDisplayProps {
  className?: string;
}

export default function QuotesDisplay({ className = '' }: QuotesDisplayProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await fetch('/api/quotes/random', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setQuote(data.quote);
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
  }, []);

  if (loading) {
    return (
      <div className={`bg-slate-900/70 border border-slate-800 rounded-xl p-4 ${className}`}>
        <p className="text-sm text-slate-400">Loading quote...</p>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br from-amber-500/10 via-amber-600/10 to-amber-500/10 border border-amber-500/30 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">💭</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-200 font-medium italic leading-relaxed mb-2">
            &ldquo;{quote.quote_text}&rdquo;
          </p>
          {quote.author && (
            <p className="text-xs text-amber-300/80 text-right">
              — {quote.author}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

