'use client';

import { useEffect } from 'react';
import { captureUTMParameters } from '@/lib/analytics';

/**
 * Component to capture and track UTM parameters from URL
 * Uses window.location directly instead of useSearchParams to avoid static generation issues
 * Should be placed in the root layout or main page
 */
export default function UTMTracker() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Capture UTM parameters when component mounts
    captureUTMParameters();
    
    // Also capture on navigation (for client-side routing)
    const handleLocationChange = () => {
      captureUTMParameters();
    };
    
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  return null;
}

