/**
 * Email service using Resend
 * Install: npm install resend
 */

import { Resend } from 'resend';

// Initialize Resend - will be validated in send function
const resend = new Resend(process.env.RESEND_API_KEY || '');

export interface EmailTip {
  title: string;
  content: string;
  category: string;
  actionId?: string; // Added for calendar links
  userId?: string; // Added for calendar links
  quote?: { quote_text: string; author: string | null }; // Optional quote to include
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

  const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever Tomorrow\'s Action! <action@besthusbandever.com>',
      to: email,
      subject: `Tomorrow: Make Her Smile (Here's How)`,
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
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Your daily action, delivered.</p>
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
                  Here&apos;s the deal:
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
                  Tomorrow&apos;s action arrives today at 12pm. Why? Because winners plan ahead, and that&apos;s what you&apos;re becoming. Plus, it gives you time to actually make it happen. No scrambling, no forgetting, just execution. You got this.
                </p>
              </div>
              
              ${tip.quote ? `
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                  <p style="color: #78350f; font-size: 15px; font-style: italic; margin: 0 0 8px 0; line-height: 1.6;">
                    "${tip.quote.quote_text}"
                  </p>
                  ${tip.quote.author ? `
                    <p style="color: #92400e; font-size: 13px; margin: 0; text-align: right;">
                      — ${tip.quote.author}
                    </p>
                  ` : ''}
                </div>
              ` : ''}
              
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <a href="${baseUrl}/dashboard" 
                   style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-bottom: 10px;">
                  View in Dashboard →
                </a>
                ${tip.actionId && tip.userId ? `
                  <div style="margin: 15px 0; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <a href="${baseUrl}/api/calendar/actions/download?days=1&userId=${tip.userId}" 
                       style="display: inline-block; background-color: #0f172a; color: #0ea5e9; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; border: 2px solid #0ea5e9;">
                      📅 Download Tomorrow's Action
                    </a>
                    <a href="${baseUrl}/api/calendar/actions/download?days=7&userId=${tip.userId}" 
                       style="display: inline-block; background-color: #0f172a; color: #0ea5e9; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; border: 2px solid #0ea5e9;">
                      📅 Download 7 Days
                    </a>
                  </div>
                ` : ''}
                <p style="color: #6b7280; font-size: 12px; margin: 15px 0 0 0;">
                  You&apos;re getting this because you signed up for Best Husband Ever. Your daily action, delivered.
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
                  <a href="${baseUrl}/dashboard" style="color: #0ea5e9; text-decoration: none;">View Dashboard</a> | 
                  <a href="${baseUrl}/dashboard/account" style="color: #0ea5e9; text-decoration: none;">Manage Preferences</a>
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

export interface PostReportData {
  postId: string;
  postContent: string;
  postAuthor: string;
  postAuthorEmail: string;
  reportedBy: string;
  reportedByEmail: string;
  reason: string;
  additionalDetails: string | null;
  reportId: string;
}

export async function sendPostReportEmail(reportData: PostReportData): Promise<boolean> {
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || 'admin@besthusbandever.com';
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <noreply@besthusbandever.com>',
      to: adminEmail,
      subject: `🚨 Team Wins Post Reported Action Required`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Post Report Notification</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #dc2626; font-size: 24px; margin: 0;">🚨 Post Report</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">A Team Wins post has been reported</p>
              </div>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="color: #991b1b; font-size: 18px; margin: 0 0 15px 0;">Report Details</h2>
                <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                  <p style="color: #374151; font-size: 14px; margin: 0 0 8px 0;">
                    <strong>Report ID:</strong> <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${reportData.reportId}</code>
                  </p>
                  <p style="color: #374151; font-size: 14px; margin: 0 0 8px 0;">
                    <strong>Reason:</strong> ${reportData.reason}
                  </p>
                  ${reportData.additionalDetails ? `
                    <p style="color: #374151; font-size: 14px; margin: 8px 0 0 0;">
                      <strong>Additional Details:</strong><br>
                      <span style="color: #6b7280; font-size: 13px;">${reportData.additionalDetails}</span>
                    </p>
                  ` : ''}
                </div>
              </div>

              <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #f1f5f9; font-size: 16px; margin: 0 0 15px 0;">Reported Post</h3>
                <div style="background-color: #1e293b; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                  <p style="color: #cbd5e1; font-size: 14px; margin: 0; white-space: pre-line; line-height: 1.6;">
                    ${reportData.postContent}
                  </p>
                </div>
                <div style="color: #94a3b8; font-size: 12px;">
                  <p style="margin: 5px 0;"><strong>Post ID:</strong> ${reportData.postId}</p>
                  <p style="margin: 5px 0;"><strong>Author:</strong> ${reportData.postAuthor} (${reportData.postAuthorEmail})</p>
                </div>
              </div>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 10px 0;">Reported By</h3>
                <p style="color: #374151; font-size: 14px; margin: 5px 0;">
                  <strong>Name:</strong> ${reportData.reportedBy}
                </p>
                <p style="color: #374151; font-size: 14px; margin: 5px 0;">
                  <strong>Email:</strong> ${reportData.reportedByEmail}
                </p>
              </div>
              
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 15px 0;">
                  Please review this report and take appropriate action. You can access the post in your Supabase dashboard or through the admin interface.
                </p>
                <a href="${baseUrl}/dashboard/team-wins" 
                   style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  View Team Wins Page →
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending report email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error sending report email:', error);
    return false;
  }
}

