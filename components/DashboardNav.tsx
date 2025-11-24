'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import BrandLogo from './BrandLogo';
import HamburgerMenu from './HamburgerMenu';

export default function DashboardNav() {
  const pathname = usePathname();
  const { user, isLoading, error: userError } = useUser();
  const [displayName, setDisplayName] = useState<string | null>(null);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/actions', label: 'Actions', icon: '🎯' },
    { href: '/dashboard/badges', label: 'Badges', icon: '🏆' },
    { href: '/dashboard/journal', label: 'Journal', icon: '✒️' },
    { href: '/dashboard/team-wins', label: 'Team Wins', icon: '💪' },
    { href: '/dashboard/referrals', label: 'Referrals', icon: '🎁' },
    { href: '/dashboard/how-to-guides', label: 'How To Guides', icon: '🔧' },
  ];

  useEffect(() => {
    async function fetchDisplayName() {
      // Wait for Auth0 to finish loading
      if (isLoading) return;
      
      // If there's an error or no user, use fallback
      if (userError || !user) {
        setDisplayName(null);
        return;
      }
      
      try {
        const response = await fetch('/api/user/display-name', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setDisplayName(data.displayName || user?.name || null);
        } else {
          setDisplayName(user?.name || null);
        }
      } catch (error) {
        // Silently fail and use Auth0 name as fallback
        setDisplayName(user?.name || null);
      }
    }

    fetchDisplayName();
  }, [user, isLoading, userError]);

  return (
    <nav className="bg-slate-950/80 border-b border-slate-900 backdrop-blur sticky top-0 z-40" data-tour="navigation">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="nav" />
            {displayName && (
              <>
                <span className="text-base md:text-lg text-slate-300 font-semibold hidden md:inline">
                  is
                </span>
                <span className="text-base md:text-lg text-slate-300 font-semibold hidden md:inline">
                  {displayName}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 sm:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation active:scale-95 ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 active:bg-slate-800'
                  }`}
                >
                  <span className="hidden md:inline mr-1.5">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
            <HamburgerMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}

