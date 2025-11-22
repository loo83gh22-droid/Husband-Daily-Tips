import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const adminSupabase = getSupabaseAdmin();

    // Get user
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, name')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { feedback, category } = await request.json();

    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 });
    }

    const feedbackText = feedback.trim();
    const feedbackCategory = category || 'other';

    // Save to database
    try {
      const { error: insertError } = await adminSupabase
        .from('feedback')
        .insert({
          user_id: user.id,
          feedback: feedbackText,
          category: feedbackCategory,
          user_email: user.email,
          user_name: user.name,
        });

      if (insertError) {
        console.error('Error saving feedback to database:', insertError);
        // Continue anyway - we'll still send the email
      }
    } catch (error) {
      console.error('Error inserting feedback:', error);
      // Continue anyway - we'll still send the email
    }

    // Send email notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL?.match(/<(.+)>/)?.[1] || 'action@besthusbandever.com';
    
    try {
      const categoryLabels: Record<string, string> = {
        suggestion: '💡 Suggestion',
        bug: '🐛 Bug Report',
        praise: '⭐ Praise',
        other: '💬 Other',
      };

      const categoryLabel = categoryLabels[feedbackCategory] || '💬 Feedback';

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Best Husband Ever <action@besthusbandever.com>',
        to: adminEmail,
        replyTo: user.email || undefined,
        subject: `${categoryLabel} from ${user.name || user.email || 'User'}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #0f172a; margin-top: 0;">New Feedback Received</h2>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>From:</strong> ${user.name || 'Unknown'} (${user.email})</p>
                  <p style="margin: 5px 0;"><strong>Category:</strong> ${categoryLabel}</p>
                  <p style="margin: 5px 0;"><strong>User ID:</strong> ${user.id}</p>
                </div>

                <div style="background-color: #0f172a; color: #f1f5f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                  <h3 style="color: #fbbf24; margin-top: 0;">Feedback:</h3>
                  <p style="white-space: pre-wrap; margin: 0;">${feedbackText.replace(/\n/g, '<br>')}</p>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                  This feedback has been saved to the database. You can view all feedback in your Supabase dashboard.
                </p>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Error sending feedback email:', emailError);
      // Don't fail the request if email fails - feedback is still saved to DB
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

