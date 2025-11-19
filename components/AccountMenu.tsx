'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    { href: '/dashboard/subscription', label: 'Subscription & Pricing', icon: '💳' },
    { href: '/dashboard/account', label: 'Account Settings', icon: '⚙️' },
    { href: '/dashboard/payments', label: 'Payment Methods', icon: '💵' },
    { href: '/dashboard/billing', label: 'Billing History', icon: '📄' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
        aria-label="Account menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-800">
            <p className="text-xs text-slate-500 mb-1">Signed in as</p>
            <p className="text-sm font-medium text-slate-200 truncate">
              {user?.name || user?.email || 'User'}
            </p>
          </div>
          
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-800 py-1">
            <Link
              href="/api/auth/logout"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-slate-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

