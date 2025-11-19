'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/challenges', label: 'Challenges', icon: '🎯' },
    { href: '/dashboard/how-to-guides', label: 'How To Guides', icon: '🔧' },
    { href: '/dashboard/hell-yeahs', label: 'Hell Yeahs', icon: '💪' },
    { href: '/dashboard/badges', label: 'Badges', icon: '🏆' },
    { href: '/dashboard/journal', label: 'Journal', icon: '📝' },
  ];

  return (
    <nav className="bg-slate-950/80 border-b border-slate-900 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary-600/10 border border-primary-500/40">
              <span className="text-sm font-semibold text-primary-400">HD</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-slate-100">
                Husband Daily Tips
              </h1>
              <p className="text-[11px] text-slate-500">Level up your marriage game.</p>
            </div>
          </Link>

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
              className="px-3 py-2 text-xs md:text-sm text-slate-200 border border-slate-700 rounded-lg hover:bg-slate-900 transition-colors ml-2"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

