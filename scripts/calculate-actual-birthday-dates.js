// Calculate actual birthday week dates based on test data
// The test data sets spouse_birthday to CURRENT_DATE + 7 days

const today = new Date();
today.setHours(0, 0, 0, 0);

// Birthday is 7 days from today (as per test data)
const birthday = new Date(today);
birthday.setDate(today.getDate() + 7);

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const birthdayDayOfWeek = birthday.getDay();

// Calculate serveWeekStart based on birthday logic
let serveWeekStart;
if (birthdayDayOfWeek >= 5) {
  // Birthday is Friday (5) or Saturday (6) - serve on Monday of that week
  const daysToMonday = birthdayDayOfWeek - 1;
  serveWeekStart = new Date(birthday);
  serveWeekStart.setDate(birthday.getDate() - daysToMonday);
} else {
  // Birthday is Sunday (0) through Thursday (4) - serve on Monday of the week BEFORE
  let daysToMondayOfBirthdayWeek;
  if (birthdayDayOfWeek === 0) {
    daysToMondayOfBirthdayWeek = 6;
  } else {
    daysToMondayOfBirthdayWeek = birthdayDayOfWeek - 1;
  }
  serveWeekStart = new Date(birthday);
  serveWeekStart.setDate(birthday.getDate() - daysToMondayOfBirthdayWeek - 7);
}

serveWeekStart.setHours(0, 0, 0, 0);
const weekEnd = new Date(serveWeekStart);
weekEnd.setDate(serveWeekStart.getDate() + 6);
weekEnd.setHours(23, 59, 59, 999);

// Day 1 is the serveWeekStart (Monday)
const day1 = new Date(serveWeekStart);
const day1ActionDate = new Date(serveWeekStart);
day1ActionDate.setDate(serveWeekStart.getDate() + 1); // Tomorrow's action

const isTodayDay1 = today.getTime() === serveWeekStart.getTime();
const daysUntilDay1 = Math.ceil((serveWeekStart - today) / (1000 * 60 * 60 * 24));

console.log(JSON.stringify({
  today: today.toISOString().split('T')[0],
  todayDayName: dayNames[today.getDay()],
  birthday: birthday.toISOString().split('T')[0],
  birthdayDayName: dayNames[birthdayDayOfWeek],
  birthdayDayOfWeek: birthdayDayOfWeek,
  serveWeekStart: serveWeekStart.toISOString().split('T')[0],
  serveWeekStartDayName: dayNames[serveWeekStart.getDay()],
  weekEnd: weekEnd.toISOString().split('T')[0],
  day1: day1.toISOString().split('T')[0],
  day1DayName: dayNames[day1.getDay()],
  day1ActionDate: day1ActionDate.toISOString().split('T')[0],
  day1ActionDayName: dayNames[day1ActionDate.getDay()],
  isTodayDay1: isTodayDay1,
  daysUntilDay1: daysUntilDay1,
  emailSentDate: serveWeekStart.toISOString().split('T')[0],
  emailSentTime: '12:00 PM',
  actionDate: day1ActionDate.toISOString().split('T')[0]
}, null, 2));

