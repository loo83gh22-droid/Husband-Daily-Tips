import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

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

    // Check if feedback table exists, if not we'll just log it for now
    // In production, you'd want to create a feedback table
    try {
      const { error: insertError } = await adminSupabase
        .from('feedback')
        .insert({
          user_id: user.id,
          feedback: feedback.trim(),
          category: category || 'other',
          user_email: user.email,
          user_name: user.name,
        });

      if (insertError) {
        // If table doesn't exist, just log it
        console.log('Feedback received:', {
          userId: user.id,
          email: user.email,
          name: user.name,
          category,
          feedback: feedback.trim(),
        });
      }
    } catch (error) {
      // Table might not exist yet - just log the feedback
      console.log('Feedback received:', {
        userId: user.id,
        email: user.email,
        name: user.name,
        category,
        feedback: feedback.trim(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

