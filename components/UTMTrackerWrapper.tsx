'use client';

import dynamic from 'next/dynamic';

// Dynamically import UTMTracker with SSR disabled
// This wrapper is needed because ssr: false can only be used in Client Components
const UTMTracker = dynamic(() => import('@/components/UTMTracker'), {
  ssr: false,
});

export default function UTMTrackerWrapper() {
  return <UTMTracker />;
}

