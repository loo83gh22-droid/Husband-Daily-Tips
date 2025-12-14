'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ReferralCodeHandlerInner() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  useEffect(() => {
    if (refCode) {
      // Store referral code in sessionStorage
      sessionStorage.setItem('referralCode', refCode.toUpperCase());
    }
  }, [refCode]);

  return null; // This component doesn't render anything
}

export default function ReferralCodeHandler() {
  return (
    <Suspense fallback={null}>
      <ReferralCodeHandlerInner />
    </Suspense>
  );
}

