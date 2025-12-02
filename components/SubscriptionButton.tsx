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
  isLoggedIn?: boolean;
}

export default function SubscriptionButton({ plan, currentTier, hasActiveTrial, trialEndsAt, isOnPremium, isLoggedIn = false }: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartTrial = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/api/auth/login?returnTo=${returnUrl}`;
      return;
    }

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
    // Check if user is logged in
    if (!isLoggedIn) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/api/auth/login?returnTo=${returnUrl}`;
      return;
    }

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session');
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
    // Check if user is logged in
    if (!isLoggedIn) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/api/auth/login?returnTo=${returnUrl}`;
      return;
    }

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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create checkout session');
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
  // Only show if they don't have an active trial or paid subscription
  if (plan.tier === 'premium' && !isCurrent && !hasActiveTrial && !isOnPremium) {
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

  // For trial users on premium plan, show status message and "Subscribe Now" button
  if (plan.tier === 'premium' && hasActiveTrial && !isOnPremium) {
    const endDate = trialEndsAt ? new Date(trialEndsAt) : null;
    const daysRemaining = endDate ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
    
    return (
      <div className="space-y-3">
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-3 text-center">
          <p className="text-sm text-primary-300 font-medium">
            You're on a free trial. {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining.
          </p>
          <p className="text-xs text-primary-400 mt-1">
            All premium features active. Convert to paid anytime to continue after trial.
          </p>
        </div>
        <button
          onClick={handleAction}
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
            'Subscribe Now & Continue'
          )}
        </button>
        <p className="text-xs text-slate-400 text-center">
          Your trial continues until it ends, then billing begins. Cancel anytime.
        </p>
      </div>
    );
  }

  // Determine button text and status for other cases
  let buttonText = '';
  let statusMessage = '';
  
  if (isCurrent) {
    if (isOnPremium) {
      buttonText = 'Current Plan';
      statusMessage = 'You have an active subscription. All premium features unlocked.';
    } else {
      buttonText = 'Current Plan';
    }
  } else if (plan.tier === 'free') {
    buttonText = 'Downgrade';
  } else {
    buttonText = 'Select Plan';
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAction}
        disabled={isLoading || (isCurrent === true && !hasActiveTrial)}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
          isCurrent && !hasActiveTrial
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
    {statusMessage && (
      <p className="text-xs text-primary-300 text-center font-medium">
        {statusMessage}
      </p>
    )}
    </div>
  );
}

