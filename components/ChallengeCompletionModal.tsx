'use client';

import { useState } from 'react';

interface ChallengeCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: {
    id: string;
    name: string;
    description: string;
    icon: string | null;
  };
  onComplete: (notes?: string, linkToJournal?: boolean) => Promise<void>;
}

export default function ChallengeCompletionModal({
  isOpen,
  onClose,
  challenge,
  onComplete,
}: ChallengeCompletionModalProps) {
  const [notes, setNotes] = useState('');
  const [linkToJournal, setLinkToJournal] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onComplete(notes.trim() || undefined, linkToJournal);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {challenge.icon && <span className="text-3xl">{challenge.icon}</span>}
            <div>
              <h3 className="text-xl font-semibold text-slate-50">{challenge.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{challenge.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go? What did you learn? (This will be saved to your journal)"
              rows={4}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="linkToJournal"
              checked={linkToJournal}
              onChange={(e) => setLinkToJournal(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-500 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="linkToJournal" className="text-sm text-slate-300 cursor-pointer">
              Save to journal
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-slate-700 text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-500 disabled:bg-primary-900 disabled:text-slate-400 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:cursor-default"
            >
              {isSubmitting ? 'Saving...' : 'Mark Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

