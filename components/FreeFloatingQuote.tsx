'use client';

import { useEffect, useState } from 'react';

interface Quote {
  id: string;
  quote_text: string;
  author: string | null;
}

export default function FreeFloatingQuote() {
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

  if (loading || !quote) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 text-center">
      <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium italic leading-relaxed max-w-2xl px-4 mb-3">
        &ldquo;{quote.quote_text}&rdquo;
      </p>
      {quote.author && (
        <p className="text-sm sm:text-base text-slate-400">
          — {quote.author}
        </p>
      )}
    </div>
  );
}

