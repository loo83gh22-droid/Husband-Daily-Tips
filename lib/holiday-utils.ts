/**
 * Holiday utility functions for determining when to serve holiday actions
 * Similar to birthday-utils.ts but for holidays
 */

import {
  calculateUSThanksgiving,
  calculateCanadianThanksgiving,
  calculateMemorialDay,
  calculateLaborDay,
  calculateVictoriaDay,
  calculateMLKDay,
  calculatePresidentsDay,
  calculateJuneteenth,
  calculateColumbusDay,
  calculateVeteransDay,
  calculateFamilyDay,
  calculateGoodFriday,
  calculateTruthAndReconciliationDay,
  calculateRemembranceDay,
  getCountryHolidayDateRange,
} from './country-holidays';

interface HolidayWeekInfo {
  isHolidayWeek: boolean;
  holidayName: string | null;
  holidayDate: Date | null;
  serveWeekStart: Date | null; // The Monday when actions should start being served
}

/**
 * List of holidays we support with their detection logic
 * Includes all US and Canadian statutory holidays
 */
const SUPPORTED_HOLIDAYS = [
  // Universal holidays
  { name: "Valentine's Day", dateFn: (year: number) => new Date(year, 1, 14), country: null as 'US' | 'CA' | null },
  { name: "Easter", dateFn: (year: number) => {
    // Easter calculation
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
  }, country: null as 'US' | 'CA' | null },
  { name: "New Year's", dateFn: (year: number) => new Date(year, 0, 1), country: null as 'US' | 'CA' | null },
  { name: "Christmas", dateFn: (year: number) => new Date(year, 11, 25), country: null as 'US' | 'CA' | null },
  
  // US-specific statutory holidays
  { name: "Martin Luther King Jr. Day", dateFn: calculateMLKDay, country: 'US' as const },
  { name: "Presidents' Day", dateFn: calculatePresidentsDay, country: 'US' as const },
  { name: "Memorial Day", dateFn: calculateMemorialDay, country: 'US' as const },
  { name: "Juneteenth", dateFn: calculateJuneteenth, country: 'US' as const },
  { name: "Independence Day", dateFn: (year: number) => new Date(year, 6, 4), country: 'US' as const },
  { name: "Labor Day", dateFn: calculateLaborDay, country: 'US' as const },
  { name: "Columbus Day", dateFn: calculateColumbusDay, country: 'US' as const },
  { name: "Veterans Day", dateFn: calculateVeteransDay, country: 'US' as const },
  { name: "US Thanksgiving", dateFn: calculateUSThanksgiving, country: 'US' as const },
  
  // Canada-specific statutory holidays
  { name: "Family Day", dateFn: calculateFamilyDay, country: 'CA' as const },
  { name: "Good Friday", dateFn: calculateGoodFriday, country: 'CA' as const },
  { name: "Victoria Day", dateFn: calculateVictoriaDay, country: 'CA' as const },
  { name: "Canada Day", dateFn: (year: number) => new Date(year, 6, 1), country: 'CA' as const },
  { name: "Labour Day", dateFn: calculateLaborDay, country: 'CA' as const },
  { name: "National Day for Truth and Reconciliation", dateFn: calculateTruthAndReconciliationDay, country: 'CA' as const },
  { name: "Canadian Thanksgiving", dateFn: calculateCanadianThanksgiving, country: 'CA' as const },
  { name: "Remembrance Day", dateFn: calculateRemembranceDay, country: 'CA' as const },
];

/**
 * Determines if we're in a holiday week and when to serve holiday actions
 * 
 * Logic:
 * - For holidays that fall on Friday/Saturday → serve actions on Monday of that week
 * - For holidays that fall on Sunday-Thursday → serve actions on Monday of the week BEFORE
 * - We serve holiday actions during the week leading up to the holiday
 * 
 * @param country - User's country ('US' or 'CA' or null)
 * @param currentDate - Optional current date for testing (defaults to today)
 * @returns HolidayWeekInfo object with details about holiday week
 */
