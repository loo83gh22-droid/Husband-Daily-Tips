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
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/actions', label: 'Actions' },
    { href: '/dashboard/badges', label: 'Badges' },
    { href: '/dashboard/journal', label: 'Journal' },
    { href: '/dashboard/team-wins', label: 'Team Wins' },
    { href: '/dashboard/how-to-guides', label: 'How To Guides' },
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
          setProfilePicture(data.profilePicture || null);
        } else {
          setDisplayName(user?.name || null);
          setProfilePicture(null);
        }
      } catch (error) {
        // Silently fail and use Auth0 name as fallback
        setDisplayName(user?.name || null);
        setProfilePicture(null);
      }
    }

    fetchDisplayName();
  }, [user, isLoading, userError]);

  return (
    <nav className="bg-slate-950/80 border-b border-slate-900 backdrop-blur sticky top-0 z-50" data-tour="navigation">
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 max-w-7xl mx-auto overflow-x-hidden">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-shrink">
            <BrandLogo variant="nav" />
            {displayName && (
              <>
                <span className="text-xs sm:text-sm md:text-base text-slate-300 font-semibold hidden sm:inline">
                  is
                </span>
                <Link 
                  href="/dashboard/account"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt={displayName}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-700 hidden sm:block"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center hidden sm:flex">
                      <span className="text-xs sm:text-sm font-semibold text-primary-300">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-xs sm:text-sm md:text-base text-slate-300 font-semibold hidden sm:inline truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
                    {displayName}
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Show only Dashboard link + Hamburger. Desktop: Show all links */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-shrink-0">
            {/* On mobile, only show Dashboard link. On desktop, show all links */}
            {navLinks.map((link) => {
              // For exact matches or sub-paths (but not for /dashboard matching /dashboard/badges)
              const isExactMatch = pathname === link.href || pathname === link.href + '/';
              const isSubPath = pathname?.startsWith(link.href + '/');
              // Only use sub-path matching if it's not the dashboard root (to avoid highlighting dashboard when on sub-pages)
              const isActive = link.href === '/dashboard' 
                ? isExactMatch 
                : (isExactMatch || isSubPath);
              
              // On mobile, only show Dashboard. On desktop (md and up), show all links including Dashboard
              const isDashboard = link.href === '/dashboard';
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation active:scale-95 ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 active:bg-slate-800'
                  } ${isDashboard ? 'block' : 'hidden md:block'}`}
                >
                  <span className="hidden sm:inline">{link.label}</span>
                  <span className="sm:hidden">{link.label.split(' ')[0]}</span>
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

