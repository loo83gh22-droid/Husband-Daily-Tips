'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from './BrandLogo';

export default function DashboardNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/actions', label: 'Actions', icon: '🎯' },
    { href: '/dashboard/badges', label: 'Badges', icon: '🏆' },
    { href: '/dashboard/journal', label: 'Journal', icon: '📝' },
    { href: '/dashboard/team-wins', label: 'Team Wins', icon: '💪' },
    { href: '/dashboard/how-to-guides', label: 'How To Guides', icon: '🔧' },
  ];

  return (
    <nav className="bg-slate-950/80 border-b border-slate-900 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <BrandLogo variant="nav" />

          <div className="flex items-center gap-1 md:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="hidden md:inline mr-1.5">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/api/auth/logout"
              prefetch={false}
              className="px-3 py-2 text-xs md:text-sm font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              <span className="hidden md:inline mr-1.5">🚪</span>
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

