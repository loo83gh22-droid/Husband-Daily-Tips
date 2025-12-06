/**
 * Google Analytics event tracking utility
 * Only tracks if NEXT_PUBLIC_GA_ID is set
 */

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  eventParams?: {
    [key: string]: string | number | boolean | undefined | any;
  }
): void {
  // Only track if gtag is available (GA is loaded) and we're in the browser
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...eventParams,
      // Add timestamp for debugging
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Track user signup
 */
export function trackSignup(method: 'email' | 'google' = 'email'): void {
  trackEvent('signup', {
    method,
    event_category: 'engagement',
    event_label: 'User Registration',
  });
}

/**
 * Track survey completion
 */
export function trackSurveyCompletion(): void {
  trackEvent('survey_completion', {
    event_category: 'engagement',
    event_label: 'Husband Score Test',
  });
}

/**
 * Track subscription purchase
 */
export function trackSubscription(
  tier: 'premium' | 'pro',
  price: number,
  currency: string = 'USD'
): void {
  trackEvent('purchase', {
    event_category: 'ecommerce',
    event_label: `Subscription - ${tier}`,
    value: price,
    currency,
    // Additional ecommerce data
    items: [
      {
        item_id: tier,
        item_name: `${tier} Subscription`,
        price,
        quantity: 1,
      },
    ],
  });

  // Also track as a separate subscription event
  trackEvent('subscription', {
    event_category: 'ecommerce',
    event_label: tier,
    value: price,
    currency,
  });
}

/**
 * Track action completion
 */
export function trackActionCompletion(
  actionName: string,
  actionCategory: string,
  actionId?: string
): void {
  trackEvent('action_completion', {
    event_category: 'engagement',
    event_label: actionName,
    action_name: actionName,
    action_category: actionCategory,
    action_id: actionId,
  });
}

/**
 * Track page view (for client-side navigation)
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: path,
      page_title: title,
    });
  }
}

