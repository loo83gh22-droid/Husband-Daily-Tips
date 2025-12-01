// Calculate birthday week dates and show example email for waterloo1983

const today = new Date();
today.setHours(0, 0, 0, 0);

// Birthday is 7 days from today (as per test data migration)
const birthday = new Date(today);
birthday.setDate(today.getDate() + 7);

const birthdayDayOfWeek = birthday.getDay();
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

// Email is sent at 12pm (noon) in user's timezone
// The email contains tomorrow's action, so if today is in birthday week, tomorrow's email will have a birthday action

console.log('='.repeat(60));
console.log('BIRTHDAY EMAIL CALCULATION FOR waterloo1983');
console.log('='.repeat(60));
console.log('');
console.log(`Today: ${today.toISOString().split('T')[0]} (${dayNames[today.getDay()]})`);
console.log(`Spouse Birthday: ${birthday.toISOString().split('T')[0]} (${dayNames[birthdayDayOfWeek]})`);
console.log(`Birthday Week Start: ${serveWeekStart.toISOString().split('T')[0]} (Monday)`);
console.log(`Birthday Week End: ${weekEnd.toISOString().split('T')[0]} (Sunday)`);
console.log('');

// Check if today is in birthday week
const isInBirthdayWeek = today >= serveWeekStart && today <= weekEnd;
console.log(`Is today in birthday week? ${isInBirthdayWeek ? 'YES ✓' : 'NO ✗'}`);

if (isInBirthdayWeek) {
  console.log('');
  console.log('🎉 USER IS IN BIRTHDAY WEEK!');
  console.log('');
  console.log('Email Details:');
  console.log(`- Email sent: Today at 12pm (noon) in user's timezone`);
  console.log(`- Email contains: Tomorrow's action (${new Date(today.getTime() + 24*60*60*1000).toISOString().split('T')[0]})`);
  console.log(`- Action type: BIRTHDAY PLANNING ACTION (one of 8 birthday actions)`);
  console.log('');
  console.log('Example Birthday Actions that could be served:');
  console.log('1. Plan a Surprise Birthday Party');
  console.log('2. Book a Weekend Getaway');
  console.log('3. Plan a Special Birthday Dinner');
  console.log('4. Organize a Birthday Experience');
  console.log('5. Create a Birthday Scavenger Hunt');
  console.log('6. Plan a Birthday Celebration with Friends');
  console.log('7. Arrange a Birthday Photo Shoot');
  console.log('8. Plan a Birthday Staycation');
} else {
  const daysUntilBirthdayWeek = Math.ceil((serveWeekStart - today) / (1000 * 60 * 60 * 24));
  console.log('');
  console.log(`⏳ Birthday week starts in ${daysUntilBirthdayWeek} days`);
  console.log(`- Email will contain birthday actions starting: ${serveWeekStart.toISOString().split('T')[0]}`);
}

console.log('');
console.log('='.repeat(60));

