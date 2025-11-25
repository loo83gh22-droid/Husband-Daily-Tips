'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-hamburger-menu]')) {
        setIsOpen(false);
      }
    };

    // Use both mouse and touch events for mobile compatibility
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/actions', label: 'Actions' },
    { href: '/dashboard/badges', label: 'Badges' },
    { href: '/dashboard/journal', label: 'Journal' },
    { href: '/dashboard/team-wins', label: 'Team Wins' },
    { href: '/dashboard/how-to-guides', label: 'How To Guides' },
  ];

  const menuItems = [
    { href: '/dashboard/referrals', label: 'Referrals' },
    { href: '/dashboard/about', label: 'About' },
    { href: '/dashboard/subscription', label: 'Pricing & Subscriptions' },
    { href: '/dashboard/payments', label: 'Payments' },
    { href: '/dashboard/account', label: 'Profile & Account Settings' },
    { href: '/dashboard/feedback', label: 'Share Your Thoughts', highlight: true },
  ];

  return (
    <div className="relative" data-hamburger-menu>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors touch-manipulation"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 z-[100] md:hidden"
            onClick={() => setIsOpen(false)}
            onTouchStart={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-[110] overflow-hidden max-h-[90vh] overflow-y-auto md:relative md:z-50">
          <div className="py-2">
            {/* Navigation Links - Show on mobile, hidden on desktop (since they're in the nav bar) */}
            <div className="md:hidden border-b border-slate-800 pb-2 mb-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-300 border-l-2 border-primary-500'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Menu Items */}
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-300 border-l-2 border-primary-500'
                      : item.highlight
                      ? 'text-primary-300 hover:bg-primary-500/10 hover:text-primary-200'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="border-t border-slate-800 mt-2 pt-2 space-y-1">
              <Link
                href="/legal/terms"
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <span>Terms of Service</span>
              </Link>
              <Link
                href="/legal/privacy"
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <span>Privacy Policy</span>
              </Link>
              <Link
                href="/api/auth/logout"
                prefetch={false}
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              >
                <span>Sign Out</span>
              </Link>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

