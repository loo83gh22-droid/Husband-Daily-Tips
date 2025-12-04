'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Quote {
  id: string;
  quote_text: string;
  author: string | null;
}

export default function FreeFloatingQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch quote and profile picture in parallel
        const [quoteResponse, profileResponse] = await Promise.all([
          fetch('/api/quotes/random', { credentials: 'include' }),
          fetch('/api/user/display-name', { credentials: 'include' }),
        ]);

        if (quoteResponse.ok) {
          const quoteData = await quoteResponse.json();
          setQuote(quoteData.quote);
        }

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfilePicture(profileData.profilePicture || null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading || !quote) {
    return null;
  }

  return (
    <div className="relative w-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] rounded-xl overflow-hidden border border-slate-800">
      {/* Profile Picture Background */}
      {profilePicture && !imageError ? (
        <>
          <img
            src={profilePicture}
            alt="Profile background"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => {
              console.error('Failed to load profile picture for quote background:', profilePicture);
              setImageError(true);
            }}
            onLoad={() => {
              console.log('Profile picture loaded successfully for quote background');
            }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-slate-950/60"></div>
        </>
      ) : (
        /* Fallback gradient background (shown if no picture or if picture fails to load) */
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      )}

      {/* Quote Bubble Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 text-center">
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8 md:p-10 max-w-2xl shadow-2xl">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-100 font-medium italic leading-relaxed mb-4">
            &ldquo;{quote.quote_text}&rdquo;
          </p>
          {quote.author && (
            <p className="text-sm sm:text-base md:text-lg text-slate-300">
              — {quote.author}
            </p>
          )}
        </div>
        
        {/* Link to view previous actions */}
        <Link
          href="/dashboard/journal"
          className="mt-6 text-primary-300 hover:text-primary-200 text-sm sm:text-base font-semibold transition-colors relative z-10"
        >
          View your previous actions →
        </Link>
      </div>
    </div>
  );
}

