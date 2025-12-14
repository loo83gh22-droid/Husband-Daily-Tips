'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureUTMParameters } from '@/lib/analytics';

/**
 * Internal component that uses useSearchParams
 * Wrapped in Suspense to satisfy Next.js requirements
 */
function UTMTrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Capture UTM parameters when component mounts or URL changes
    captureUTMParameters();
  }, [searchParams]);

  return null;
}

/**
 * Component to capture and track UTM parameters from URL
 * Should be placed in the root layout or main page
 * Wrapped in Suspense to satisfy Next.js requirements
 */
export default function UTMTracker() {
  return (
    <Suspense fallback={null}>
      <UTMTrackerInner />
    </Suspense>
  );
}

