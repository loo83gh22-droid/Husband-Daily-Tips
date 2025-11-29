import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Get a single action by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { actionId: string } }
) {
  try {
    const { actionId } = params;

    if (!actionId) {
      return NextResponse.json({ error: 'Action ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: action, error } = await supabase
      .from('actions')
      .select('*')
      .eq('id', actionId)
      .single();

    if (error || !action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    return NextResponse.json(action);
  } catch (error: any) {
    console.error('Error fetching action:', error);
    return NextResponse.json(
      { error: 'Failed to fetch action' },
      { status: 500 }
    );
  }
}

