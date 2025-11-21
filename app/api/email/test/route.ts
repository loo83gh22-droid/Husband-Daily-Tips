import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Test email endpoint - sends a test email to a user by username
 * 
 * Usage:
 * POST /api/email/test
 * Body: { "username": "Thommer22" }
 * Headers: { "Authorization": "Bearer YOUR_CRON_SECRET" }
 */
export async function POST(request: Request) {
  try {
    // Verify this is called with proper auth (use same secret as other email endpoints)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // Get user data by username
    const adminSupabase = getSupabaseAdmin();
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, name, username, timezone, subscription_tier')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return NextResponse.json({ 
        error: 'User not found',
        details: `No user found with username: ${username}`
      }, { status: 404 });
    }

    // Get a random action for the test email
    const { data: actions } = await adminSupabase
      .from('actions')
      .select('*')
      .limit(1);

    const action = actions && actions.length > 0 
      ? actions[0] 
      : {
          name: 'Test Action',
          description: 'This is a test email to verify the email service is working correctly.',
          icon: '📧',
          category: 'Test',
          benefit: 'Testing email delivery from action@besthusbandever.com'
        };

    // Get display name
    const displayName = user.username || (user.name ? user.name.split(' ')[0] : 'there');

    // Send test email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever - Tomorrow\'s Action! <action@besthusbandever.com>',
      to: user.email,
      subject: `Test Email: Tomorrow's Action`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #0f172a; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #fbbf24; margin: 0; font-size: 24px;">Best Husband Ever</h1>
              <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 14px;">Level up your marriage game</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">🧪 TEST EMAIL</p>
                <p style="margin: 5px 0 0 0; color: #78350f; font-size: 13px;">This is a test email to verify the email service is working correctly.</p>
              </div>
              
              <h2 style="color: #1e293b; margin-top: 0;">Hi ${displayName},</h2>
              
              <p style="color: #475569; font-size: 16px;">Here's your action for tomorrow:</p>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600; color: #1e293b;">
                  ${action.icon ? `${action.icon} ` : ''}${action.name}
                </p>
                <p style="margin: 10px 0 0 0; color: #64748b; font-size: 15px;">
                  ${action.description}
                </p>
                ${action.benefit ? `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 5px 0; font-size: 13px; font-weight: 600; color: #fbbf24; text-transform: uppercase;">Why this matters:</p>
                    <p style="margin: 0; color: #475569; font-size: 14px;">${action.benefit}</p>
                  </div>
                ` : ''}
              </div>
              
              <a href="${process.env.AUTH0_BASE_URL || 'https://besthusbandever.com'}/dashboard" 
                 style="display: inline-block; background-color: #fbbf24; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">
                View in Dashboard →
              </a>
              
              <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                Completing this action boosts your relationship health bar. Consistency is what moves the needle.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
              <p>You're receiving this test email because it was manually triggered.</p>
              <p><a href="${process.env.AUTH0_BASE_URL || 'https://besthusbandever.com'}/dashboard/account" style="color: #64748b;">Manage email preferences</a></p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: emailError
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent successfully to ${user.email}`,
      emailId: emailData?.id,
      user: {
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: error.message || 'Unexpected error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

