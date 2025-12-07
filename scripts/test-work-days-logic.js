/**
 * Test script to understand work days logic
 * For a user who works Sunday through Thursday
 */

// Day numbers: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

const workDays = [0, 1, 2, 3, 4]; // Sunday through Thursday

// Function from the code
function getFirstWorkDay(workDays) {
  if (!workDays || workDays.length === 0) {
    return 1; // Default to Monday if no work days specified
  }
  // Sort work days and return the first one
  const sorted = [...workDays].sort((a, b) => a - b);
  return sorted[0];
}

const firstWorkDay = getFirstWorkDay(workDays);
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

console.log('='.repeat(60));
console.log('User Schedule: Sunday through Thursday');
console.log('='.repeat(60));
console.log(`Work days array: [${workDays.join(', ')}]`);
console.log(`First work day (numeric): ${firstWorkDay}`);
console.log(`First work day (name): ${dayNames[firstWorkDay]}`);
console.log('\n');

console.log('Email Sending Logic:');
console.log('-'.repeat(60));
console.log('Free users:');
console.log(`  - Get email on: ${dayNames[firstWorkDay]} (day ${firstWorkDay})`);
console.log('Premium users:');
console.log('  - Get emails: 7 days a week (Sunday-Saturday)');
console.log('\n');

console.log('Planning Actions Logic:');
console.log('-'.repeat(60));
console.log('Planning actions are ALWAYS served on: Monday (day 1)');
console.log('Week start date is ALWAYS calculated as: Monday of the week');
console.log('This is hardcoded and does NOT depend on work_days');
console.log('\n');

console.log('Potential Issue:');
console.log('-'.repeat(60));
console.log(`For this user, their first work day is ${dayNames[firstWorkDay]} (day ${firstWorkDay})`);
console.log('But planning actions are served on Monday (day 1)');
console.log('So a free user would get their weekly email on Sunday,');
console.log('but planning actions would still be served on Monday.');
console.log('This might be confusing for users with non-Monday start weeks.');

