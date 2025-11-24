'use client';

import Link from 'next/link';
import { useState } from 'react';

interface SurveyBannerProps {
  surveyCompleted: boolean;
}

export default function SurveyBanner({ surveyCompleted }: SurveyBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if survey is completed or if user dismissed it
  if (surveyCompleted || isDismissed) {
    return null;
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/30 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-slate-50 mb-1">
            Complete your baseline survey
          </h3>
          <p className="text-sm md:text-base text-slate-300">
            Help us personalize your experience and establish your baseline health score.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/survey"
            className="px-4 py-2 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors whitespace-nowrap"
          >
            Take Survey
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors text-sm"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

