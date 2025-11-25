'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from './Toast';
import ActionDetailModal from './ActionDetailModal';

interface HiddenAction {
  hiddenId: string;
  hiddenAt: string;
  id: string;
  name: string;
  description: string;
  category: string;
  theme?: string;
  icon?: string | null;
  benefit?: string | null;
  requirement_type?: string | null;
}

export default function HiddenActionsManager() {
  const [hiddenActions, setHiddenActions] = useState<HiddenAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnhiding, setIsUnhiding] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<HiddenAction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchHiddenActions();
  }, []);

  const fetchHiddenActions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/actions/hidden');
      if (!response.ok) {
        throw new Error('Failed to fetch hidden actions');
      }
      const data = await response.json();
      setHiddenActions(data.hiddenActions || []);
    } catch (error) {
      console.error('Error fetching hidden actions:', error);
      toast.error('Failed to load hidden actions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnhide = async (actionId: string) => {
    setIsUnhiding(actionId);
    try {
      const response = await fetch(`/api/actions/hide?actionId=${actionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unhide action');
      }

      toast.success('Action unhidden! It will appear in your recommendations again.');
      // Remove from list
      setHiddenActions(prev => prev.filter(action => action.id !== actionId));
    } catch (error) {
      console.error('Error unhiding action:', error);
      toast.error('Failed to unhide action. Please try again.');
    } finally {
      setIsUnhiding(null);
    }
  };

  const handleViewDetails = (action: HiddenAction) => {
    setSelectedAction(action);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Loading hidden actions...</p>
      </div>
    );
  }

  if (hiddenActions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 mb-2">You haven't hidden any actions.</p>
        <p className="text-xs text-slate-500">
          Hidden actions won't appear in your daily recommendations.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {hiddenActions.map((action) => (
          <div
            key={action.hiddenId}
            className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleViewDetails(action)}
              >
                <div className="flex items-start gap-2 mb-2">
                  {action.icon && <span className="text-lg">{action.icon}</span>}
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">
                      {action.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="px-2 py-0.5 bg-slate-700/50 rounded">
                        {action.category}
                      </span>
                      <span>
                        Hidden: {format(new Date(action.hiddenAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleUnhide(action.id)}
                disabled={isUnhiding === action.id}
                className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-medium rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-default whitespace-nowrap"
              >
                {isUnhiding === action.id ? 'Unhiding...' : 'Unhide'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedAction && (
        <ActionDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAction(null);
          }}
          action={selectedAction}
        />
      )}
    </>
  );
}