export function getHolidayWeekInfo(
  country: 'US' | 'CA' | null = null,
  currentDate: Date = new Date()
): HolidayWeekInfo {
  const currentYear = currentDate.getFullYear();
  const nextYear = currentYear + 1;
  
  // Check holidays for current year and next year (for holidays near year end)
  const yearsToCheck = [currentYear, nextYear];
  
  for (const year of yearsToCheck) {
    for (const holiday of SUPPORTED_HOLIDAYS) {
      // Skip if country doesn't match
      if (holiday.country && holiday.country !== country) {
        continue;
      }
      
      // Skip if country is required but user has no country
      if (holiday.country && !country) {
        continue;
      }
      
      try {
        const holidayDate = holiday.dateFn(year);
        const holidayDayOfWeek = holidayDate.getDay();
        
        // Determine which Monday to start serving actions
        // If holiday is on Day 5 (Friday) or Day 6 (Saturday), serve on Monday of that week
        // If holiday is on Day 0-4 (Sunday-Thursday), serve on Monday of the week BEFORE
        let serveWeekStart: Date;
        
        if (holidayDayOfWeek >= 5) {
          // Holiday is Friday (5) or Saturday (6) - serve on Monday of that week
          const daysToMonday = holidayDayOfWeek - 1;
          serveWeekStart = new Date(holidayDate);
          serveWeekStart.setDate(holidayDate.getDate() - daysToMonday);
        } else {
          // Holiday is Sunday (0) through Thursday (4) - serve on Monday of the week BEFORE
          let daysToMondayOfHolidayWeek: number;
          if (holidayDayOfWeek === 0) {
            daysToMondayOfHolidayWeek = 6; // Sunday to Monday of that week
          } else {
            daysToMondayOfHolidayWeek = holidayDayOfWeek - 1; // Monday=0, Tuesday=1, etc.
          }
          serveWeekStart = new Date(holidayDate);
          serveWeekStart.setDate(holidayDate.getDate() - daysToMondayOfHolidayWeek - 7); // Go back one more week
        }
        
        // Set to start of day (midnight)
        serveWeekStart.setHours(0, 0, 0, 0);
        const currentDateStart = new Date(currentDate);
        currentDateStart.setHours(0, 0, 0, 0);
        
        // Check if we're in the holiday week (7 days starting from serveWeekStart)
        const weekEnd = new Date(serveWeekStart);
        weekEnd.setDate(serveWeekStart.getDate() + 6); // 7 days total (Mon-Sun)
        weekEnd.setHours(23, 59, 59, 999);
        
        const isHolidayWeek = currentDateStart >= serveWeekStart && currentDateStart <= weekEnd;
        
        if (isHolidayWeek) {
          return {
            isHolidayWeek: true,
            holidayName: holiday.name,
            holidayDate: holidayDate,
            serveWeekStart,
          };
        }
      } catch (error) {
        // Skip this holiday if there's an error calculating the date
        continue;
      }
    }
  }
  
  return {
    isHolidayWeek: false,
    holidayName: null,
    holidayDate: null,
    serveWeekStart: null,
  };
}

/**
 * Get holiday keywords for filtering holiday actions
 * Returns an array of keywords that match the holiday name
 */
export function getHolidayKeywords(holidayName: string | null): string[] {
  if (!holidayName) return [];
  
  const name = holidayName.toLowerCase();
  const keywords: string[] = [];
  
  // Map holiday names to keywords
  if (name.includes('valentine')) {
    keywords.push('valentine', 'valentine\'s day', 'valentines');
  } else if (name.includes('easter')) {
    keywords.push('easter', 'easter egg');
  } else if (name.includes('thanksgiving')) {
    keywords.push('thanksgiving', 'turkey');
    if (name.includes('us')) {
      keywords.push('us thanksgiving');
    } else if (name.includes('canadian') || name.includes('canada')) {
      keywords.push('canadian thanksgiving');
    }
  } else if (name.includes('independence day') || name.includes('july 4')) {
    keywords.push('independence day', 'july 4', '4th of july', 'fourth of july');
  } else if (name.includes('canada day')) {
    keywords.push('canada day', 'canadian');
  } else if (name.includes('memorial day')) {
    keywords.push('memorial day');
  } else if (name.includes('labor day') || name.includes('labour day')) {
    keywords.push('labor day', 'labour day');
  } else if (name.includes('victoria day')) {
    keywords.push('victoria day');
  } else if (name.includes('new year')) {
    keywords.push('new year', 'new year\'s', 'relationship goals');
  } else if (name.includes('christmas')) {
    keywords.push('christmas', 'christmas tree', 'holiday');
  } else if (name.includes('martin luther king') || name.includes('mlk')) {
    keywords.push('martin luther king', 'mlk', 'mlk day');
  } else if (name.includes('presidents') || name.includes('washington')) {
    keywords.push('presidents day', 'washington\'s birthday', 'presidents\' day');
  } else if (name.includes('juneteenth')) {
    keywords.push('juneteenth', 'june 19');
  } else if (name.includes('columbus day')) {
    keywords.push('columbus day');
  } else if (name.includes('veterans day')) {
    keywords.push('veterans day', 'veteran');
  } else if (name.includes('family day')) {
    keywords.push('family day');
  } else if (name.includes('good friday')) {
    keywords.push('good friday', 'easter');
  } else if (name.includes('truth and reconciliation') || name.includes('truth & reconciliation')) {
    keywords.push('truth and reconciliation', 'truth & reconciliation', 'orange shirt day');
  } else if (name.includes('remembrance day')) {
    keywords.push('remembrance day', 'remembrance', 'veteran');
  }
  
  return keywords;
}

