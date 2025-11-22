'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  category: string;
}

export default function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Show help modal with ?
      if (event.key === '?' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Only trigger shortcuts with modifier keys (Ctrl/Cmd) or Escape
      if (event.key === 'Escape') {
        setShowHelp(false);
        return;
      }

      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      // Define shortcuts based on current page
      const shortcuts: Record<string, () => void> = {
        // Global shortcuts
        'k': () => {
          // Quick actions menu (if on dashboard)
          if (pathname === '/dashboard') {
            const quickActionsBtn = document.querySelector('[data-quick-actions] button');
            if (quickActionsBtn) {
              (quickActionsBtn as HTMLElement).click();
            }
          }
        },
        'm': () => {
          // Mark today's action done (if on dashboard)
          if (pathname === '/dashboard') {
            // Try to find the mark done button
            const buttons = Array.from(document.querySelectorAll('button'));
            const markDoneBtn = buttons.find((btn) => 
              btn.textContent?.includes('Mark as done') || 
              btn.textContent?.includes('Mark Done')
            );
            if (markDoneBtn && !markDoneBtn.disabled) {
              markDoneBtn.click();
            }
          }
        },
        'j': () => {
          // Go to Journal
          router.push('/dashboard/journal');
        },
        'b': () => {
          // Go to Badges
          router.push('/dashboard/badges');
        },
        'a': () => {
          // Go to Actions
          router.push('/dashboard/actions');
        },
        'd': () => {
          // Go to Dashboard
          router.push('/dashboard');
        },
        't': () => {
          // Go to Team Wins
          router.push('/dashboard/team-wins');
        },
        'g': () => {
          // Go to How-To Guides
          router.push('/dashboard/how-to-guides');
        },
      };

      const key = event.key.toLowerCase();
      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, pathname]);

  const shortcuts: Array<{ key: string; description: string; category: string }> = [
    { key: '?', description: 'Show keyboard shortcuts', category: 'General' },
    { key: 'Ctrl/Cmd + K', description: 'Open quick actions', category: 'Navigation' },
    { key: 'Ctrl/Cmd + D', description: 'Go to Dashboard', category: 'Navigation' },
    { key: 'Ctrl/Cmd + J', description: 'Go to Journal', category: 'Navigation' },
    { key: 'Ctrl/Cmd + B', description: 'Go to Badges', category: 'Navigation' },
    { key: 'Ctrl/Cmd + A', description: 'Go to Actions', category: 'Navigation' },
    { key: 'Ctrl/Cmd + T', description: 'Go to Team Wins', category: 'Navigation' },
    { key: 'Ctrl/Cmd + G', description: 'Go to How-To Guides', category: 'Navigation' },
    { key: 'Ctrl/Cmd + M', description: 'Mark today\'s action done', category: 'Actions' },
    { key: 'Esc', description: 'Close modals/help', category: 'General' },
  ];

  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <AnimatePresence>
      {showHelp && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
            className="fixed inset-0 bg-black/70 z-[10000]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-slate-900 border-2 border-primary-500 rounded-xl p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-50">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-slate-400 hover:text-slate-200 text-2xl"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-primary-300 mb-3 uppercase tracking-wide">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg"
                        >
                          <span className="text-sm text-slate-300">{shortcut.description}</span>
                          <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs font-mono text-slate-200">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-400 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-xs">?</kbd> anytime to see this help
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

