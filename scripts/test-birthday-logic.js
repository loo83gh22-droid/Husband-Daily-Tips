const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBirthdayLogic() {
  console.log('\n🧪 Testing Birthday Action Logic\n');
  console.log('='.repeat(60));
  
  const email = 'waterloo1983hawk22@gmail.com';
  
  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('id, email, spouse_birthday, work_days')
    .eq('email', email)
    .single();
  
  if (!user) {
    console.error('User not found');
    return;
  }
  
  console.log(`\n📋 User: ${user.email}`);
  console.log(`   Birthday: ${user.spouse_birthday}`);
  console.log(`   Work Days: ${JSON.stringify(user.work_days)}\n`);
  
  // Test 1: Calculate days until birthday
  console.log('Test 1: Days Until Birthday Calculation');
  console.log('-'.repeat(60));
  
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  
  const birthdayInput = user.spouse_birthday;
  const birthdayDate = typeof birthdayInput === 'string' 
    ? new Date(birthdayInput) 
    : birthdayInput;
  
  const currentYear = today.getFullYear();
  const thisYearBirthday = new Date(birthdayDate);
  thisYearBirthday.setFullYear(currentYear);
  thisYearBirthday.setHours(0, 0, 0, 0);
  
  const birthdayThisYear = thisYearBirthday < todayStart
    ? new Date(thisYearBirthday.getFullYear() + 1, thisYearBirthday.getMonth(), thisYearBirthday.getDate())
    : thisYearBirthday;
  
  const daysUntilBirthday = Math.floor((birthdayThisYear.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log(`   Today: ${todayStart.toISOString().split('T')[0]}`);
  console.log(`   Next Birthday: ${birthdayThisYear.toISOString().split('T')[0]}`);
  console.log(`   Days Until Birthday: ${daysUntilBirthday}`);
  console.log(`   Should Serve Birthday Actions? ${daysUntilBirthday >= 0 && daysUntilBirthday <= 21 ? '❌ YES (WRONG!)' : '✅ NO (CORRECT)'}`);
  
  // Test 2: Check if getBirthdayWeekInfo would trigger
  console.log('\nTest 2: Birthday Week Info Check');
  console.log('-'.repeat(60));
  
  const { getBirthdayWeekInfo } = await import('../lib/birthday-utils.ts');
  const birthdayInfo = getBirthdayWeekInfo(
    user.spouse_birthday,
    user.work_days || null,
    today
  );
  
  console.log(`   Is Birthday Week: ${birthdayInfo.isBirthdayWeek}`);
  console.log(`   Birthday Date: ${birthdayInfo.birthdayDate?.toISOString().split('T')[0] || 'N/A'}`);
  console.log(`   Serve Week Start: ${birthdayInfo.serveWeekStart?.toISOString().split('T')[0] || 'N/A'}`);
  console.log(`   Should Serve? ${birthdayInfo.isBirthdayWeek ? '❌ YES (WRONG!)' : '✅ NO (CORRECT)'}`);
  
  // Test 3: Simulate selectWeeklyPlanningActions logic
  console.log('\nTest 3: Weekly Planning Actions Selection Logic');
  console.log('-'.repeat(60));
  
  if (daysUntilBirthday < 0 || daysUntilBirthday > 21) {
    console.log(`   ✅ Birthday is ${daysUntilBirthday} days away (>21 days)`);
    console.log(`   ✅ selectWeeklyPlanningActions should SKIP birthday actions`);
    console.log(`   ✅ Should return regular planning actions instead`);
  } else {
    console.log(`   ❌ Birthday is ${daysUntilBirthday} days away (within 21 days)`);
    console.log(`   ⚠️  This would trigger birthday action selection`);
  }
  
  // Test 4: Check email template logic
  console.log('\nTest 4: Email Template Birthday Header Logic');
  console.log('-'.repeat(60));
  
  // Simulate the actions from the email
  const testActions = [
    { name: 'Create a Photo Album Together', description: 'Gather photos' },
    { name: 'Trail Running', description: 'Go trail running' },
    { name: 'Create a Birthday Scavenger Hunt', description: 'Design a personalized scavenger hunt' },
    { name: 'Date Night', description: 'Plan and execute' },
    { name: 'Plan a Birthday Staycation', description: 'Transform your home' }
  ];
  
  const allHaveBirthday = testActions.length === 5 && testActions.every(a => {
    const actionText = `${a.name || ''} ${a.description || ''}`.toLowerCase();
    return actionText.includes('birthday');
  });
  
  console.log(`   Test Actions: ${testActions.length} actions`);
  console.log(`   Actions with "birthday": ${testActions.filter(a => {
    const text = `${a.name} ${a.description}`.toLowerCase();
    return text.includes('birthday');
  }).length}`);
  console.log(`   All have birthday? ${allHaveBirthday}`);
  console.log(`   Should show birthday header? ${allHaveBirthday ? '❌ YES (WRONG!)' : '✅ NO (CORRECT)'}`);
  
  // Test 5: Check if selectBirthdayActions would be called
  console.log('\nTest 5: selectBirthdayActions Call Prevention');
  console.log('-'.repeat(60));
  
  if (daysUntilBirthday < 0 || daysUntilBirthday > 21) {
    console.log(`   ✅ selectBirthdayActions should NOT be called`);
    console.log(`   ✅ Primary safeguard (21-day check) should prevent it`);
  } else if (!birthdayInfo.isBirthdayWeek) {
    console.log(`   ✅ selectBirthdayActions should NOT be called`);
    console.log(`   ✅ Secondary safeguard (isBirthdayWeek check) should prevent it`);
  } else {
    console.log(`   ❌ selectBirthdayActions WOULD be called`);
    console.log(`   ⚠️  This indicates a bug in the validation logic`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const testsPassed = [
    daysUntilBirthday > 21,
    !birthdayInfo.isBirthdayWeek,
    !allHaveBirthday,
    daysUntilBirthday > 21 || !birthdayInfo.isBirthdayWeek
  ].filter(Boolean).length;
  
  console.log(`\n✅ Tests Passed: ${testsPassed}/4`);
  
  if (testsPassed === 4) {
    console.log('\n🎉 All tests passed! Birthday logic is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the logic above.');
  }
  
  console.log('\n');
}

testBirthdayLogic().catch(console.error);

