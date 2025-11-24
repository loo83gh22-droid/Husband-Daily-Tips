'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SubscriptionBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await fetch('/api/marketing/message?category=conversion&context=banner');
        if (response.ok) {
          const data = await response.json();
          setMessage(data.message?.message || null);
        }
      } catch (error) {
        console.error('Error fetching marketing message:', error);
      }
    }

    fetchMessage();
  }, []);

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 mb-8 text-white">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-2xl font-bold mb-2">Unlock All Features</h3>
          <p className="text-primary-100">
            {message || 'Look at you. You\'re here. You\'re trying. That\'s what matters. Now unlock daily actions, full health bar tracking, badges, journal, and Team Wins. Try everything free for 7 days. No credit card. No BS.'}
          </p>
        </div>
        <Link
          href="/dashboard/subscription"
          className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}


