import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Session } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

/**
 * After Auth0 callback, create user in Supabase if they don't exist
 * This ensures users are created immediately after authentication,
 * not just when they visit the dashboard
 * 
 * Note: App Router signature is (req, session, state?) - no res parameter
 */
async function afterCallback(req: NextRequest, session: Session, state?: Record<string, any>): Promise<Session | undefined> {
  if (!session?.user?.sub) {
    return session;
  }

  const auth0Id = session.user.sub;
  const email = session.user.email;
  const name = session.user.name || email || null;

  if (!email) {
    console.error('No email in Auth0 session, cannot create user');
    return session;
  }

  try {
    const adminSupabase = getSupabaseAdmin();
    
    // Check if user already exists
    const { data: existingUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    // If user doesn't exist, create them
    if (!existingUser) {
      const { data: newUser, error } = await adminSupabase
        .from('users')
        .insert({
          auth0_id: auth0Id,
          email: email,
          name: name,
          subscription_tier: 'free',
          survey_completed: false,
        })
        .select()
        .single();

      if (error) {
        // If duplicate key error, user was created between check and insert
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          console.log('User already exists (race condition), continuing...');
        } else {
          console.error('Error creating user in afterCallback:', error);
          // Don't fail the auth flow, just log the error
        }
      } else if (newUser && process.env.RESEND_API_KEY) {
        // Send welcome email for new users (fire and forget)
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          const displayName = name ? name.split(' ')[0] : 'there';
          const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
            to: email,
            subject: 'Welcome to Best Husband Ever! 🎉',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #0f172a; font-size: 28px; margin: 0 0 10px 0;">Welcome to Best Husband Ever! 🎉</h1>
                      <p style="color: #64748b; font-size: 16px; margin: 0;">You're all set to start your journey</p>
                    </div>
                    
                    <div style="background-color: #0f172a; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                      <p style="color: #cbd5e1; font-size: 18px; margin: 0 0 15px 0;">Hey ${displayName},</p>
                      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                        Thanks for joining! You're all set to start receiving daily personalized actions that will help you become the husband your partner deserves.
                      </p>
                      <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0;">
                        You're starting with a free account, which gives you access to daily actions and all the core features.
                      </p>
                    </div>
                    
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                      <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">What to expect:</h2>
                      <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;"><strong>Daily Action Emails:</strong> You'll receive your action every day at 12 noon in your timezone (you can set this in your Account Settings)</li>
                        <li style="margin-bottom: 8px;"><strong>Personalized Actions:</strong> Based on your survey, relationship goals, and preferences</li>
                        <li style="margin-bottom: 8px;"><strong>Progress Tracking:</strong> Track your Husband Health score, streaks, and badges</li>
                        <li style="margin-bottom: 8px;"><strong>Private Journal:</strong> Log your wins and see your progress over time</li>
                        <li style="margin-bottom: 8px;"><strong>Team Wins:</strong> Share your completed actions with your partner</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                      <h2 style="color: #1e40af; font-size: 18px; margin: 0 0 12px 0;">✨ Get the Most Out of Your Account:</h2>
                      <p style="color: #1e3a8a; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
                        <strong>Personalize your experience</strong> by updating your Account Settings with:
                      </p>
                      <ul style="color: #1e3a8a; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li style="margin-bottom: 6px;">Your partner's name (for personalized action messages)</li>
                        <li style="margin-bottom: 6px;">Your partner's birthday (for birthday-specific actions and reminders)</li>
                        <li style="margin-bottom: 6px;">Your wedding date (to track years married in Team Wins and serve time-appropriate anniversary actions)</li>
                        <li style="margin-bottom: 6px;">Your timezone (so daily emails arrive at the perfect time)</li>
                        <li style="margin-bottom: 6px;">Your work days (so we're mindful of when we're serving specific actions, especially those that require some more planning)</li>
                      </ul>
                      <p style="color: #1e3a8a; font-size: 13px; margin: 12px 0 0 0; font-style: italic;">
                        The more details you share, the more personalized and relevant your daily actions will be!
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="${baseUrl}/dashboard" 
                         style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 15px;">
                        Go to Dashboard →
                      </a>
                      <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">
                        Complete your survey if you haven't already to get personalized actions
                      </p>
                    </div>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                      <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600; margin-bottom: 5px;">💡 Pro Tip:</p>
                      <p style="color: #78350f; font-size: 13px; margin: 0;">
                        Consistency is key. Small daily actions compound into big relationship improvements. Show up every day, even when it's hard.
                      </p>
                    </div>
                    
                    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                        Questions? Just reply to this email—we're here to help.
                      </p>
                      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                        You're receiving this because you signed up for Best Husband Ever.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
          console.log(`✅ Welcome email sent to ${email}`);
        } catch (emailError: any) {
          // Don't fail auth if email fails
          console.error('Error sending welcome email:', emailError);
        }
      }
    }
  } catch (error: any) {
    console.error('Error in afterCallback:', error);
    // Don't fail the auth flow if user creation fails
    // User can still be created when they visit the dashboard
  }

  return session;
};

export const GET = handleAuth({
  callback: handleCallback({ afterCallback }),
});


