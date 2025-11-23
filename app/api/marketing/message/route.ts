import { NextResponse } from 'next/server';
import { getMarketingMessage, getMarketingMessages } from '@/lib/marketing-messages';

export const dynamic = 'force-dynamic';

/**
 * GET /api/marketing/message
 * Get a random marketing message
 * Query params:
 *   - category: 'pricing' | 'value' | 'motivation' | 'social_proof' | 'urgency'
 *   - context: 'subscription_page' | 'dashboard' | 'landing_page' | 'all'
 *   - limit: number (for multiple messages)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as any;
    const context = searchParams.get('context') as any;
    const limit = searchParams.get('limit');
    
    if (limit && parseInt(limit) > 1) {
      const messages = await getMarketingMessages(
        category || undefined,
        context || undefined,
        parseInt(limit)
      );
      return NextResponse.json({ messages });
    } else {
      const message = await getMarketingMessage(
        category || undefined,
        context || undefined
      );
      
      if (!message) {
        return NextResponse.json(
          { error: 'No marketing message found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ message });
    }
  } catch (error) {
    console.error('Error fetching marketing message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing message' },
      { status: 500 }
    );
  }
}

