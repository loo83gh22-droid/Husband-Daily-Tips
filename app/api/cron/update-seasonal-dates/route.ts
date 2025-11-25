import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { updateSeasonalDates } from '@/lib/seasonal-dates';

export const dynamic = 'force-dynamic';

/**
 * Cron job to update seasonal action dates annually
 * Should run once per year (e.g., January 1st)
 * 
 * This updates the seasonal_start_date and seasonal_end_date for actions
 * that have dynamic dates (like Easter, which varies by year)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    // Update seasonal dates for current year
    await updateSeasonalDates(supabase);

    return NextResponse.json({
      success: true,
      message: 'Seasonal dates updated successfully',
      year: new Date().getFullYear(),
    });
  } catch (error: any) {
    console.error('Error updating seasonal dates:', error);
    return NextResponse.json(
      { error: 'Failed to update seasonal dates', details: error.message },
      { status: 500 }
    );
  }
}

