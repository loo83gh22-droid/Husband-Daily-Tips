'use client';

import { useState } from 'react';

interface BillingToggleProps {
  onIntervalChange: (interval: 'month' | 'year') => void;
  defaultInterval?: 'month' | 'year';
}

export default function BillingToggle({ onIntervalChange, defaultInterval = 'month' }: BillingToggleProps) {
  const [interval, setInterval] = useState<'month' | 'year'>(defaultInterval);

  const handleToggle = (newInterval: 'month' | 'year') => {
    setInterval(newInterval);
    onIntervalChange(newInterval);
  };

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className={`text-sm font-medium transition-colors ${interval === 'month' ? 'text-slate-50' : 'text-slate-400'}`}>
        Monthly
      </span>
      <button
        onClick={() => handleToggle(interval === 'month' ? 'year' : 'month')}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
          interval === 'year' ? 'bg-primary-500' : 'bg-slate-700'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            interval === 'year' ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium transition-colors ${interval === 'year' ? 'text-slate-50' : 'text-slate-400'}`}>
          Annual
        </span>
        {interval === 'year' && (
          <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-500/30">
            Save 15%
          </span>
        )}
      </div>
    </div>
  );
}

