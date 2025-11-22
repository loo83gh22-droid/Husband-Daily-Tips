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
    // Debug: Log all headers to see what's actually being received
    const allHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    console.log('All headers received:', JSON.stringify(allHeaders, null, 2));
    
    // Verify this is called with proper auth (use same secret as other email endpoints)
    // Try multiple header name formats (case-insensitive)
    const authHeader = request.headers.get('authorization') || 
                       request.headers.get('Authorization') ||
                       request.headers.get('AUTHORIZATION');
    
    // Also allow query parameter as fallback for testing
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get('secret');
    
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    // Debug logging (remove after testing)
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET is not set in environment variables');
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'CRON_SECRET not configured'
      }, { status: 500 });
    }
    
    // Check both header and query parameter
    const authValid = authHeader === expectedAuth || 
                      (querySecret && querySecret === process.env.CRON_SECRET);
    
    if (!authValid) {
      console.error('Auth mismatch:', {
        received: authHeader ? authHeader.substring(0, 20) + '...' : 'null',
        expectedLength: expectedAuth.length,
        receivedLength: authHeader?.length || 0,
        secretSet: !!process.env.CRON_SECRET,
        secretLength: process.env.CRON_SECRET?.length || 0,
        allHeadersKeys: Object.keys(allHeaders)
      });
      
      // Return more details for debugging (remove in production)
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          receivedLength: authHeader?.length || 0,
          expectedLength: expectedAuth.length,
          secretConfigured: !!process.env.CRON_SECRET,
          secretLength: process.env.CRON_SECRET?.length || 0,
          receivedPrefix: authHeader ? authHeader.substring(0, 20) : 'null',
          headersReceived: Object.keys(allHeaders),
          headerCount: Object.keys(allHeaders).length
        }
      }, { status: 401 });
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

    // Use the actual email function to match production tone with new voice
    const { sendTomorrowTipEmail } = await import('@/lib/email');
    
    const emailSent = await sendTomorrowTipEmail(
      user.email,
      displayName,
      {
        title: action.name,
        content: action.description || action.benefit || 'This is a test action to verify email delivery with the new tone.',
        category: action.category || 'Test',
        actionId: action.id,
        userId: user.id,
      }
    );

    if (!emailSent) {
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: 'sendTomorrowTipEmail returned false'
      }, { status: 500 });
    }

    // If successful, return success response
    return NextResponse.json({ 
      success: true, 
      message: `Test email sent successfully to ${user.email} with new tone`,
      user: {
        username: user.username,
        email: user.email,
        name: user.name
      },
      note: 'Email sent using production template with new Old Spice + HIMYM tone',
      action: {
        name: action.name,
        category: action.category
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

