'use client';

import { useState } from 'react';

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState<'suggestion' | 'bug' | 'praise' | 'other'>('suggestion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setError('Please share your thoughts!');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          feedback,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSubmitted(true);
      setFeedback('');
      setCategory('suggestion');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🙏</div>
        <h2 className="text-xl font-semibold text-emerald-300 mb-2">Thanks for Sharing!</h2>
        <p className="text-slate-300 mb-6">
          Your feedback helps us build something that actually works for you. We appreciate you taking the time.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFeedback('');
          }}
          className="px-6 py-2 bg-emerald-500 text-slate-950 text-sm font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
        >
          Share More Feedback
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
            What's this about?
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="suggestion">💡 Suggestion - I have an idea</option>
            <option value="bug">🐛 Bug - Something's not working</option>
            <option value="praise">⭐ Praise - This is working great</option>
            <option value="other">💬 Other - Just want to share</option>
          </select>
        </div>

        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-slate-300 mb-2">
            Tell us what's on your mind
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={8}
            placeholder="What's working? What's not? What do you need? What would make this better? We're all ears..."
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <p className="mt-2 text-xs text-slate-500">
            Be honest. Be specific. We can't improve if we don't know what needs fixing.
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Your feedback is private and helps us build something better.
          </p>
          <button
            type="submit"
            disabled={isSubmitting || !feedback.trim()}
            className="px-6 py-2 bg-primary-500 text-slate-950 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}

