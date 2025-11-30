'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionButtonProps {
  plan: {
    name: string;
    price: number;
    tier: string;
    interval?: 'month' | 'year';
  };
  currentTier?: string;
  hasActiveTrial?: boolean | null;
  trialEndsAt?: string | null;
  isOnPremium?: boolean;
}

export default function SubscriptionButton({ plan, currentTier, hasActiveTrial, trialEndsAt, isOnPremium }: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartTrial = async () => {
    setIsLoading(true);

    try {
      // Start free trial (no credit card required)
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start trial');
      }

      const data = await response.json();
      alert('7-day free trial started! Enjoy all premium features.');
      router.refresh();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Failed to start trial. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubscribeNow = async () => {
    setIsLoading(true);

    try {
      // Go directly to Stripe checkout (skip trial, credit card required)
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interval: plan.interval || 'month',
          skipTrial: true, // Skip the trial period
        }),
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
      console.error('Error:', error);
      alert(error.message || 'Failed to process request. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    setIsLoading(true);

    try {

      // If user is on trial and wants to subscribe, go to Stripe checkout
      if (hasActiveTrial && plan.tier === 'premium') {
        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interval: plan.interval || 'month',
          }),
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
        return;
      }

      // Downgrade to free (if on premium/paid)
      if (plan.tier === 'free' && currentTier === 'premium') {
        // This would need a downgrade endpoint - for now just show message
        alert('To downgrade, please cancel your subscription in the billing section.');
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Failed to process request. Please try again.');
      setIsLoading(false);
    }
  };

  const isPopular = plan.tier === 'premium';
  // User is on current plan if:
  // 1. Tier matches exactly, OR
  // 2. They have premium subscription (paid), OR
  // 3. They have an active trial (tier is premium but no paid subscription yet)
  const isCurrent = plan.tier === currentTier || 
                    (plan.tier === 'premium' && isOnPremium) ||
                    (plan.tier === 'premium' && (hasActiveTrial === true));

  // For free users wanting premium, show two buttons: trial and direct subscription
  if (plan.tier === 'premium' && currentTier === 'free' && !hasActiveTrial) {
    return (
      <div className="space-y-3">
        <button
          onClick={handleStartTrial}
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-lg font-semibold transition-colors bg-primary-500 text-slate-950 hover:bg-primary-400 disabled:bg-primary-500/50"
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
            'Start Free Trial'
          )}
        </button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900/80 px-2 text-slate-400">Or</span>
          </div>
        </div>
        <button
          onClick={handleSubscribeNow}
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-lg font-semibold transition-colors bg-slate-800 text-slate-200 hover:bg-slate-700 border-2 border-primary-500/50 hover:border-primary-500 disabled:bg-slate-800/50"
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
            'Subscribe Now (Skip Trial)'
          )}
        </button>
        <p className="text-xs text-slate-400 text-center mt-2">
          Subscribe now to start immediately. Credit card required.
        </p>
      </div>
    );
  }

  // Determine button text for other cases
  let buttonText = '';
  if (isCurrent) {
    buttonText = 'Current Plan';
  } else if (plan.tier === 'premium' && hasActiveTrial) {
    // This shouldn't happen if isCurrent is working, but just in case
    buttonText = 'Current Plan';
  } else if (plan.tier === 'free') {
    buttonText = 'Downgrade';
  } else {
    buttonText = 'Select Plan';
  }

  return (
    <button
      onClick={handleAction}
      disabled={isLoading || (isCurrent === true)}
      className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
        isCurrent
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          : isPopular
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
        buttonText
      )}
    </button>
  );
}

