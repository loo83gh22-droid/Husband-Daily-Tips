import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

// Import guides data - dynamically import to avoid issues with server components
// In the future, this could come from a database
async function getGuides() {
  const { guides } = await import('@/app/dashboard/how-to-guides/[slug]/page');
  return guides;
}

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Missing guide slug' }, { status: 400 });
    }

    const guides = await getGuides();
    const guide = guides[slug];

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    return NextResponse.json({ guide });
  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

