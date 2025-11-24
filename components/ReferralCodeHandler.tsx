'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralCodeHandler() {
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

