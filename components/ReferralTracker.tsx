'use client';

import { useEffect } from 'react';

export default function ReferralTracker() {
  useEffect(() => {
    // Check for referral code in sessionStorage
    const referralCode = sessionStorage.getItem('referralCode');
    
    if (referralCode) {
      // Track the referral
      fetch('/api/referrals/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralCode }),
      })
        .then((response) => {
          if (response.ok) {
            // Clear the referral code from sessionStorage after successful tracking
            sessionStorage.removeItem('referralCode');
          }
        })
        .catch((error) => {
          console.error('Error tracking referral:', error);
        });
    }
  }, []);

  return null; // This component doesn't render anything
}

