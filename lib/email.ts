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
  actionId?: string; // Added for calendar links and "Mark as Done" button
  userId?: string; // Added for calendar links and "Mark as Done" button
  quote?: { quote_text: string; author: string | null }; // Optional quote to include
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isFirstWorkDay?: boolean; // Whether this is the user's first work day of the week (when planning actions are served)
  weeklyPlanningActions?: Array<{ id: string; name: string; description: string; benefit?: string; category: string }>; // Planning actions for the week
  allActionsLastWeek?: Array<{ id: string; name: string; description?: string; category: string; date: string; completed: boolean }>; // All actions served last week (Sunday only) with completion status
}

export function generateEmailHTML(tip: EmailTip, baseUrl: string): string {
  const dayOfWeek = tip.dayOfWeek ?? new Date().getDay();
  const isFirstWorkDay = tip.isFirstWorkDay ?? (dayOfWeek === 1); // Default to Monday for backward compatibility
  const isSunday = dayOfWeek === 0;
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const weeklyPlanningActions = tip.weeklyPlanningActions || [];
  const allActionsLastWeek = tip.allActionsLastWeek || [];

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Today's Action</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">Best Husband Ever</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Your daily action, delivered.</p>
          </div>
          
          <!-- Today's Daily Action -->
          <div style="background-color: #0f172a; border-radius: 8px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #0ea5e9;">
            <div style="margin-bottom: 15px;">
              <span style="background-color: rgba(14, 165, 233, 0.1); color: #7dd3fc; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                ${tip.category}
              </span>
            </div>
            <h2 style="color: #f1f5f9; font-size: 22px; margin: 0 0 15px 0; font-weight: 600;">
              ${tip.title}
            </h2>
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; white-space: pre-line;">
              ${tip.content}
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(14, 165, 233, 0.2);">
              <a href="${baseUrl}/dashboard" 
                 style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                View in Dashboard →
              </a>
            </div>
          </div>
          
          ${isFirstWorkDay && weeklyPlanningActions.length > 0 ? `
            <!-- First Work Day: Planning Actions - Choose 1 (Full Details) -->
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
              ${weeklyPlanningActions.length > 0 && weeklyPlanningActions.every(a => {
                const actionText = `${a.name || ''} ${a.description || ''}`.toLowerCase();
                return actionText.includes('birthday');
              }) ? `
                <h3 style="color: #78350f; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">
                  🎉 Birthday Planning Actions
                </h3>
                <p style="color: #92400e; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">
                  Your spouse's birthday is coming up! Here are 5 birthday planning actions to help you create a memorable celebration. <strong>Choose 1</strong> (or more) to complete this week—pick what works for your schedule.
                </p>
              ` : weeklyPlanningActions.some(a => {
                const actionText = `${a.name || ''} ${a.description || ''}`.toLowerCase();
                const holidayKeywords = ['canada day', 'independence day', 'thanksgiving', 'valentine', 'christmas', 'new year', 'memorial day', 'labor day', 'labour day', 'victoria day', 'easter'];
                return holidayKeywords.some(keyword => actionText.includes(keyword));
              }) ? `
                <h3 style="color: #78350f; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">
                  🎊 Holiday Planning Actions
                </h3>
                <p style="color: #92400e; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">
                  A holiday is coming up! Here are 5 action-packed planning options that show initiative. <strong>Choose 1</strong> (or more) to complete this week—take charge and make it memorable.
                </p>
              ` : `
                <h3 style="color: #78350f; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">
                  📅 Planning Actions for This Week
                </h3>
                <p style="color: #92400e; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">
                  Here are 5 actions that require a bit more planning. <strong>Choose 1</strong> to complete this week—pick what works for your schedule.
                </p>
              `}
              ${weeklyPlanningActions.map((action, idx) => `
                <div style="background-color: #ffffff; border-radius: 6px; padding: 12px; margin-bottom: ${idx < weeklyPlanningActions.length - 1 ? '10px' : '0'}; border: 1px solid #fde68a;">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
                    <div style="flex: 1; min-width: 0;">
                      <h4 style="color: #78350f; font-size: 15px; margin: 0 0 6px 0; font-weight: 600;">
                        ${action.name}
                      </h4>
                      <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                        ${action.description}
                      </p>
                      ${action.benefit ? `
                        <p style="color: #a16207; font-size: 12px; margin: 6px 0 0 0; font-style: italic;">
                          💡 ${action.benefit}
                        </p>
                      ` : ''}
                    </div>
                    <div style="flex-shrink: 0; display: flex; flex-direction: column; gap: 6px; align-items: flex-end;">
                          <a href="${baseUrl}/dashboard/action/${action.id}" 
                         style="display: inline-block; color: #f59e0b; text-decoration: none; font-size: 12px; font-weight: 600; white-space: nowrap;">
                        View Details →
                      </a>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${isWeekday && !isFirstWorkDay && weeklyPlanningActions.length > 0 ? `
            <!-- Other Work Days: Planning Actions Summarized Table -->
            <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
                ${weeklyPlanningActions.length > 0 && weeklyPlanningActions.every(a => {
                  const actionText = `${a.name || ''} ${a.description || ''}`.toLowerCase();
                  return actionText.includes('birthday');
                }) ? '🎉 This Week\'s Birthday Planning Actions' : weeklyPlanningActions.some(a => {
                  const actionText = `${a.name || ''} ${a.description || ''}`.toLowerCase();
                  const holidayKeywords = ['canada day', 'independence day', 'thanksgiving', 'valentine', 'christmas', 'new year', 'memorial day', 'labor day', 'labour day', 'victoria day', 'easter'];
                  return holidayKeywords.some(keyword => actionText.includes(keyword));
                }) ? '🎊 This Week\'s Holiday Planning Actions' : '📋 This Week\'s Planning Actions'}
              </h3>
              <div style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Action</th>
                      <th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Category</th>
                      <th style="padding: 10px 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${weeklyPlanningActions.map((action, idx) => `
                      <tr style="${idx < weeklyPlanningActions.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                        <td style="padding: 12px; font-size: 13px; font-weight: 600; color: #374151;">${action.name}</td>
                        <td style="padding: 12px; font-size: 12px; color: #6b7280;">${action.category || 'General'}</td>
                        <td style="padding: 12px; text-align: right;">
                          <a href="${baseUrl}/dashboard/action/${action.id}" style="color: #0ea5e9; text-decoration: none; font-size: 12px; font-weight: 600;">View →</a>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin: 12px 0 0 0;">
                <a href="${baseUrl}/dashboard#outstanding-actions" style="color: #0ea5e9; text-decoration: none;">View all outstanding actions →</a>
              </p>
            </div>
          ` : ''}
          
          ${isSunday ? `
            <!-- Sunday: Weekly Review -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
              <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">
                📊 Weekly Review
              </h3>
              <p style="color: #1e3a8a; font-size: 14px; margin: 0 0 15px 0; line-height: 1.6;">
                Here's a summary of all actions served last week. Take a moment to reflect on your progress.
              </p>
              ${allActionsLastWeek.length > 0 ? `
                <div style="background-color: #ffffff; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                  <p style="color: #1e40af; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">
                    Actions Served Last Week (${allActionsLastWeek.length}):
                  </p>
                  <div style="space-y: 8px;">
                    ${allActionsLastWeek.map(action => {
                      const actionDate = new Date(action.date);
                      const dateStr = actionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                      return `
                        <div style="padding: 10px; margin-bottom: 8px; background-color: ${action.completed ? '#d1fae5' : '#fef3c7'}; border-radius: 4px; border-left: 3px solid ${action.completed ? '#10b981' : '#f59e0b'};">
                          <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="flex: 1;">
                              <span style="color: ${action.completed ? '#065f46' : '#78350f'}; font-size: 12px; font-weight: 600; margin-right: 8px;">
                                ${action.completed ? '✓' : '○'}
                              </span>
                              <span style="color: ${action.completed ? '#065f46' : '#78350f'}; font-size: 13px; font-weight: ${action.completed ? '500' : '600'};">
                                ${action.name}
                              </span>
                              <span style="color: ${action.completed ? '#047857' : '#92400e'}; font-size: 11px; margin-left: 8px;">
                                (${dateStr})
                              </span>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <p style="color: #6b7280; font-size: 12px; margin: 12px 0 0 0; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                    <strong>${allActionsLastWeek.filter(a => a.completed).length}</strong> completed • 
                    <strong>${allActionsLastWeek.filter(a => !a.completed).length}</strong> incomplete
                  </p>
                </div>
              ` : `
                <p style="color: #3b82f6; font-size: 13px; margin: 0; font-style: italic;">
                  No actions served last week. Check back next week!
                </p>
              `}
              <div style="margin-top: 15px;">
                <a href="${baseUrl}/dashboard#outstanding-actions" 
                   style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  View Outstanding Actions →
                </a>
              </div>
            </div>
          ` : ''}
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <p style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
              Here&apos;s the deal:
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
              Today&apos;s action arrives at 6am. You can complete it right away or plan it for later today. Start your day right and make it happen. You got this.
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
                  📅 Download Today's Action
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
  `;
}

/**
 * Generate email HTML for free users (weekly email with upgrade messaging)
 */
export function generateFreeUserEmailHTML(tip: EmailTip, baseUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>This Week's Action</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">Best Husband Ever</h1>
            <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Your weekly action, delivered.</p>
          </div>
          
          <!-- This Week's Action -->
          <div style="background-color: #0f172a; border-radius: 8px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #0ea5e9;">
            <div style="margin-bottom: 15px;">
              <span style="background-color: rgba(14, 165, 233, 0.1); color: #7dd3fc; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                ${tip.category}
              </span>
            </div>
            <h2 style="color: #f1f5f9; font-size: 22px; margin: 0 0 15px 0; font-weight: 600;">
              ${tip.title}
            </h2>
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; white-space: pre-line;">
              ${tip.content}
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(14, 165, 233, 0.2);">
              <a href="${baseUrl}/dashboard" 
                 style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                View in Dashboard →
              </a>
            </div>
          </div>
          
          <!-- What You're Missing Section -->
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #991b1b; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">
              ⚠️ What You're Missing as a Free Member
            </h3>
            <p style="color: #7f1d1d; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">
              You're currently receiving <strong>1 action per week</strong>. Here's what Premium members get that you don't:
            </p>
            <div style="background-color: #ffffff; border-radius: 6px; padding: 20px; margin-bottom: 15px;">
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #dc2626; font-size: 18px; line-height: 1.2;">❌</span>
                  <div>
                    <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 600;">Only 1 action per week</p>
                    <p style="color: #7f1d1d; font-size: 12px; margin: 4px 0 0 0;">Premium members get <strong>daily actions</strong> every work day</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #dc2626; font-size: 18px; line-height: 1.2;">❌</span>
                  <div>
                    <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 600;">No weekly planning actions</p>
                    <p style="color: #7f1d1d; font-size: 12px; margin: 4px 0 0 0;">Premium members get <strong>5 planning actions</strong> every Monday for bigger gestures</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #dc2626; font-size: 18px; line-height: 1.2;">❌</span>
                  <div>
                    <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 600;">No weekly review</p>
                    <p style="color: #7f1d1d; font-size: 12px; margin: 4px 0 0 0;">Premium members get a <strong>weekly summary</strong> to track progress</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #dc2626; font-size: 18px; line-height: 1.2;">❌</span>
                  <div>
                    <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 600;">No Husband Health tracking</p>
                    <p style="color: #7f1d1d; font-size: 12px; margin: 4px 0 0 0;">Premium members track their <strong>relationship health score</strong> and earn badges</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #dc2626; font-size: 18px; line-height: 1.2;">❌</span>
                  <div>
                    <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 600;">Limited action access</p>
                    <p style="color: #7f1d1d; font-size: 12px; margin: 4px 0 0 0;">Premium members can <strong>complete any action</strong> from the full library</p>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <span style="color: #dc2626; font-size: 18px; line-height: 1.2;">❌</span>
                  <div>
                    <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 600;">No journal or Team Wins</p>
                    <p style="color: #7f1d1d; font-size: 12px; margin: 4px 0 0 0;">Premium members get <strong>private journaling</strong> and can share wins with the community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upgrade CTA Section -->
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); border-radius: 8px; padding: 30px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #ffffff; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">
              🚀 Upgrade to Premium and Get It All
            </h3>
            <p style="color: #e0f2fe; font-size: 15px; margin: 0 0 20px 0; line-height: 1.6;">
              As a Premium member, you'll receive:
            </p>
            <div style="text-align: left; background-color: rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 20px; margin-bottom: 20px;">
              <ul style="color: #ffffff; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>📧 <strong>Daily routine actions</strong> delivered via email</li>
                <li>📅 <strong>Weekly planning actions</strong> that require more planning</li>
                <li>📊 <strong>Weekly summary email</strong> to reflect on your accomplishments</li>
                <li>📈 <strong>Full Husband Health tracking</strong> and achievement badges</li>
                <li>📝 <strong>Private journal & Team Wins</strong> to track your progress</li>
                <li>🎯 <strong>Complete any action</strong> from the Actions page</li>
                <li>🔥 <strong>Join 7-day events</strong> for structured challenges</li>
              </ul>
            </div>
            <a href="${baseUrl}/dashboard/subscription" 
               style="display: inline-block; background-color: #ffffff; color: #0ea5e9; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 18px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              🚀 Start 7-Day Free Trial →
            </a>
            <p style="color: #bae6fd; font-size: 13px; margin: 10px 0 0 0; font-weight: 600;">
              No credit card required • Cancel anytime • Try all Premium features free
            </p>
          </div>
          
          <!-- Additional CTA Section -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 25px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #78350f; font-size: 18px; margin: 0 0 12px 0; font-weight: 600;">
              Ready to Level Up Your Relationship?
            </h3>
            <p style="color: #92400e; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">
              Join thousands of husbands who are becoming better partners every day. Start your free trial and get daily actions, weekly planning, and full progress tracking.
            </p>
            <a href="${baseUrl}/dashboard/subscription" 
               style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 16px;">
              Upgrade to Premium Now →
            </a>
          </div>
          
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <p style="color: #374151; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
              Free members receive 1 action per week
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
              You're receiving this weekly email on the first day of your work week. Upgrade to Premium to get daily actions, weekly planning actions, and more features to help you become the best husband ever.
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
            <p style="color: #6b7280; font-size: 12px; margin: 15px 0 0 0;">
              You're getting this because you signed up for Best Husband Ever. Free members receive 1 action per week.
            </p>
            <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
              <a href="${baseUrl}/dashboard" style="color: #0ea5e9; text-decoration: none;">View Dashboard</a> | 
              <a href="${baseUrl}/dashboard/subscription" style="color: #0ea5e9; text-decoration: none;">Upgrade to Premium</a> | 
              <a href="${baseUrl}/dashboard/account" style="color: #0ea5e9; text-decoration: none;">Manage Preferences</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendTomorrowTipEmail(
  email: string,
  name: string,
  tip: EmailTip,
  isFreeUser: boolean = false,
): Promise<boolean> {
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  const baseUrl = process.env.AUTH0_BASE_URL || 'https://besthusbandever.com';

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever Today\'s Action! <action@besthusbandever.com>',
      replyTo: 'action@besthusbandever.com',
      to: email,
      subject: isFreeUser ? `This Week's Action: Make Her Smile` : `Today's Action: Make Her Smile (Here's How)`,
      html: isFreeUser ? generateFreeUserEmailHTML(tip, baseUrl) : generateEmailHTML(tip, baseUrl),
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

export interface EmailReplyNotificationData {
  type: 'user_reply' | 'unknown_reply';
  user_id?: string;
  user_name?: string;
  user_email: string;
  subject: string;
  content: string;
  reply_id?: string;
}

export async function sendEmailReplyNotification(replyData: EmailReplyNotificationData): Promise<boolean> {
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || 'admin@besthusbandever.com';
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://www.besthusbandever.com';

  const isKnownUser = replyData.type === 'user_reply';
  const userName = replyData.user_name || 'Unknown User';
  const userEmail = replyData.user_email;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <noreply@besthusbandever.com>',
      to: adminEmail,
      subject: isKnownUser 
        ? `📧 New Email Reply from ${userName}` 
        : `📧 New Email Reply from Unknown User`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Reply Notification</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">📧 Email Reply Received</h1>
                <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">A user has replied to a daily action email</p>
              </div>
              
              ${isKnownUser ? `
                <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 10px 0;">User Information</h3>
                  <p style="color: #374151; font-size: 14px; margin: 5px 0;">
                    <strong>Name:</strong> ${userName}
                  </p>
                  <p style="color: #374151; font-size: 14px; margin: 5px 0;">
                    <strong>Email:</strong> ${userEmail}
                  </p>
                  ${replyData.user_id ? `
                    <p style="color: #374151; font-size: 14px; margin: 5px 0;">
                      <strong>User ID:</strong> <code style="background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${replyData.user_id}</code>
                    </p>
                  ` : ''}
                </div>
              ` : `
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #991b1b; font-size: 16px; margin: 0 0 10px 0;">⚠️ Unknown User</h3>
                  <p style="color: #374151; font-size: 14px; margin: 5px 0;">
                    <strong>Email:</strong> ${userEmail}
                  </p>
                  <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">
                    This email address is not associated with any user account. You may want to reach out to them directly.
                  </p>
                </div>
              `}

              <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #f1f5f9; font-size: 16px; margin: 0 0 15px 0;">Email Content</h3>
                <div style="background-color: #1e293b; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
                  <p style="color: #cbd5e1; font-size: 13px; margin: 0 0 10px 0; font-weight: 600;">Subject:</p>
                  <p style="color: #f1f5f9; font-size: 14px; margin: 0 0 15px 0;">${replyData.subject}</p>
                  <p style="color: #cbd5e1; font-size: 13px; margin: 15px 0 10px 0; font-weight: 600;">Message:</p>
                  <div style="color: #e2e8f0; font-size: 14px; margin: 0; white-space: pre-wrap; line-height: 1.6; max-height: 400px; overflow-y: auto;">
                    ${replyData.content.replace(/\n/g, '<br>')}
                  </div>
                </div>
              </div>

              ${replyData.reply_id ? `
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    <strong>Reply ID:</strong> <code style="background-color: #ffffff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${replyData.reply_id}</code>
                  </p>
                </div>
              ` : ''}
              
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 15px 0;">
                  This reply has been stored in your database. You can view all replies in Supabase under the <code>email_replies</code> table.
                </p>
                ${isKnownUser && replyData.user_id ? `
                  <a href="${baseUrl}/dashboard" 
                     style="display: inline-block; background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px;">
                    View Dashboard →
                  </a>
                ` : ''}
              </div>

              <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 30px;">
                This is an automated notification from Best Husband Ever.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email reply notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error sending email reply notification:', error);
    return false;
  }
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

