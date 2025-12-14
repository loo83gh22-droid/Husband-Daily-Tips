import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Get recommended actions for welcome modal
 * POST /api/actions/recommended
 * Body: { categories: string[] }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { categories } = body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ actions: [] });
    }

    const adminSupabase = getSupabaseAdmin();

    // Fetch 1-2 actions per category
    const actionsPromises = categories.map(async (category: string) => {
      const { data } = await adminSupabase
        .from('actions')
        .select('id, name, description, icon, category, theme')
        .eq('category', category)
        .limit(2)
        .order('display_order', { ascending: true, nullsFirst: false });

      return data?.[0] || null; // Return first action
    });

    const actions = (await Promise.all(actionsPromises)).filter(Boolean);

    return NextResponse.json({ actions });
  } catch (error) {
    console.error('Error fetching recommended actions:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

