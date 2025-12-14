'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureUTMParameters } from '@/lib/analytics';

/**
 * Component to capture and track UTM parameters from URL
 * Should be placed in the root layout or main page
 */
export default function UTMTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Capture UTM parameters when component mounts or URL changes
    captureUTMParameters();
  }, [searchParams]);

  return null;
}

