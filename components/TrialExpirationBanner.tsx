'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrialExpirationBannerProps {
  trialEndsAt: string | null;
}

export default function TrialExpirationBanner({ trialEndsAt }: TrialExpirationBannerProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!trialEndsAt) {
      setIsVisible(false);
      return;
    }

    const checkTrialStatus = () => {
      const now = new Date();
      const trialEnd = new Date(trialEndsAt);
      const diff = trialEnd.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (days > 0 && days <= 2) {
        // Show banner if trial expires in 1-2 days
        setDaysRemaining(days);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    checkTrialStatus();
    // Check every hour
    const interval = setInterval(checkTrialStatus, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [trialEndsAt]);

  if (!isVisible || daysRemaining === null) {
    return null;
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-amber-300 mb-1">
            ⚠️ Your free trial ends in {daysRemaining} day{daysRemaining > 1 ? 's' : ''}
          </h3>
          <p className="text-sm md:text-base text-slate-300">
            Join Premium for just $7/month to keep all features. Less than $0.25 per day.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/subscription"
            className="px-4 py-2 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors whitespace-nowrap"
          >
            Join Premium
          </Link>
        </div>
      </div>
    </div>
  );
}

