'use client';

import { useState } from 'react';

export default function CustomerPortalButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenPortal = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      alert('Failed to open customer portal. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleOpenPortal}
      disabled={isLoading}
      className="w-full md:w-auto px-6 py-3 bg-primary-500 text-slate-950 rounded-lg font-semibold hover:bg-primary-400 transition-colors disabled:bg-primary-500/50 disabled:cursor-not-allowed"
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
        'Manage Billing & Subscription'
      )}
    </button>
  );
}

