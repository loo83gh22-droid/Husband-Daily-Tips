'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Client component to handle scrolling to anchor links on page load
 * This ensures smooth scrolling works when navigating with hash fragments
 */
export default function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Wait for the page to fully render before scrolling
    const timer = setTimeout(() => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

