'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import ActionCompletionModal from './ActionCompletionModal';
import ActionDetailModal from './ActionDetailModal';
import { toast } from './Toast';
import { getGuideSlugForAction } from '@/lib/action-guide-mapping';
import { personalizeText } from '@/lib/personalize-text';
import { canCompleteFromActionsPage, type SubscriptionStatus } from '@/lib/subscription-utils';
import { isNewContent } from '@/lib/is-new-content';

interface Action {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: string;
  requirement_type: string | null;
  icon: string | null;
  benefit?: string | null;
  created_at?: string;
}

interface ActionCompletion {
  id: string;
  completed_at: string;
  notes: string | null;
}

interface ActionsListProps {
  actions: Action[];
  completedMap: Map<string, ActionCompletion[]>; // Changed to array of completions
  userId: string;
  favoritedActionIds?: Set<string>; // IDs of favorited actions
  partnerName?: string | null;
}

export default function ActionsList({
  actions,
  completedMap,
  userId,
  favoritedActionIds = new Set(),
  partnerName,
}: ActionsListProps) {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailAction, setDetailAction] = useState<Action | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [newlyEarnedBadges, setNewlyEarnedBadges] = useState<
    Array<{ name: string; description: string; icon: string }>
  >([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Fetch subscription status
  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        // Add cache-busting query parameter and no-cache headers to ensure fresh data
        const response = await fetch(`/api/user/subscription-status?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Subscription status fetched:', data); // Debug log
          setSubscriptionStatus(data);
        } else {
          console.error('Failed to fetch subscription status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        // Default to free tier on error
        setSubscriptionStatus({
          tier: 'free',
          hasActiveTrial: false,
          hasSubscription: false,
          isOnPremium: false,
        });
      } finally {
        setIsLoadingSubscription(false);
      }
    }
    fetchSubscriptionStatus();
    
    // Refresh subscription status when page becomes visible (e.g., after returning from subscription page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSubscriptionStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh on focus (when user switches back to tab)
    const handleFocus = () => {
      fetchSubscriptionStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleCompleteAction = async (notes?: string, linkToJournal?: boolean) => {
    if (!selectedAction) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionId: selectedAction.id,
          notes: notes || null,
          linkToJournal: linkToJournal || false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete action');
      }

      const data = await response.json();

      // Show badge notifications if any were earned
      if (data.newlyEarnedBadges && data.newlyEarnedBadges.length > 0) {
        setNewlyEarnedBadges(data.newlyEarnedBadges);
        setTimeout(() => setNewlyEarnedBadges([]), 5000);
      }

      // Refresh page to show new completion
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error completing action:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = (action: Action) => {
    // Check if user can complete actions from this page
    if (subscriptionStatus && !canCompleteFromActionsPage(subscriptionStatus)) {
      // Show toast notification instead of redirecting
      toast.error("Upgrade to Premium to complete actions from this page.");
      return;
    }
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Badge notification */}
      {newlyEarnedBadges.length > 0 && (
        <div className="mb-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
          <p className="text-xs font-semibold text-primary-300 mb-2">🎉 Badge Earned!</p>
          {newlyEarnedBadges.map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2 last:mb-0">
              <span className="text-xl">{badge.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-200">{badge.name}</p>
                <p className="text-xs text-slate-400">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {actions
          .filter((action, index, self) => 
            // Ensure no duplicates by ID
            index === self.findIndex((a) => a.id === action.id)
          )
          .map((action) => {
          const completions = completedMap.get(action.id) || [];
          const completionCount = completions.length;
          const latestCompletion = completions.length > 0 ? completions[0] : null;

          return (
            <div
              key={`action-${action.id}`}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary-500/50 ${
                completionCount > 0
                  ? 'bg-primary-500/10 border-primary-500/30'
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
              onClick={(e) => {
                // Don't trigger if clicking the + button or links
                const target = e.target as HTMLElement;
                if (target.closest('button') || target.closest('a')) {
                  return;
                }
                setDetailAction(action);
                setIsDetailModalOpen(true);
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {completionCount > 0 && (
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center mb-2">
                      <span className="text-xs font-bold text-slate-950">{completionCount}</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleOpenModal(action)}
                    disabled={isSubmitting || isLoadingSubscription || (subscriptionStatus ? !canCompleteFromActionsPage(subscriptionStatus) : false)}
                    className={`w-6 h-6 rounded border-2 border-primary-500 bg-primary-500/20 hover:bg-primary-500/30 flex items-center justify-center transition-all disabled:opacity-50 ${
                      subscriptionStatus && !canCompleteFromActionsPage(subscriptionStatus)
                        ? 'cursor-not-allowed'
                        : ''
                    }`}
                    aria-label={subscriptionStatus && !canCompleteFromActionsPage(subscriptionStatus) ? "Upgrade to complete actions" : "Mark as complete"}
                    title={subscriptionStatus && !canCompleteFromActionsPage(subscriptionStatus) ? "Upgrade to Premium to complete actions from this page" : "Complete this action"}
                  >
                    <svg
                      className="w-4 h-4 text-primary-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    {action.icon && <span className="text-xl sm:text-2xl">{action.icon}</span>}
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-200">{personalizeText(action.name, partnerName)}</h3>
                      {isNewContent((action as any).created_at) && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs font-bold rounded-full border border-emerald-500/30 uppercase tracking-wide">
                          New
                        </span>
                      )}
                      {favoritedActionIds.has(action.id) && (
                        <span className="text-yellow-400 text-base sm:text-lg" title="Favorited">⭐</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-2">
                    {personalizeText(action.description, partnerName)}
                  </p>
                  {completionCount > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-primary-300 font-medium">
                        Completed {completionCount} time{completionCount !== 1 ? 's' : ''}
                      </p>
                      {latestCompletion && (
                        <p className="text-[10px] text-slate-500">
                          Latest: {format(new Date(latestCompletion.completed_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Modal */}
      {selectedAction && (
        <ActionCompletionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAction(null);
          }}
          action={selectedAction}
          onComplete={handleCompleteAction}
        />
      )}

      {/* Detail Modal */}
      {detailAction && (
        <ActionDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailAction(null);
          }}
          action={detailAction}
          showHideButton={true}
          partnerName={partnerName}
          isFavorited={detailAction ? favoritedActionIds.has(detailAction.id) : false}
          hasPremiumAccess={subscriptionStatus ? (subscriptionStatus.isOnPremium || subscriptionStatus.hasActiveTrial) : false}
          onHide={async () => {
            setIsHiding(true);
            try {
              const response = await fetch('/api/actions/hide', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ actionId: detailAction.id }),
              });

              if (!response.ok) {
                throw new Error('Failed to hide action');
              }

              toast.success('Action hidden. You won\'t see this one again.');
              // Remove from the list by refreshing
              window.location.reload();
            } catch (error) {
              console.error('Error hiding action:', error);
              toast.error('Failed to hide action. Please try again.');
            } finally {
              setIsHiding(false);
            }
          }}
        />
      )}
    </>
  );
}

