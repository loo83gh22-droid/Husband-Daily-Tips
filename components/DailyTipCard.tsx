'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  tier: string;
  created_at: string;
}

interface DailyTipCardProps {
  tip: Tip;
}

export default function DailyTipCard({ tip }: DailyTipCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMarkDone = async () => {
    if (isSubmitting || isCompleted) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tips/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipId: tip.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as done');
      }

      setIsCompleted(true);
    } catch (error) {
      console.error(error);
      setErrorMessage('Could not save this action. You can try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-xl shadow-lg p-8 mb-6 border border-slate-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full mb-2">
            {tip.category}
          </span>
          <h3 className="text-2xl font-semibold text-slate-50 mb-2">{tip.title}</h3>
        </div>
        <div className="text-xs text-slate-500 text-right">
          {format(new Date(), 'MMM d, yyyy')}
        </div>
      </div>
      
      <div className="prose max-w-none">
        <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line">
          {tip.content}
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={handleMarkDone}
            disabled={isSubmitting || isCompleted}
            className="px-4 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-default"
          >
            {isCompleted ? 'Marked as done ✓' : isSubmitting ? 'Saving…' : 'Mark as done ✓'}
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-slate-700 text-slate-100 text-sm rounded-lg hover:bg-slate-900 transition-colors"
          >
            Save for later
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Completing this nudges your health bar up. Skipping it won&apos;t break anything—but
          patterns always tell the truth.
        </p>
      </div>

      {errorMessage && (
        <p className="mt-3 text-[11px] text-rose-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

