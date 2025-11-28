import { NextResponse } from 'next/server';
import { getRandomQuote } from '@/lib/quotes';

export const dynamic = 'force-dynamic';

/**
 * Get a random quote
 */
export async function GET() {
  try {
    const quote = await getRandomQuote();

    if (!quote) {
      return NextResponse.json(
        { error: 'No quotes available' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Error fetching random quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

