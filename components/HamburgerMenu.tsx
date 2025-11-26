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

  // Prevent body scroll when menu is open and handle backdrop clicks
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Close on Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = '';
    }
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
    { href: '/dashboard/about', label: 'Why Best Husband Ever' },
    { href: '/dashboard/account', label: 'Profile & Account Settings' },
    { href: '/dashboard/subscription', label: 'Pricing & Subscriptions' },
    { href: '/dashboard/payments', label: 'Payments' },
    { href: '/dashboard/referrals', label: 'Referrals' },
    { href: '/dashboard/feedback', label: 'Share Your Thoughts', highlight: true },
  ];

  return (
    <div className="relative z-[110]" data-hamburger-menu>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors touch-manipulation"
        aria-label="Menu"
        aria-expanded={isOpen}
        type="button"
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
          {/* Backdrop - always show on all screen sizes */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
            onTouchStart={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {/* Menu - fixed position overlay that doesn't affect layout */}
          <div className="fixed top-16 right-2 md:right-4 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-[110] overflow-hidden max-h-[calc(100vh-5rem)] overflow-y-auto">
            {/* Close button - more prominent */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-slate-200">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
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
                <span>Terms & Policies</span>
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

