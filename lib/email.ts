/**
 * Email service using Resend
 * Install: npm install resend
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTip {
  title: string;
  content: string;
  category: string;
}

export async function sendTomorrowTipEmail(
  email: string,
  name: string,
  tip: EmailTip,
): Promise<boolean> {
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever - Tomorrow\'s Action! <action@besthusbandever.com>',
      to: email,
      subject: `Tomorrow's Action: ${tip.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tomorrow's Action</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">Best Husband Ever</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Level up your marriage game.</p>
              </div>
              
              <div style="background-color: #0f172a; border-radius: 8px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #0ea5e9;">
                <div style="margin-bottom: 15px;">
                  <span style="background-color: rgba(14, 165, 233, 0.1); color: #7dd3fc; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                    ${tip.category}
                  </span>
                </div>
                <h2 style="color: #f1f5f9; font-size: 22px; margin: 0 0 15px 0; font-weight: 600;">
                  ${tip.title}
                </h2>
                <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0; white-space: pre-line;">
                  ${tip.content}
                </p>
              </div>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                  Why you're seeing this now:
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
                  We're sending tomorrow's action today at 12pm so you have time to plan. No pressure—just a heads up so you can think about how to make it happen.
                </p>
              </div>
              
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <div style="margin: 15px 0; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                  <a href="${process.env.AUTH0_BASE_URL}/api/calendar/actions/download?days=1" 
                     style="display: inline-block; background-color: #0f172a; color: #0ea5e9; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; border: 2px solid #0ea5e9;">
                    📅 Download Tomorrow's Action
                  </a>
                  <a href="${process.env.AUTH0_BASE_URL}/api/calendar/actions/download?days=7" 
                     style="display: inline-block; background-color: #0f172a; color: #0ea5e9; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; border: 2px solid #0ea5e9;">
                    📅 Download 7 Days
                  </a>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin: 15px 0 0 0;">
                  You're receiving this because you signed up for Best Husband Ever.
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
                  <a href="${process.env.AUTH0_BASE_URL}/dashboard" style="color: #0ea5e9; text-decoration: none;">View Dashboard</a> | 
                  <a href="${process.env.AUTH0_BASE_URL}/dashboard/account" style="color: #0ea5e9; text-decoration: none;">Manage Preferences</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error sending email:', error);
    return false;
  }
}

