'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackEvent, trackSignup, trackSurveyCompletion, trackSubscription, trackActionCompletion, trackFacebookSignup, trackFacebookPurchase } from '@/lib/analytics';

interface AnalyticsTrackerProps {
  isNewUser?: boolean;
  surveyCompleted?: boolean;
  subscriptionTier?: string;
  subscriptionPrice?: number;
}

/**
 * Client-side component to track analytics events
 * Handles signup, survey completion, subscription, and other events
 */
export default function AnalyticsTracker({
  isNewUser = false,
  surveyCompleted = false,
  subscriptionTier,
  subscriptionPrice,
}: AnalyticsTrackerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track signup for new users (first time visiting dashboard)
    // Use a combination of isNewUser flag and localStorage to ensure we track once
    if (isNewUser) {
      // Check if we've already tracked this signup (using localStorage for persistence across sessions)
      const signupTracked = localStorage.getItem('signup_tracked') || sessionStorage.getItem('signup_tracked');
      if (!signupTracked) {
        // Determine signup method (we'll default to email, could be enhanced)
        const signupMethod = 'email'; // Could check Auth0 connection type if available
        trackSignup(signupMethod);
        trackFacebookSignup(signupMethod);
        // Store in both localStorage and sessionStorage
        localStorage.setItem('signup_tracked', 'true');
        sessionStorage.setItem('signup_tracked', 'true');
      }
    }

    // Track survey completion (check URL params or localStorage)
    const surveyCompletedParam = searchParams?.get('survey_completed');
    const surveyTracked = sessionStorage.getItem('survey_tracked');
    
    if ((surveyCompleted || surveyCompletedParam === 'true') && !surveyTracked) {
      trackSurveyCompletion();
      sessionStorage.setItem('survey_tracked', 'true');
    }

    // Track subscription success
    const subscriptionSuccess = searchParams?.get('success');
    const subscriptionTracked = sessionStorage.getItem('subscription_tracked');
    
    if (subscriptionSuccess === 'true' && subscriptionTier && subscriptionPrice && !subscriptionTracked) {
      const tier = subscriptionTier === 'premium' ? 'premium' : 'pro';
      trackSubscription(tier, subscriptionPrice);
      trackFacebookPurchase(subscriptionPrice);
      sessionStorage.setItem('subscription_tracked', 'true');
    }
  }, [isNewUser, surveyCompleted, searchParams, subscriptionTier, subscriptionPrice]);

  return null; // This component doesn't render anything
}

/**
 * Hook to track action completion
 * Call this from components that complete actions
 */
export function useTrackActionCompletion() {
  return (actionName: string, actionCategory: string, actionId?: string) => {
    trackActionCompletion(actionName, actionCategory, actionId);
  };
}

