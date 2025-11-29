'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  color?: string;
}

interface QuickActionsProps {
  todayActionId?: string;
  todayActionCompleted?: boolean;
  outstandingActionsCount?: number;
}

export default function QuickActions({ 
  todayActionId, 
  todayActionCompleted = false,
  outstandingActionsCount = 0 
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Close when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-quick-actions]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleMarkTodayDone = async () => {
    if (!todayActionId || todayActionCompleted || isMarkingDone) return;

    setIsMarkingDone(true);
    try {
      const response = await fetch('/api/actions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionId: todayActionId }),
      });

      if (response.ok) {
        // Refresh the page to show updated state
        router.refresh();
        setIsOpen(false);
      } else {
        console.error('Failed to mark action as done');
      }
    } catch (error) {
      console.error('Error marking action as done:', error);
    } finally {
      setIsMarkingDone(false);
    }
  };

  const actions: QuickAction[] = [
    {
      id: 'mark-done',
      label: todayActionCompleted ? 'Already Done' : 'Mark Today Done',
      icon: todayActionCompleted ? '✅' : '✓',
      action: handleMarkTodayDone,
      color: todayActionCompleted ? 'bg-slate-600' : 'bg-emerald-500',
    },
    {
      id: 'journal',
      label: 'View Journal',
      icon: '✒️',
      action: () => {
        router.push('/dashboard/journal');
        setIsOpen(false);
      },
    },
    {
      id: 'badges',
      label: 'Check Badges',
      icon: '🏆',
      action: () => {
        router.push('/dashboard/badges');
        setIsOpen(false);
      },
    },
    {
      id: 'outstanding',
      label: `Outstanding (${outstandingActionsCount})`,
      icon: '📋',
      action: () => {
        // Scroll to outstanding actions section on dashboard
        const element = document.getElementById('outstanding-actions');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // If not on dashboard, navigate to dashboard with anchor
          router.push('/dashboard#outstanding-actions');
        }
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-40" data-quick-actions>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={action.action}
                disabled={
                  (action.id === 'mark-done' && (todayActionCompleted || isMarkingDone || !todayActionId)) ||
                  (action.id === 'outstanding' && outstandingActionsCount === 0)
                }
                className={`
                  flex items-center gap-3 px-4 py-3.5 sm:py-3
                  bg-slate-900 border-2 border-slate-700 
                  rounded-xl shadow-lg 
                  text-slate-100 text-sm font-semibold
                  hover:bg-slate-800 hover:border-primary-500/50
                  active:bg-slate-700 active:scale-95
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  min-w-[200px] min-h-[48px]
                  touch-manipulation
                  ${action.color && action.id === 'mark-done' ? action.color : ''}
                `}
              >
                <span className="text-lg">{action.icon}</span>
                <span>{action.label}</span>
                {isMarkingDone && action.id === 'mark-done' && (
                  <span className="ml-auto animate-spin">⏳</span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-16 h-16 sm:w-14 sm:h-14 rounded-full 
          bg-primary-500 text-slate-950 
          shadow-lg hover:bg-primary-400 active:bg-primary-600
          flex items-center justify-center
          text-2xl font-bold
          transition-all duration-200
          touch-manipulation
          ${isOpen ? 'rotate-45' : ''}
        `}
        aria-label="Quick actions"
      >
        {isOpen ? '✕' : '⚡'}
      </motion.button>
    </div>
  );
}

