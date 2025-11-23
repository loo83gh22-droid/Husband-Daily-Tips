'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MarketingMessageProps {
  category?: 'pricing' | 'value' | 'motivation' | 'social_proof' | 'urgency' | 'conversion' | 'cta';
  context?: 'subscription_page' | 'dashboard' | 'landing_page' | 'social_post' | 'banner' | 'all';
  variant?: 'banner' | 'card' | 'inline' | 'social';
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

interface MarketingMessageData {
  id: string;
  message: string;
  category: string;
  context: string | null;
}

export default function MarketingMessage({
  category = 'conversion',
  context = 'landing_page',
  variant = 'banner',
  showCTA = true,
  ctaText = 'Start Free Trial',
  ctaHref = '/survey',
  className = '',
}: MarketingMessageProps) {
  const [message, setMessage] = useState<MarketingMessageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessage() {
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (context) params.append('context', context);

        const response = await fetch(`/api/marketing/message?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setMessage(data.message);
        }
      } catch (error) {
        console.error('Error fetching marketing message:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessage();
  }, [category, context]);

  if (loading) {
    return (
      <div className={`${className} ${variant === 'banner' ? 'bg-slate-900/50 rounded-lg p-4 animate-pulse' : ''}`}>
        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
      </div>
    );
  }

  if (!message) return null;

  // Banner variant (for top of page, conversion prompts)
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 mb-8 text-white ${className}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <p className="text-lg md:text-xl font-semibold mb-1">{message.message}</p>
            {showCTA && (
              <Link
                href={ctaHref}
                className="inline-block mt-3 px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                {ctaText}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant (for landing page sections)
  if (variant === 'card') {
    return (
      <div className={`bg-slate-900/60 border border-primary-500/30 rounded-xl p-6 ${className}`}>
        <p className="text-lg font-semibold text-primary-300 mb-4">{message.message}</p>
        {showCTA && (
          <Link
            href={ctaHref}
            className="inline-block px-6 py-3 bg-primary-500 text-slate-950 rounded-lg font-semibold hover:bg-primary-400 transition-colors"
          >
            {ctaText}
          </Link>
        )}
      </div>
    );
  }

  // Social post variant (for marketing creative)
  if (variant === 'social') {
    return (
      <div className={`bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-primary-500/50 rounded-2xl p-8 md:p-12 text-center ${className}`}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-50 mb-6 leading-tight">
            {message.message}
          </h2>
          {showCTA && (
            <Link
              href={ctaHref}
              className="inline-block px-8 py-4 bg-primary-500 text-slate-950 text-lg font-bold rounded-xl hover:bg-primary-400 transition-colors shadow-lg"
            >
              {ctaText}
            </Link>
          )}
          <p className="text-sm text-slate-400 mt-4">besthusbandever.com</p>
        </div>
      </div>
    );
  }

  // Inline variant (for embedding in text)
  return (
    <span className={`text-primary-300 font-semibold ${className}`}>{message.message}</span>
  );
}

