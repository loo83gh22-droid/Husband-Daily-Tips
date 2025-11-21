'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const [displayName, setDisplayName] = useState<string>('User');
  const [isClient, setIsClient] = useState(false);

  // Only run on client to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch display name from API (only on client)
  useEffect(() => {
    if (!isClient || !user) return;

    async function fetchDisplayName() {
      try {
        const response = await fetch('/api/user/display-name');
        if (response.ok) {
          const data = await response.json();
          if (data.displayName) {
            setDisplayName(data.displayName);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching display name:', error);
      }
      // Fallback to Auth0 user data if API fails
      if (user?.name) {
        setDisplayName(user.name.split(' ')[0]);
      } else if (user?.email) {
        setDisplayName(user.email);
      }
    }
    fetchDisplayName();
  }, [user, isClient]);

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
    { href: '/dashboard/subscription', label: 'Subscription & Pricing', icon: '💳', description: '7-day free trial, then Free or Paid' },
    { href: '/dashboard/account', label: 'Account Settings', icon: '⚙️' },
    { href: '/dashboard/payments', label: 'Payment Methods', icon: '💵' },
    { href: '/dashboard/billing', label: 'Billing History', icon: '📄' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
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
              {isClient ? displayName : (user?.name?.split(' ')[0] || user?.email || 'User')}
            </p>
          </div>
          
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <span className="text-lg mt-0.5">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                  )}
                </div>
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

