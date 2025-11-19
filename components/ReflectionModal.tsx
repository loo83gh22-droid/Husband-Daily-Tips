'use client';

import { useState } from 'react';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipId: string;
  tipTitle: string;
  onSuccess: () => void;
}

export default function ReflectionModal({
  isOpen,
  onClose,
  tipId,
  tipTitle,
  onSuccess,
}: ReflectionModalProps) {
  const [reflection, setReflection] = useState('');
  const [shareToForum, setShareToForum] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) {
      setError('Please write something before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reflections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipId,
          content: reflection,
          shareToForum,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save reflection');
      }

      setReflection('');
      setShareToForum(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-50">Reflect on this action</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-2">What you completed:</p>
        <p className="text-slate-200 mb-6 font-medium">{tipTitle}</p>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            How did it go? What did you learn?
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Take a moment to reflect on what happened, what you noticed, or what you'd do differently..."
            className="w-full h-40 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />

          <div className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              id="shareToForum"
              checked={shareToForum}
              onChange={(e) => setShareToForum(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-600 bg-slate-800 border-slate-700 rounded focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="shareToForum" className="text-sm text-slate-300 cursor-pointer">
              <span className="font-medium">Share to Team Wins</span>
              <span className="block text-xs text-slate-500 mt-1">
                Other members can see this (anonymously) and comment. Help others learn from your
                experience.
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

