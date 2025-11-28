'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import ActionCompletionModal from './ActionCompletionModal';

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
  hasPremiumAccess?: boolean;
}

export default function OutstandingActions({ userId, hasPremiumAccess = false }: OutstandingActionsProps) {
  const [actions, setActions] = useState<OutstandingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);
  const [markingDNC, setMarkingDNC] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<OutstandingAction | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

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

  const handleMarkCompleteClick = (action: OutstandingAction) => {
    setSelectedAction(action);
    setShowCompletionModal(true);
  };

  const handleComplete = async (notes?: string, linkToJournal?: boolean) => {
    if (!selectedAction) return;

    setMarkingComplete(selectedAction.user_daily_actions_id);
    try {
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          actionId: selectedAction.action_id,
          notes: notes?.trim() || undefined,
          linkToJournal: linkToJournal ?? true,
        }),
      });

      if (response.ok) {
        // Remove from list
        setActions((prev) => prev.filter((a) => a.user_daily_actions_id !== selectedAction.user_daily_actions_id));
        setShowCompletionModal(false);
        setSelectedAction(null);
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

  // If free user, show upgrade message
  if (!hasPremiumAccess) {
    return (
      <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Outstanding Actions</h3>
        <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/40 rounded-lg p-4 text-center">
          <p className="text-sm font-semibold text-slate-50 mb-1.5">
            Catch up on missed actions with Premium
          </p>
          <p className="text-xs text-slate-300 mb-3">
            See and complete any actions you missed. Upgrade to stay on track.
          </p>
          <Link
            href="/dashboard/subscription?upgrade=actions"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20"
          >
            Upgrade to Premium →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
        <p className="text-xs text-slate-400">Loading outstanding actions...</p>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Outstanding Actions</h3>
        <p className="text-xs text-slate-400 text-center py-3">
          No outstanding actions. You&apos;re all caught up! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200">Outstanding Actions</h3>
        <span className="text-xs text-slate-400">{actions.length} pending</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
        {actions.map((action) => {
          const actionDate = new Date(action.date);
          const isPastDue = actionDate < new Date();
          const daysAgo = Math.floor((new Date().getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div
              key={action.user_daily_actions_id}
              className={`p-2.5 rounded-lg border ${
                isPastDue
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg flex-shrink-0">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs font-medium text-slate-200 leading-tight">
                      {action.name}
                    </h4>
                    {isPastDue && (
                      <span className="text-[10px] text-amber-400 whitespace-nowrap flex-shrink-0">
                        {daysAgo}d ago
                      </span>
                    )}
                  </div>
                  {action.description && (
                    <p className="text-[10px] text-slate-400 leading-tight mb-1.5 line-clamp-2">
                      {action.description}
                    </p>
                  )}
                  <span className="inline-block text-[9px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                    {action.category}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkCompleteClick(action)}
                  disabled={markingComplete === action.user_daily_actions_id || markingDNC === action.user_daily_actions_id}
                  className="flex-1 px-2.5 py-1.5 text-[10px] font-medium bg-primary-500/20 border border-primary-500/30 text-primary-300 rounded hover:bg-primary-500/30 active:bg-primary-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingComplete === action.user_daily_actions_id ? 'Completing...' : '✓ Complete'}
                </button>
                <button
                  onClick={() => handleMarkDNC(action.user_daily_actions_id)}
                  disabled={markingComplete === action.user_daily_actions_id || markingDNC === action.user_daily_actions_id}
                  className="flex-1 px-2.5 py-1.5 text-[10px] font-medium bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded hover:bg-slate-700/70 active:bg-slate-700/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingDNC === action.user_daily_actions_id ? 'Marking...' : 'DNC'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Completion Modal */}
      {selectedAction && (
        <ActionCompletionModal
          isOpen={showCompletionModal}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedAction(null);
          }}
          action={{
            id: selectedAction.action_id,
            name: selectedAction.name,
            description: selectedAction.description,
            icon: selectedAction.icon,
          }}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}

