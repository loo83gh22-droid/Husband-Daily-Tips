import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: questions, error } = await supabase
      .from('survey_questions')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching survey questions:', error);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    return NextResponse.json({ questions: questions || [] });
  } catch (error) {
    console.error('Unexpected error fetching survey questions:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

