/**
 * Country-specific holiday date calculations
 * Handles holidays that differ between countries (e.g., US vs Canadian Thanksgiving)
 */

/**
 * Calculate US Thanksgiving (4th Thursday in November)
 */
export function calculateUSThanksgiving(year: number): Date {
  // Start with November 1st
  const nov1 = new Date(year, 10, 1); // Month is 0-indexed, so 10 = November
  // Find the first Thursday
  const firstThursday = nov1.getDay(); // 0 = Sunday, 4 = Thursday
  const daysToAdd = firstThursday <= 4 
    ? (4 - firstThursday) // If Nov 1 is Sun-Wed, add days to get to Thursday
    : (11 - firstThursday); // If Nov 1 is Thu-Sat, add days to get to next Thursday
  const firstThu = new Date(nov1);
  firstThu.setDate(1 + daysToAdd);
  // Add 3 weeks to get the 4th Thursday
  firstThu.setDate(firstThu.getDate() + 21);
  return firstThu;
}

/**
 * Calculate Canadian Thanksgiving (2nd Monday in October)
 */
export function calculateCanadianThanksgiving(year: number): Date {
  // Start with October 1st
  const oct1 = new Date(year, 9, 1); // Month is 0-indexed, so 9 = October
  // Find the first Monday
  const firstDay = oct1.getDay(); // 0 = Sunday, 1 = Monday
  const daysToAdd = firstDay === 0 
    ? 1 // If Oct 1 is Sunday, Monday is next day
    : (8 - firstDay); // Otherwise, calculate days to next Monday
  const firstMon = new Date(oct1);
  firstMon.setDate(1 + daysToAdd);
  // Add 1 week to get the 2nd Monday
  firstMon.setDate(firstMon.getDate() + 7);
  return firstMon;
}

/**
 * Calculate Memorial Day (last Monday in May) - US only
 */
export function calculateMemorialDay(year: number): Date {
  // Start with May 31st
  const may31 = new Date(year, 4, 31); // Month is 0-indexed, so 4 = May
  const dayOfWeek = may31.getDay(); // 0 = Sunday, 1 = Monday
  // Go back to the last Monday
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const memorialDay = new Date(may31);
  memorialDay.setDate(31 - daysToSubtract);
  return memorialDay;
}

/**
 * Calculate Labor Day (1st Monday in September) - US and Canada
 */
export function calculateLaborDay(year: number): Date {
  // Start with September 1st
  const sep1 = new Date(year, 8, 1); // Month is 0-indexed, so 8 = September
  const firstDay = sep1.getDay(); // 0 = Sunday, 1 = Monday
  const daysToAdd = firstDay === 0 
    ? 1 // If Sep 1 is Sunday, Monday is next day
    : (8 - firstDay); // Otherwise, calculate days to next Monday
  const laborDay = new Date(sep1);
  laborDay.setDate(1 + daysToAdd);
  return laborDay;
}

/**
 * Calculate Victoria Day (Monday before May 25) - Canada only
 */
export function calculateVictoriaDay(year: number): Date {
  // May 25
  const may25 = new Date(year, 4, 25); // Month is 0-indexed, so 4 = May
  const dayOfWeek = may25.getDay(); // 0 = Sunday, 1 = Monday
  // Go back to the Monday before May 25
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const victoriaDay = new Date(may25);
  victoriaDay.setDate(25 - daysToSubtract);
  return victoriaDay;
}

/**
 * Get country-specific holiday date range
 * Returns { start: Date, end: Date } or null if not a country-specific holiday
 */
export function getCountryHolidayDateRange(
  actionName: string,
  country: 'US' | 'CA' | null,
  currentYear: number = new Date().getFullYear()
): { start: Date; end: Date } | null {
  if (!country) return null;
  
  const name = actionName.toLowerCase();
  
  // US Thanksgiving (1 week before - Thanksgiving Day)
  if (country === 'US' && name.includes('thanksgiving') && !name.includes('canadian')) {
    const thanksgiving = calculateUSThanksgiving(currentYear);
    const oneWeekBefore = new Date(thanksgiving);
    oneWeekBefore.setDate(thanksgiving.getDate() - 7);
    return {
      start: oneWeekBefore,
      end: thanksgiving,
    };
  }
  
  // Canadian Thanksgiving (1 week before - Thanksgiving Day)
  if (country === 'CA' && (name.includes('thanksgiving') || name.includes('canadian'))) {
    const thanksgiving = calculateCanadianThanksgiving(currentYear);
    const oneWeekBefore = new Date(thanksgiving);
    oneWeekBefore.setDate(thanksgiving.getDate() - 7);
    return {
      start: oneWeekBefore,
      end: thanksgiving,
    };
  }
  
  // US Independence Day (July 1 - July 4)
  if (country === 'US' && (name.includes('independence') || name.includes('july 4'))) {
    return {
      start: new Date(currentYear, 6, 1),   // July 1
      end: new Date(currentYear, 6, 4),    // July 4
    };
  }
  
  // Canada Day (June 25 - July 1)
  if (country === 'CA' && name.includes('canada day')) {
    return {
      start: new Date(currentYear, 5, 25),  // June 25
      end: new Date(currentYear, 6, 1),     // July 1
    };
  }
  
  // Memorial Day - US (1 week before - Memorial Day)
  if (country === 'US' && name.includes('memorial day')) {
    const memorialDay = calculateMemorialDay(currentYear);
    const oneWeekBefore = new Date(memorialDay);
    oneWeekBefore.setDate(memorialDay.getDate() - 7);
    return {
      start: oneWeekBefore,
      end: memorialDay,
    };
  }
  
  // Labor Day - US and Canada (1 week before - Labor Day)
  if (name.includes('labor day') || name.includes('labour day')) {
    const laborDay = calculateLaborDay(currentYear);
    const oneWeekBefore = new Date(laborDay);
    oneWeekBefore.setDate(laborDay.getDate() - 7);
    return {
      start: oneWeekBefore,
      end: laborDay,
    };
  }
  
  // Victoria Day - Canada (1 week before - Victoria Day)
  if (country === 'CA' && name.includes('victoria day')) {
    const victoriaDay = calculateVictoriaDay(currentYear);
    const oneWeekBefore = new Date(victoriaDay);
    oneWeekBefore.setDate(victoriaDay.getDate() - 7);
    return {
      start: oneWeekBefore,
      end: victoriaDay,
    };
  }
  
  return null;
}

