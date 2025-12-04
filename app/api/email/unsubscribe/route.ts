import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/email/unsubscribe?token=xxx&type=xxx
 * Unsubscribe a user from a specific email type using a token
 * 
 * Token format: base64(user_id:email_type:timestamp)
 * This allows unsubscribe links in emails without requiring authentication
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const type = searchParams.get('type'); // Optional: specific type to unsubscribe from

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    // Decode token
    let decoded: string;
    try {
      decoded = Buffer.from(token, 'base64').toString('utf-8');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Parse token: user_id:email_type:timestamp
    const parts = decoded.split(':');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const [userId, emailType, timestamp] = parts;

    // Validate timestamp (token expires after 90 days)
    const tokenDate = new Date(parseInt(timestamp, 10));
    const now = new Date();
    const daysDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 90) {
      return NextResponse.json(
        { error: 'Unsubscribe link has expired. Please use your account settings to manage preferences.' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseAdmin();

    // Get current preferences
    const { data: user, error: fetchError } = await adminSupabase
      .from('users')
      .select('id, email_preferences')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine which preference to update
    const preferenceType = type || emailType || 'marketing'; // Default to marketing if not specified

    // Get current preferences
    const currentPreferences = (user.email_preferences as Record<string, boolean>) || {
      daily_actions: true,
      surveys: true,
      marketing: true,
      updates: true,
      challenges: true,
      trial_reminders: true,
    };

    // Update the specific preference
    const updatedPreferences = {
      ...currentPreferences,
      [preferenceType]: false,
    };

    // Update preferences
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ email_preferences: updatedPreferences })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating email preferences:', updateError);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    // Return success page HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed - Best Husband Ever</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #0f172a;
              color: #f1f5f9;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              background-color: #1e293b;
              border-radius: 12px;
              padding: 40px;
              text-align: center;
              border: 1px solid #334155;
            }
            h1 {
              color: #0ea5e9;
              margin-bottom: 20px;
            }
            p {
              color: #cbd5e1;
              line-height: 1.6;
              margin-bottom: 15px;
            }
            a {
              color: #0ea5e9;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Successfully Unsubscribed</h1>
            <p>You've been unsubscribed from ${preferenceType === 'daily_actions' ? 'daily action' : preferenceType === 'trial_reminders' ? 'trial reminder' : preferenceType} emails.</p>
            <p>You can manage all your email preferences in your <a href="${process.env.AUTH0_BASE_URL || 'https://besthusbandever.com'}/dashboard/account">Account Settings</a>.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
              If you change your mind, you can re-enable these emails at any time.
            </p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}


