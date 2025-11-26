/**
 * Utility functions for subscription tier checks
 */

export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  hasActiveTrial: boolean;
  hasSubscription: boolean;
  isOnPremium: boolean;
}

/**
 * Check if user has premium access (either active subscription or trial)
 */
export function hasPremiumAccess(status: SubscriptionStatus): boolean {
  return status.isOnPremium || status.hasActiveTrial;
}

/**
 * Check if user can complete actions from the actions page
 * Free users can only complete the daily served action
 */
export function canCompleteFromActionsPage(status: SubscriptionStatus): boolean {
  return hasPremiumAccess(status);
}

/**
 * Check if user can access the journal
 * Free users cannot access journal
 */
export function canAccessJournal(status: SubscriptionStatus): boolean {
  return hasPremiumAccess(status);
}

