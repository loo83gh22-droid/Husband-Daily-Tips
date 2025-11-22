'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

interface OutstandingAction {
  id: string;
  user_daily_actions_id: string;
  action_id: string;
  date: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface OutstandingActionsProps {
  userId: string;
}

export default function OutstandingActions({ userId }: OutstandingActionsProps) {
  const [actions, setActions] = useState<OutstandingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);
  const [markingDNC, setMarkingDNC] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOutstandingActions() {
      try {
        const response = await fetch(`/api/actions/outstanding?userId=${userId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setActions(data.actions || []);
        } else if (response.status === 401) {
          setActions([]);
        }
      } catch (error) {
        setActions([]);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchOutstandingActions();
    }
  }, [userId]);

  const handleMarkComplete = async (actionId: string, userDailyActionId: string) => {
    setMarkingComplete(userDailyActionId);
    try {
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ actionId }),
      });

      if (response.ok) {
        // Remove from list
        setActions((prev) => prev.filter((a) => a.user_daily_actions_id !== userDailyActionId));
      }
    } catch (error) {
      console.error('Error marking action as complete:', error);
    } finally {
      setMarkingComplete(null);
    }
  };

  const handleMarkDNC = async (userDailyActionId: string) => {
    setMarkingDNC(userDailyActionId);
    try {
      const response = await fetch('/api/actions/dnc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userDailyActionId }),
      });

      if (response.ok) {
        // Remove from list
        setActions((prev) => prev.filter((a) => a.user_daily_actions_id !== userDailyActionId));
      }
    } catch (error) {
      console.error('Error marking action as DNC:', error);
    } finally {
      setMarkingDNC(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <p className="text-sm text-slate-400">Loading outstanding actions...</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 md:p-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Outstanding Actions</h3>
        <p className="text-sm text-slate-400 text-center py-4">
          No outstanding actions. You&apos;re all caught up! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Outstanding Actions</h3>
        <span className="text-xs text-slate-400">{actions.length} pending</span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {actions.map((action) => {
          const actionDate = new Date(action.date);
          const isPastDue = actionDate < new Date();
          const daysAgo = Math.floor((new Date().getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={action.user_daily_actions_id}
              className={`p-3 rounded-lg border ${
                isPastDue
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-xl flex-shrink-0">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium text-slate-200 leading-tight">
                      {action.name}
                    </h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                      {isPastDue ? (
                        <span className="text-amber-400">{daysAgo}d ago</span>
                      ) : (
                        format(actionDate, 'MMM d')
                      )}
                    </span>
                  </div>
                  {action.description && (
                    <p className="text-xs text-slate-400 leading-tight mb-2">
                      {action.description}
                    </p>
                  )}
                  <span className="inline-block text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
                    {action.category}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkComplete(action.action_id, action.user_daily_actions_id)}
                  disabled={markingComplete === action.user_daily_actions_id || markingDNC === action.user_daily_actions_id}
                  className="flex-1 px-3 py-2.5 sm:py-1.5 text-xs font-medium bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded hover:bg-primary-500/30 active:bg-primary-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                >
                  {markingComplete === action.user_daily_actions_id ? 'Completing...' : '✓ Complete'}
                </button>
                <button
                  onClick={() => handleMarkDNC(action.user_daily_actions_id)}
                  disabled={markingComplete === action.user_daily_actions_id || markingDNC === action.user_daily_actions_id}
                  className="flex-1 px-3 py-2.5 sm:py-1.5 text-xs font-medium bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded hover:bg-slate-700/70 active:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
                >
                  {markingDNC === action.user_daily_actions_id ? 'Marking...' : 'DNC'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {actions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <Link
            href="/dashboard/journal"
            className="text-xs text-primary-300 hover:text-primary-200 font-medium flex items-center gap-1"
          >
            View your previous actions →
          </Link>
        </div>
      )}
    </div>
  );
}

