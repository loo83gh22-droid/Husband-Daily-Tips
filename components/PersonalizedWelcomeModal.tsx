'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PersonalizedWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  baselineHealth?: number;
  categoryScores?: {
    communication?: number;
    intimacy?: number;
    partnership?: number;
    romance?: number;
    gratitude?: number;
    conflict?: number;
    reconnection?: number;
    quality_time?: number;
  };
  userId: string;
}

export default function PersonalizedWelcomeModal({
  isOpen,
  onClose,
  baselineHealth = 50,
  categoryScores,
  userId,
}: PersonalizedWelcomeModalProps) {
  const [recommendedActions, setRecommendedActions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && categoryScores) {
      // Find top 2-3 categories that need improvement (lowest scores)
      const categories = Object.entries(categoryScores)
        .filter(([key]) => key !== 'consistency')
        .map(([key, value]) => ({ category: key, score: value || 50 }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);

      // Fetch recommended actions for these categories
      fetchRecommendedActions(categories.map(c => c.category));
    }
  }, [isOpen, categoryScores]);

  const fetchRecommendedActions = async (categories: string[]) => {
    try {
      // Fetch actions by category from the actions page data
      // We'll get a few sample actions from each category
      const response = await fetch('/api/actions/recommended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendedActions(data.actions || []);
      }
    } catch (error) {
      console.error('Error fetching recommended actions:', error);
      // Fallback: show message without actions
    }
  };

  // Get focus areas (lowest scoring categories)
  const getFocusAreas = () => {
    if (!categoryScores) return [];
    
    return Object.entries(categoryScores)
      .filter(([key]) => key !== 'consistency')
      .map(([key, value]) => ({
        category: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
        score: value || 50,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);
  };

  const focusAreas = getFocusAreas();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-primary-500/30 rounded-2xl p-8 md:p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">
            Welcome to Best Husband Ever!
          </h2>
          <p className="text-slate-300 text-lg">
            Your personalized experience is ready
          </p>
        </div>

        {/* Baseline Health Score */}
        <div className="bg-gradient-to-r from-primary-500/20 to-primary-500/10 border border-primary-500/30 rounded-xl p-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-slate-300 mb-2">Your Starting Health Score</p>
            <div className="text-5xl font-bold text-primary-400 mb-2">
              {baselineHealth}
              <span className="text-2xl text-slate-400">/100</span>
            </div>
            <p className="text-xs text-slate-400">
              Complete actions daily to increase your score and improve your relationship
            </p>
          </div>
        </div>

        {/* Focus Areas */}
        {focusAreas.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-3">
              Based on your survey, we'll focus on:
            </h3>
            <div className="space-y-2">
              {focusAreas.map((area, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 font-medium">{area.category}</span>
                    <span className="text-primary-400 font-semibold">
                      {Math.round(area.score)}/100
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${area.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {recommendedActions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-50 mb-3">
              Your First Actions (Pick One):
            </h3>
            <div className="space-y-3">
              {recommendedActions.slice(0, 3).map((action, index) => {
                const theme = action.theme || action.category?.toLowerCase().replace('_', '-') || 'communication';
                return (
                <Link
                  key={action.id}
                  href={`/dashboard/actions/${theme}`}
                  onClick={onClose}
                  className="block bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-primary-500/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{action.icon || '💡'}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-50 font-medium mb-1">{action.name}</h4>
                      <p className="text-sm text-slate-400 line-clamp-2">{action.description}</p>
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-50 mb-2">What's Next:</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-1">✓</span>
              <span>Check your dashboard daily for your personalized action</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-1">✓</span>
              <span>Complete actions to build your health score and earn badges</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400 mt-1">✓</span>
              <span>Browse the Actions library to find actions that fit your schedule</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-primary-500 text-slate-950 font-semibold rounded-lg hover:bg-primary-400 transition-colors"
          >
            Get Started →
          </button>
          <Link
            href="/dashboard/actions"
            onClick={onClose}
            className="px-6 py-3 bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Browse Actions
          </Link>
        </div>
      </div>
    </div>
  );
}

