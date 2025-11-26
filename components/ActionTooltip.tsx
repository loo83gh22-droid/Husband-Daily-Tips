'use client';

import { useState, useEffect, useRef } from 'react';

interface ActionTooltipProps {
  userId: string;
  targetSelector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function ActionTooltip({ 
  userId, 
  targetSelector, 
  title, 
  content, 
  position = 'bottom' 
}: ActionTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const updatePosition = (element: HTMLElement) => {
    if (!tooltipRef.current) return;

    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top + scrollY - tooltipRect.height - 12;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollY + 12;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX - tooltipRect.width - 12;
        break;
      case 'right':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.right + scrollX + 12;
        break;
    }

    setTooltipPosition({ top, left });
  };

  const handleDontShowAgain = async () => {
    setIsHiding(true);
    try {
      localStorage.setItem(`action_tooltip_hidden_${targetSelector}_${userId}`, 'true');
      
      // Remove indicator
      if (targetRef.current) {
        const indicator = targetRef.current.querySelector('[data-tooltip-indicator]');
        if (indicator) {
          indicator.remove();
        }
      }

      // Store in database
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: `action_tooltip_hidden_${targetSelector}`,
          value: 'true',
        }),
      });

      setIsVisible(false);
    } catch (error) {
      console.error('Error hiding tooltip:', error);
      setIsVisible(false);
    } finally {
      setIsHiding(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[10000] bg-slate-900 border-2 border-primary-500 rounded-xl p-4 shadow-2xl max-w-xs pointer-events-auto"
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        transform: position === 'bottom' || position === 'top' ? 'translateX(-50%)' : position === 'right' ? 'translateY(-50%)' : 'translate(-100%, -50%)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-bold text-slate-50">{title}</h3>
        <button
          onClick={handleDontShowAgain}
          disabled={isHiding}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1 -mt-1 -mr-1"
          aria-label="Don't show this again"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed mb-3">{content}</p>
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={handleDontShowAgain}
          disabled={isHiding}
          className="text-xs text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
        >
          {isHiding ? 'Hiding...' : "Don't show again"}
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="px-3 py-1 text-xs font-semibold bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

