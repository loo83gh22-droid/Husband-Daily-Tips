'use client';

import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'nav' | 'hero' | 'footer';
  showTagline?: boolean;
}

export default function BrandLogo({ variant = 'nav', showTagline = true }: BrandLogoProps) {
  const isNav = variant === 'nav';
  const isHero = variant === 'hero';

  return (
    <Link href={isNav ? '/dashboard' : '/'} className="flex items-center gap-2 group">
      <div
        className={`inline-flex items-center justify-center rounded-md bg-primary-500 group-hover:bg-primary-400 transition-colors ${
          isHero ? 'h-12 w-12' : 'h-8 w-8'
        }`}
      >
        <span className={`font-bold text-slate-950 ${isHero ? 'text-2xl' : 'text-lg'}`}>
          B
        </span>
      </div>
      <div>
        <h1
          className={`font-bold tracking-wide text-slate-100 ${
            isHero ? 'text-2xl md:text-3xl' : 'text-sm'
          }`}
        >
          Best Husband Ever
        </h1>
        {showTagline && (
          <p
            className={`text-slate-500 ${
              isHero ? 'text-sm md:text-base mt-1' : 'text-[11px]'
            }`}
          >
            Your daily mission, delivered.
          </p>
        )}
      </div>
    </Link>
  );
}

