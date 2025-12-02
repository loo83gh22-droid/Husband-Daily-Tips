/**
 * Birthday utility functions for determining when to serve birthday actions
 */

interface BirthdayWeekInfo {
  isBirthdayWeek: boolean;
  birthdayDate: Date | null;
  birthdayDayOfWeek: number | null; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  serveWeekStart: Date | null; // The Monday when actions should start being served
}

/**
 * Determines if we're in the birthday week and when to serve birthday actions
 * 
 * Logic:
 * - If birthday falls on Day 5 or 6 (Friday/Saturday) → serve actions on Day 1 (Monday) of that week
 * - If birthday falls on Day 0-4 (Sunday-Thursday) → serve actions on Day 1 (Monday) of the week BEFORE
 * 
 * @param spouseBirthday - The spouse's birthday date (YYYY-MM-DD format or Date)
 * @param workDays - User's work days array (0=Sunday, 1=Monday, ..., 6=Saturday)
 * @param currentDate - Optional current date for testing (defaults to today)
 * @returns BirthdayWeekInfo object with details about birthday week
 */
export function getBirthdayWeekInfo(
  spouseBirthday: string | Date | null,
  workDays: number[] | null = null,
  currentDate: Date = new Date()
): BirthdayWeekInfo {
  if (!spouseBirthday) {
    return {
      isBirthdayWeek: false,
      birthdayDate: null,
      birthdayDayOfWeek: null,
      serveWeekStart: null,
    };
  }

  // Parse birthday date
  const birthdayDate = typeof spouseBirthday === 'string' 
    ? new Date(spouseBirthday) 
    : spouseBirthday;
  
  if (isNaN(birthdayDate.getTime())) {
    return {
      isBirthdayWeek: false,
      birthdayDate: null,
      birthdayDayOfWeek: null,
      serveWeekStart: null,
    };
  }

  // Get this year's birthday
  const currentYear = currentDate.getFullYear();
  const thisYearBirthday = new Date(birthdayDate);
  thisYearBirthday.setFullYear(currentYear);

  // If birthday has already passed this year, use next year
  const birthdayThisYear = thisYearBirthday < currentDate
    ? new Date(thisYearBirthday.getFullYear() + 1, thisYearBirthday.getMonth(), thisYearBirthday.getDate())
    : thisYearBirthday;

  // Get day of week for birthday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const birthdayDayOfWeek = birthdayThisYear.getDay();

  // Determine which Monday to start serving actions
  // If birthday is on Day 5 (Friday) or Day 6 (Saturday), serve on Monday of that week
  // If birthday is on Day 0-4 (Sunday-Thursday), serve on Monday of the week BEFORE
  let serveWeekStart: Date;
  
  if (birthdayDayOfWeek >= 5) {
    // Birthday is Friday (5) or Saturday (6) - serve on Monday of that week
    // Friday (5): Monday is 4 days before (5 - 1 = 4)
    // Saturday (6): Monday is 5 days before (6 - 1 = 5)
    const daysToMonday = birthdayDayOfWeek - 1;
    serveWeekStart = new Date(birthdayThisYear);
    serveWeekStart.setDate(birthdayThisYear.getDate() - daysToMonday);
  } else {
    // Birthday is Sunday (0) through Thursday (4) - serve on Monday of the week BEFORE
    // Calculate Monday of the week containing the birthday, then go back 7 days
    // Sunday (0): Monday of that week is 6 days before, so Monday of week before is 13 days before
    // Monday (1): Monday of that week is 0 days before, so Monday of week before is 7 days before
    // Tuesday (2): Monday of that week is 1 day before, so Monday of week before is 8 days before
    // Wednesday (3): Monday of that week is 2 days before, so Monday of week before is 9 days before
    // Thursday (4): Monday of that week is 3 days before, so Monday of week before is 10 days before
    let daysToMondayOfBirthdayWeek: number;
    if (birthdayDayOfWeek === 0) {
      daysToMondayOfBirthdayWeek = 6; // Sunday to Monday of that week
    } else {
      daysToMondayOfBirthdayWeek = birthdayDayOfWeek - 1; // Monday=0, Tuesday=1, etc.
    }
    serveWeekStart = new Date(birthdayThisYear);
    serveWeekStart.setDate(birthdayThisYear.getDate() - daysToMondayOfBirthdayWeek - 7); // Go back one more week
  }

  // Set to start of day (midnight)
  serveWeekStart.setHours(0, 0, 0, 0);
  const currentDateStart = new Date(currentDate);
  currentDateStart.setHours(0, 0, 0, 0);

  // Check if we're in the birthday week (7 days starting from serveWeekStart)
  const weekEnd = new Date(serveWeekStart);
  weekEnd.setDate(serveWeekStart.getDate() + 6); // 7 days total (Mon-Sun)
  weekEnd.setHours(23, 59, 59, 999);

  // Only serve birthday actions if birthday is within the next 3 weeks
  // This prevents serving birthday actions months in advance
  const daysUntilBirthday = Math.floor((birthdayThisYear.getTime() - currentDateStart.getTime()) / (1000 * 60 * 60 * 24));
  const isWithinReasonableTimeframe = daysUntilBirthday >= 0 && daysUntilBirthday <= 21; // Within next 3 weeks

  const isBirthdayWeek = isWithinReasonableTimeframe && currentDateStart >= serveWeekStart && currentDateStart <= weekEnd;

  return {
    isBirthdayWeek,
    birthdayDate: birthdayThisYear,
    birthdayDayOfWeek,
    serveWeekStart,
  };
}

/**
 * Get the work week day number for a given date
 * Day 0 = First work day of the week (usually Monday)
 * Day 6 = Last day of the week (usually Sunday)
 * 
 * @param date - The date to check
 * @param workDays - User's work days array (0=Sunday, 1=Monday, ..., 6=Saturday)
 * @returns The work week day number (0-6)
 */
export function getWorkWeekDay(date: Date, workDays: number[] | null = null): number {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  if (!workDays || workDays.length === 0) {
    // Default: Monday = 0, Tuesday = 1, ..., Sunday = 6
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }

  // Find the index of this day in the work_days array
  const index = workDays.indexOf(dayOfWeek);
  if (index === -1) {
    // Day is not a work day, find the closest work day
    // For simplicity, use the day of week as-is
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  }

  return index;
}

