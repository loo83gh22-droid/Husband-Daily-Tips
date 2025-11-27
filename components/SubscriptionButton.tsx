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

  const handleAction = async () => {
    setIsLoading(true);

    try {
      // If user is on free tier and wants premium, start trial
      if (currentTier === 'free' && plan.tier === 'premium') {
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
        return;
      }

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
  // User is on current plan if tier matches, OR if they have premium subscription (not trial)
  const isCurrent = plan.tier === currentTier || (plan.tier === 'premium' && isOnPremium);

  // Determine button text
  let buttonText = '';
  if (isCurrent) {
    buttonText = 'Current Plan';
  } else if (plan.tier === 'premium' && isOnPremium) {
    // User is already on premium subscription
    buttonText = 'Current Plan';
  } else if (plan.tier === 'premium' && currentTier === 'free') {
    buttonText = 'Start Free Trial';
  } else if (plan.tier === 'premium' && hasActiveTrial) {
    const priceText = plan.interval === 'year' ? '$71.40/year' : '$7/month';
    buttonText = `Join Premium (${priceText})`;
  } else if (plan.tier === 'free') {
    buttonText = 'Downgrade';
  } else {
    buttonText = 'Select Plan';
  }

  return (
    <button
      onClick={handleAction}
      disabled={isLoading || isCurrent}
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

