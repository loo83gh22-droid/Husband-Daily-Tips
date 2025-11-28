import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * Resend Inbound Email Webhook
 * 
 * This endpoint receives emails sent to your domain via Resend Inbound.
 * When someone replies to a daily action email, Resend forwards it here.
 * 
 * Setup in Resend:
 * 1. Go to Resend Dashboard → Domains → Your Domain → Inbound
 * 2. Enable Inbound Email
 * 3. Set webhook URL: https://www.besthusbandever.com/api/webhooks/resend-inbound
 * 4. Add webhook secret to environment variables
 * 
 * Environment Variables Needed:
 * - RESEND_INBOUND_WEBHOOK_SECRET (set in Resend dashboard)
 */

interface ResendInboundPayload {
  type: 'email.received';
  data: {
    from: string;
    to: string[];
    subject: string;
    text: string;
    html: string;
    headers: Record<string, string>;
    timestamp: number;
  };
}

export async function POST(request: Request) {
  try {
    // Verify webhook signature (security)
    const signature = request.headers.get('resend-signature');
    const webhookSecret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      // Verify signature matches (Resend provides signature verification)
      // For now, we'll log and process - you can add signature verification later
      logger.log('Resend inbound webhook received with signature');
    }

    const payload: ResendInboundPayload = await request.json();

    // Only process email.received events
    if (payload.type !== 'email.received') {
      return NextResponse.json({ received: true, message: 'Event type not handled' });
    }

    const { from, to, subject, text, html } = payload.data;

    logger.log('Email reply received:', { from, to, subject });

    // Extract original email address (the user who replied)
    const userEmail = from.toLowerCase().trim();

    // Get user from database
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', userEmail)
      .single();

    if (!user) {
      logger.warn('Reply from unknown email:', userEmail);
      // Still store it, but mark as unknown user
      await storeEmailReply(supabase, {
        from_email: userEmail,
        from_name: extractNameFromEmail(from),
        subject,
        content: text || html,
        user_id: null,
        status: 'unknown_user',
      });

      // Optionally: Send notification to admin about unknown reply
      await notifyAdmin(supabase, {
        type: 'unknown_reply',
        user_email: userEmail,
        subject,
        content: text || html,
      });

      return NextResponse.json({ received: true, message: 'Reply stored (unknown user)' });
    }

    // Store the reply in database
    await storeEmailReply(supabase, {
      from_email: userEmail,
      from_name: user.name || extractNameFromEmail(from),
      subject,
      content: text || html,
      user_id: user.id,
      status: 'received',
    });

    // Send notification to admin (optional - you can disable this)
    if (process.env.NOTIFY_ADMIN_ON_REPLIES === 'true') {
      await notifyAdmin(supabase, {
        type: 'user_reply',
        user_id: user.id,
        user_name: user.name,
        user_email: userEmail,
        subject,
        content: text || html,
      });
    }

    logger.log('Email reply processed successfully:', { user_id: user.id, email: userEmail });

    return NextResponse.json({ 
      received: true, 
      message: 'Reply processed successfully',
      user_id: user.id 
    });

  } catch (error: any) {
    logger.error('Error processing Resend inbound webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Store email reply in database
 */
async function storeEmailReply(
  supabase: any,
  data: {
    from_email: string;
    from_name: string;
    subject: string;
    content: string;
    user_id: string | null;
    status: 'received' | 'unknown_user';
  }
) {
  try {
    // Check if email_replies table exists, if not we'll create it via migration
    const { error } = await supabase
      .from('email_replies')
      .insert({
        from_email: data.from_email,
        from_name: data.from_name,
        subject: data.subject,
        content: data.content,
        user_id: data.user_id,
        status: data.status,
        received_at: new Date().toISOString(),
      });

    if (error) {
      // Table might not exist yet - log but don't fail
      logger.warn('Could not store email reply (table may not exist):', error.message);
    }
  } catch (error) {
    logger.error('Error storing email reply:', error);
  }
}

/**
 * Notify admin of new reply (optional)
 */
async function notifyAdmin(
  supabase: any,
  data: {
    type: 'user_reply' | 'unknown_reply';
    user_id?: string;
    user_name?: string;
    user_email: string;
    subject: string;
    content: string;
  }
) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL;
  
  if (!adminEmail) {
    logger.warn('No admin email configured for reply notifications');
    return;
  }

  try {
    const { sendPostReportEmail } = await import('@/lib/email');
    
    // Reuse existing email function or create a new one
    // For now, we'll just log - you can implement email notification later
    logger.log('Admin notification (would send to):', adminEmail, data);
    
    // TODO: Implement admin notification email
    // You can create a new function in lib/email.ts for this
  } catch (error) {
    logger.error('Error notifying admin:', error);
  }
}

/**
 * Extract name from email address
 */
function extractNameFromEmail(email: string): string {
  // Format: "Name <email@domain.com>" or just "email@domain.com"
  const match = email.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return match[1].trim().replace(/['"]/g, '');
  }
  // Extract name from email if no display name
  const emailPart = email.split('@')[0];
  return emailPart.split('.').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
}

