import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendPostReportEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;
    const { postId, reason, additionalDetails } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const adminSupabase = getSupabaseAdmin();

    // Get current user
    const { data: currentUser } = await adminSupabase
      .from('users')
      .select('id, email, name')
      .eq('auth0_id', auth0Id)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the post being reported
    const { data: post, error: postError } = await adminSupabase
      .from('deep_thoughts')
      .select(`
        *,
        users:user_id (id, email, name, username)
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already reported this post
    const { data: existingReport } = await adminSupabase
      .from('post_reports')
      .select('id')
      .eq('post_id', postId)
      .eq('reported_by', currentUser.id)
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this post' },
        { status: 400 }
      );
    }

    // Create report
    const { data: report, error: reportError } = await adminSupabase
      .from('post_reports')
      .insert({
        post_id: postId,
        reported_by: currentUser.id,
        reason: reason || 'Inappropriate content',
        additional_details: additionalDetails || null,
        status: 'pending',
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }

    // Send email notification to admin
    const postAuthor = post.users as any;
    const reportData = {
      postId: post.id,
      postContent: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
      postAuthor: postAuthor?.name || postAuthor?.username || 'Anonymous',
      postAuthorEmail: postAuthor?.email || 'N/A',
      reportedBy: currentUser.name || currentUser.email,
      reportedByEmail: currentUser.email,
      reason: reason || 'Inappropriate content',
      additionalDetails: additionalDetails || null,
      reportId: report.id,
    };

    await sendPostReportEmail(reportData);

    return NextResponse.json({
      success: true,
      message: 'Post reported successfully. Thank you for helping keep our community safe.',
    });
  } catch (error) {
    console.error('Unexpected error reporting post:', error);
    return NextResponse.json(
      { error: 'Unexpected error' },
      { status: 500 }
    );
  }
}

