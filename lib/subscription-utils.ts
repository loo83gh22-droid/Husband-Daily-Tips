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
 * All users can now complete any action - no restrictions
 * (Previously had restrictions for free users, but we're making everything free to focus on growth)
 */
export function canCompleteFromActionsPage(status: SubscriptionStatus): boolean {
  return true; // All users can complete actions
}

/**
 * Check if user can access the journal
 * All users can now access journal - no restrictions
 * (Previously had restrictions for free users, but we're making everything free to focus on growth)
 */
export function canAccessJournal(status: SubscriptionStatus): boolean {
  return true; // All users can access journal
}

