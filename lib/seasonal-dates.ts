/**
 * Utility functions for calculating seasonal/holiday dates
 * These dates vary by year, so we calculate them dynamically
 */

/**
 * Calculate Easter Sunday date for a given year
 * Uses the Computus algorithm
 */
export function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

/**
 * Get seasonal date range for an action based on its name/type
 * Returns { start: Date, end: Date } or null if not seasonal
 */
export function getSeasonalDateRange(actionName: string, currentYear: number = new Date().getFullYear()): { start: Date; end: Date } | null {
  const name = actionName.toLowerCase();
  
  // Christmas Tree (Nov 25 - Dec 14)
  if (name.includes('christmas tree')) {
    return {
      start: new Date(currentYear, 10, 25), // Nov 25 (month is 0-indexed)
      end: new Date(currentYear, 11, 14),   // Dec 14
    };
  }
  
  // Easter Egg Hunt (1 week before Easter - Easter Sunday)
  if (name.includes('easter egg')) {
    const easter = calculateEaster(currentYear);
    const oneWeekBefore = new Date(easter);
    oneWeekBefore.setDate(easter.getDate() - 7);
    return {
      start: oneWeekBefore,
      end: easter,
    };
  }
  
  // Valentine's Day (Feb 1 - Feb 14)
  if (name.includes('valentine')) {
    return {
      start: new Date(currentYear, 1, 1),   // Feb 1
      end: new Date(currentYear, 1, 14),    // Feb 14
    };
  }
  
  // Thanksgiving (Nov 1 - Nov 25)
  if (name.includes('gratitude') && name.includes('thanksgiving')) {
    return {
      start: new Date(currentYear, 10, 1),  // Nov 1
      end: new Date(currentYear, 10, 25),    // Nov 25
    };
  }
  
  // New Year's (Dec 26 - Jan 5 of next year)
  if (name.includes('new year') || name.includes('relationship goals')) {
    return {
      start: new Date(currentYear, 11, 26),     // Dec 26
      end: new Date(currentYear + 1, 0, 5),    // Jan 5 of next year
    };
  }
  
  return null;
}

/**
 * Check if an action is available on a given date
 * If action has seasonal_start_date and seasonal_end_date in DB, use those
 * Otherwise, calculate from action name
 */
export function isActionAvailableOnDate(
  action: { name: string; seasonal_start_date?: string | null; seasonal_end_date?: string | null },
  date: Date = new Date()
): boolean {
  // If action has explicit seasonal dates in DB, use those
  if (action.seasonal_start_date || action.seasonal_end_date) {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    
    if (action.seasonal_start_date) {
      const startDate = new Date(action.seasonal_start_date);
      startDate.setHours(0, 0, 0, 0);
      if (today < startDate) {
        return false;
      }
    }
    
    if (action.seasonal_end_date) {
      const endDate = new Date(action.seasonal_end_date);
      endDate.setHours(0, 0, 0, 0);
      if (today > endDate) {
        return false;
      }
    }
    
    return true;
  }
  
  // Otherwise, calculate from action name
  const dateRange = getSeasonalDateRange(action.name, date.getFullYear());
  if (!dateRange) {
    // Not a seasonal action, always available
    return true;
  }
  
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const start = new Date(dateRange.start);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateRange.end);
  end.setHours(0, 0, 0, 0);
  
  return today >= start && today <= end;
}

/**
 * Update seasonal dates in database for actions that need dynamic calculation
 * This should be called periodically (e.g., via cron) to update dates for the current year
 */
export async function updateSeasonalDates(supabase: any) {
  const currentYear = new Date().getFullYear();
  
  // Update Christmas Tree action
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: `${currentYear}-11-25`,
      seasonal_end_date: `${currentYear}-12-14`,
    })
    .eq('name', 'Go Get a Real Christmas Tree Together');
  
  // Update Easter Egg Hunt action
  const easter = calculateEaster(currentYear);
  const oneWeekBefore = new Date(easter);
  oneWeekBefore.setDate(easter.getDate() - 7);
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: oneWeekBefore.toISOString().split('T')[0],
      seasonal_end_date: easter.toISOString().split('T')[0],
    })
    .eq('name', 'Put Together an Easter Egg Hunt for Your Wife/Partner');
  
  // Update Valentine's Day action
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: `${currentYear}-02-01`,
      seasonal_end_date: `${currentYear}-02-14`,
    })
    .eq('name', 'Plan a Surprise Valentine''s Day Date');
  
  // Update Thanksgiving action
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: `${currentYear}-11-01`,
      seasonal_end_date: `${currentYear}-11-25`,
    })
    .eq('name', 'Write a Gratitude List for Your Partner');
  
  // Update New Year's action
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: `${currentYear}-12-26`,
      seasonal_end_date: `${currentYear + 1}-01-05`,
    })
    .eq('name', 'Set Relationship Goals for the New Year Together');
}

