'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionButtonProps {
  plan: {
    name: string;
    price: number;
    tier: string;
  };
}

export default function SubscriptionButton({ plan }: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  const isPopular = plan.tier === 'premium';

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
        isPopular
          ? 'bg-primary-500 text-slate-950 hover:bg-primary-400 disabled:bg-primary-500/50'
          : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 disabled:bg-slate-800/50'
      }`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        plan.price === 0 ? 'Downgrade' : 'Start Free Trial'
      )}
    </button>
  );
}

