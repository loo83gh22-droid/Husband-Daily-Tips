/**
 * Utility functions for calculating seasonal/holiday dates
 * These dates vary by year, so we calculate them dynamically
 */

import {
  calculateUSThanksgiving,
  calculateCanadianThanksgiving,
  calculateMemorialDay,
  calculateLaborDay,
  calculateVictoriaDay,
  getCountryHolidayDateRange,
} from './country-holidays';

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
 * Get seasonal date range for an action based on its name/type and country
 * Returns { start: Date, end: Date } or null if not seasonal
 */
export function getSeasonalDateRange(
  actionName: string, 
  currentYear: number = new Date().getFullYear(),
  country: 'US' | 'CA' | null = null
): { start: Date; end: Date } | null {
  const name = actionName.toLowerCase();
  
  // First, check for country-specific holidays
  if (country) {
    const countryRange = getCountryHolidayDateRange(actionName, country, currentYear);
    if (countryRange) {
      return countryRange;
    }
  }
  
  // Christmas Tree (Nov 25 - Dec 14) - Universal
  if (name.includes('christmas tree')) {
    return {
      start: new Date(currentYear, 10, 25), // Nov 25 (month is 0-indexed)
      end: new Date(currentYear, 11, 14),   // Dec 14
    };
  }
  
  // Easter Egg Hunt (1 week before Easter - Easter Sunday) - Universal
  if (name.includes('easter egg')) {
    const easter = calculateEaster(currentYear);
    const oneWeekBefore = new Date(easter);
    oneWeekBefore.setDate(easter.getDate() - 7);
    return {
      start: oneWeekBefore,
      end: easter,
    };
  }
  
  // Valentine's Day (Feb 1 - Feb 14) - Universal
  if (name.includes('valentine')) {
    return {
      start: new Date(currentYear, 1, 1),   // Feb 1
      end: new Date(currentYear, 1, 14),    // Feb 14
    };
  }
  
  // New Year's (Dec 26 - Jan 5 of next year) - Universal
  if (name.includes('new year') || name.includes('relationship goals')) {
    return {
      start: new Date(currentYear, 11, 26),     // Dec 26
      end: new Date(currentYear + 1, 0, 5),    // Jan 5 of next year
    };
  }
  
  return null;
}

/**
 * Check if an action is available on a given date and for a given country
 * If action has seasonal_start_date and seasonal_end_date in DB, use those
 * Otherwise, calculate from action name
 */
export function isActionAvailableOnDate(
  action: { name: string; seasonal_start_date?: string | null; seasonal_end_date?: string | null; country?: string | null },
  date: Date = new Date(),
  userCountry: 'US' | 'CA' | null = null
): boolean {
  // Check country match - if action is country-specific, user must be in that country
  if (action.country && action.country !== userCountry) {
    return false;
  }
  
  // If action is country-specific but user has no country, don't show it
  if (action.country && !userCountry) {
    return false;
  }
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
  
  // Otherwise, calculate from action name (with country context)
  const dateRange = getSeasonalDateRange(action.name, date.getFullYear(), userCountry);
  if (!dateRange) {
    // Not a seasonal action, always available (if country matches)
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
 * Handles both universal and country-specific holidays
 */
export async function updateSeasonalDates(supabase: any) {
  const currentYear = new Date().getFullYear();
  
  // Universal holidays
  
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
    .eq('name', "Plan a Surprise Valentine's Day Date");
  
  // Update New Year's action
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: `${currentYear}-12-26`,
      seasonal_end_date: `${currentYear + 1}-01-05`,
    })
    .eq('name', 'Set Relationship Goals for the New Year Together');
  
  // US-specific holidays
  
  // US Thanksgiving
  const usThanksgiving = calculateUSThanksgiving(currentYear);
  const usThanksgivingWeekBefore = new Date(usThanksgiving);
  usThanksgivingWeekBefore.setDate(usThanksgiving.getDate() - 7);
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: usThanksgivingWeekBefore.toISOString().split('T')[0],
      seasonal_end_date: usThanksgiving.toISOString().split('T')[0],
    })
    .eq('name', 'Plan a Special US Thanksgiving Together')
    .eq('country', 'US');
  
  // Update existing US Thanksgiving action (the gratitude one)
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: usThanksgivingWeekBefore.toISOString().split('T')[0],
      seasonal_end_date: usThanksgiving.toISOString().split('T')[0],
    })
    .eq('name', 'Write a Gratitude List for Your Partner')
    .eq('country', 'US');
  
  // US Independence Day
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: `${currentYear}-07-01`,
      seasonal_end_date: `${currentYear}-07-04`,
    })
    .eq('name', 'Celebrate Independence Day Together')
    .eq('country', 'US');
  
  // US Memorial Day
  const usMemorialDay = calculateMemorialDay(currentYear);
  const usMemorialWeekBefore = new Date(usMemorialDay);
  usMemorialWeekBefore.setDate(usMemorialDay.getDate() - 7);
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: usMemorialWeekBefore.toISOString().split('T')[0],
      seasonal_end_date: usMemorialDay.toISOString().split('T')[0],
    })
    .eq('name', 'Honor Memorial Day Together')
    .eq('country', 'US');
  
  // US Labor Day
  const usLaborDay = calculateLaborDay(currentYear);
  const usLaborWeekBefore = new Date(usLaborDay);
  usLaborWeekBefore.setDate(usLaborDay.getDate() - 7);
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: usLaborWeekBefore.toISOString().split('T')[0],
      seasonal_end_date: usLaborDay.toISOString().split('T')[0],
    })
    .eq('name', 'Enjoy a Labor Day Weekend Together')
    .eq('country', 'US');
  
  // Canada-specific holidays
  
  // Canadian Thanksgiving
  const caThanksgiving = calculateCanadianThanksgiving(currentYear);
  const caThanksgivingWeekBefore = new Date(caThanksgiving);
  caThanksgivingWeekBefore.setDate(caThanksgiving.getDate() - 7);
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: caThanksgivingWeekBefore.toISOString().split('T')[0],
      seasonal_end_date: caThanksgiving.toISOString().split('T')[0],
    })
    .eq('name', 'Plan a Special Canadian Thanksgiving Together')
    .eq('country', 'CA');
  
  // Canada Day
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: `${currentYear}-06-25`,
      seasonal_end_date: `${currentYear}-07-01`,
    })
    .eq('name', 'Celebrate Canada Day Together')
    .eq('country', 'CA');
  
  // Victoria Day
  const caVictoriaDay = calculateVictoriaDay(currentYear);
  const caVictoriaWeekBefore = new Date(caVictoriaDay);
  caVictoriaWeekBefore.setDate(caVictoriaDay.getDate() - 7);
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: caVictoriaWeekBefore.toISOString().split('T')[0],
      seasonal_end_date: caVictoriaDay.toISOString().split('T')[0],
    })
    .eq('name', 'Enjoy Victoria Day Weekend Together')
    .eq('country', 'CA');
  
  // Canadian Labor Day
  const caLaborDay = calculateLaborDay(currentYear);
  const caLaborWeekBefore = new Date(caLaborDay);
  caLaborWeekBefore.setDate(caLaborDay.getDate() - 7);
  await supabase
    .from('actions')
    .update({
      seasonal_start_date: caLaborWeekBefore.toISOString().split('T')[0],
      seasonal_end_date: caLaborDay.toISOString().split('T')[0],
    })
    .eq('name', 'Enjoy a Labour Day Weekend Together')
    .eq('country', 'CA');
}

