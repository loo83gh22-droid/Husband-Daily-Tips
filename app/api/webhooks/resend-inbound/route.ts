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

    const rawBody = await request.text();
    logger.log('Raw webhook body:', rawBody.substring(0, 1000)); // Log first 1000 chars
    
    const payload = JSON.parse(rawBody);
    logger.log('Parsed webhook payload keys:', Object.keys(payload));
    logger.log('Full parsed webhook payload:', JSON.stringify(payload, null, 2));

    // Resend Inbound webhook format might be different - check actual structure
    // It might be: { type: 'email.received', data: {...} }
    // Or it might be: { from: {...}, to: {...}, subject: ..., text: ..., html: ... }
    // Or it might be: { from: {...}, to: {...}, subject: ..., body: {...} }
    
    let fromEmail: string;
    let toEmail: string | string[];
    let subject: string;
    let text: string;
    let html: string;

    // Handle different payload formats
    if (payload.type === 'email.received' && payload.data) {
      // Format 1: { type: 'email.received', data: {...} }
      fromEmail = typeof payload.data.from === 'string' ? payload.data.from : payload.data.from?.email || '';
      toEmail = payload.data.to || [];
      subject = payload.data.subject || '';
      text = payload.data.text || payload.data.body?.text || '';
      html = payload.data.html || payload.data.body?.html || '';
    } else if (payload.from) {
      // Format 2: Direct format { from: {...}, to: {...}, ... }
      fromEmail = typeof payload.from === 'string' ? payload.from : payload.from?.email || '';
      toEmail = payload.to || [];
      subject = payload.subject || '';
      // Try multiple possible locations for content
      text = payload.text || payload.body?.text || payload.body_text || payload.content?.text || '';
      html = payload.html || payload.body?.html || payload.body_html || payload.content?.html || '';
    } else {
      logger.error('Unknown webhook payload format:', payload);
      return NextResponse.json({ error: 'Unknown payload format' }, { status: 400 });
    }

    // Log what we extracted
    logger.log('Extracted email data:', {
      fromEmail,
      subject,
      textLength: text.length,
      htmlLength: html.length,
      textPreview: text.substring(0, 100),
      htmlPreview: html.substring(0, 100),
    });

    logger.log('Email reply received:', { fromEmail, toEmail, subject });

    // Extract original email address (the user who replied)
    const userEmail = fromEmail.toLowerCase().trim();

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
      let replyId: string | undefined;
      try {
        const storedReply = await storeEmailReply(supabase, {
          from_email: userEmail,
          from_name: extractNameFromEmail(fromEmail),
          subject,
          content: text || html,
          user_id: null,
          status: 'unknown_user',
        });
        replyId = storedReply?.[0]?.id;
      } catch (storeError: any) {
        // Already logged in storeEmailReply
        return NextResponse.json(
          { error: 'Failed to store reply', details: storeError?.message || 'Unknown error' },
          { status: 500 }
        );
      }

      // Send notification to admin about unknown reply
      await notifyAdmin(supabase, {
        type: 'unknown_reply',
        user_email: userEmail,
        subject,
        content: text || html,
        reply_id: replyId,
      });

      return NextResponse.json({ received: true, message: 'Reply stored (unknown user)' });
    }

    // Store the reply in database
    let replyId: string | undefined;
    try {
      const storedReply = await storeEmailReply(supabase, {
        from_email: userEmail,
        from_name: user.name || extractNameFromEmail(fromEmail),
        subject,
        content: text || html,
        user_id: user.id,
        status: 'received',
      });
      replyId = storedReply?.[0]?.id;
    } catch (storeError: any) {
      logger.error('Failed to store user reply:', storeError);
      return NextResponse.json(
        { error: 'Failed to store reply', details: storeError.message },
        { status: 500 }
      );
    }

    // Send notification to admin (enabled by default, can be disabled with env var)
    if (process.env.NOTIFY_ADMIN_ON_REPLIES !== 'false') {
      await notifyAdmin(supabase, {
        type: 'user_reply',
        user_id: user.id,
        user_name: user.name,
        user_email: userEmail,
        subject,
        content: text || html,
        reply_id: replyId,
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
    logger.log('Attempting to store email reply:', {
      from_email: data.from_email,
      from_name: data.from_name,
      subject: data.subject.substring(0, 50),
      content_length: data.content.length,
      user_id: data.user_id,
      status: data.status,
    });

    // Check if email_replies table exists, if not we'll create it via migration
    const { data: insertedData, error } = await supabase
      .from('email_replies')
      .insert({
        from_email: data.from_email,
        from_name: data.from_name,
        subject: data.subject,
        content: data.content,
        user_id: data.user_id,
        status: data.status,
        received_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      // Log full error details
      logger.error('Error storing email reply:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: JSON.stringify(error, null, 2),
      });
      throw error; // Re-throw so caller knows it failed
    }

    logger.log('Email reply stored successfully:', insertedData);
    return insertedData;
  } catch (error: any) {
    logger.error('Exception storing email reply:', {
      message: error.message,
      stack: error.stack,
      fullError: JSON.stringify(error, null, 2),
    });
    throw error; // Re-throw so caller knows it failed
  }
}

/**
 * Notify admin of new reply
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
    reply_id?: string;
  }
) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL;
  
  if (!adminEmail) {
    logger.warn('No admin email configured for reply notifications');
    return;
  }

  try {
    const { sendEmailReplyNotification } = await import('@/lib/email');
    
    const emailSent = await sendEmailReplyNotification({
      type: data.type,
      user_id: data.user_id,
      user_name: data.user_name,
      user_email: data.user_email,
      subject: data.subject,
      content: data.content,
      reply_id: data.reply_id,
    });

    if (emailSent) {
      logger.log('Admin notification email sent successfully to:', adminEmail);
    } else {
      logger.warn('Failed to send admin notification email');
    }
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

