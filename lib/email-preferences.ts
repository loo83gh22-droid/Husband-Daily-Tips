/**
 * Email preferences helper functions
 * Used to check if a user should receive a specific type of email
 */

import { getSupabaseAdmin } from './supabase';

export type EmailType =
  | 'daily_actions'
  | 'surveys'
  | 'marketing'
  | 'updates'
  | 'challenges'
  | 'trial_reminders';

/**
 * Check if a user should receive a specific type of email
 * @param userId - User ID to check
 * @param emailType - Type of email to check
 * @returns true if user should receive the email, false otherwise
 */
export async function shouldSendEmail(
  userId: string,
  emailType: EmailType
): Promise<boolean> {
  try {
    const adminSupabase = getSupabaseAdmin();

    // Use the database function for efficiency
    const { data, error } = await adminSupabase.rpc('should_send_email', {
      p_user_id: userId,
      p_email_type: emailType,
    });

    if (error) {
      // If function doesn't exist or fails, fall back to manual check
      console.warn('Error calling should_send_email function, falling back to manual check:', error);
      return await shouldSendEmailManual(userId, emailType);
    }

    return data === true;
  } catch (error) {
    console.error('Error checking email preferences:', error);
    // Default to true for backward compatibility
    return true;
  }
}

/**
 * Manual check if database function is not available
 */
async function shouldSendEmailManual(
  userId: string,
  emailType: EmailType
): Promise<boolean> {
  try {
    const adminSupabase = getSupabaseAdmin();

    const { data: user, error } = await adminSupabase
      .from('users')
      .select('email_preferences')
      .eq('id', userId)
      .single();

    if (error || !user) {
      // Default to true if user not found (backward compatibility)
      return true;
    }

    const preferences = user.email_preferences as Record<string, boolean> | null;

    if (!preferences) {
      // Default to true if preferences don't exist (backward compatibility)
      return true;
    }

    // Get the value for the specific email type, default to true
    return preferences[emailType] !== false;
  } catch (error) {
    console.error('Error in manual email preference check:', error);
    // Default to true for backward compatibility
    return true;
  }
}

/**
 * Generate unsubscribe token for email links
 * @param userId - User ID
 * @param emailType - Type of email
 * @returns Base64 encoded token
 */
export function generateUnsubscribeToken(
  userId: string,
  emailType: EmailType
): string {
  const timestamp = Date.now().toString();
  const tokenString = `${userId}:${emailType}:${timestamp}`;
  return Buffer.from(tokenString).toString('base64');
}

/**
 * Generate unsubscribe URL for email links
 * @param userId - User ID
 * @param emailType - Type of email
 * @returns Full unsubscribe URL
 */
export function generateUnsubscribeUrl(
  userId: string,
  emailType: EmailType
): string {
  const baseUrl =
    process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';
  const token = generateUnsubscribeToken(userId, emailType);
  return `${baseUrl}/api/email/unsubscribe?token=${token}&type=${emailType}`;
}

