import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from '@/lib/supabase';

/**
 * Get user display name (username, first name, or email)
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth0Id = session.user.sub;

    const { data: user, error } = await supabase
      .from('users')
      .select('username, name, email')
      .eq('auth0_id', auth0Id)
      .single();

    if (error || !user) {
      // Fallback to Auth0 data
      return NextResponse.json({
        displayName: session.user.name?.split(' ')[0] || session.user.email || 'User',
      });
    }

    // Prefer username, then first name, then email
    let displayName = 'User';
    if (user.username) {
      displayName = user.username;
    } else if (user.name) {
      displayName = user.name.split(' ')[0];
    } else if (user.email) {
      displayName = user.email;
    }

    return NextResponse.json({ displayName });
  } catch (error) {
    console.error('Error fetching display name:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

