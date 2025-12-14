'use client';

import { useEffect, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureUTMParameters } from '@/lib/analytics';

/**
 * Internal component that uses useSearchParams
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
 * Only renders on client side to avoid static generation issues
 */
export default function UTMTracker() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render during static generation
  if (!isClient) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <UTMTrackerInner />
    </Suspense>
  );
}

