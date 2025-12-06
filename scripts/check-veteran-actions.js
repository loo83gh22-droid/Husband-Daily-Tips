/**
 * Script to check if veteran actions are country-specific
 * Run with: node scripts/check-veteran-actions.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVeteranActions() {
  console.log('Checking veteran-related actions...\n');

  // Get the specific actions
  const { data: actions, error } = await supabase
    .from('actions')
    .select('id, name, description, category, theme, country, seasonal_start_date, seasonal_end_date')
    .or('id.eq.6fdc2328-aa45-4fab-aed2-45a325ae79e3,id.eq.ef70c0ff-9333-44d1-8c3b-d57247c78d13,name.ilike.%veteran%,name.ilike.%remembrance%')
    .order('name');

  if (error) {
    console.error('Error fetching actions:', error);
    return;
  }

  console.log(`Found ${actions.length} veteran/remembrance related actions:\n`);

  actions.forEach(action => {
    console.log(`Name: "${action.name}"`);
    console.log(`  ID: ${action.id}`);
    console.log(`  Category: ${action.category || 'N/A'}`);
    console.log(`  Theme: ${action.theme || 'N/A'}`);
    console.log(`  Country: ${action.country || 'NULL (all countries)'}`);
    console.log(`  Seasonal Start: ${action.seasonal_start_date || 'N/A'}`);
    console.log(`  Seasonal End: ${action.seasonal_end_date || 'N/A'}`);
    console.log(`  Description: ${(action.description || '').substring(0, 100)}...`);
    console.log('');
  });

  // Check specifically for the two duplicate IDs
  const action1 = actions.find(a => a.id === '6fdc2328-aa45-4fab-aed2-45a325ae79e3');
  const action2 = actions.find(a => a.id === 'ef70c0ff-9333-44d1-8c3b-d57247c78d13');

  if (action1 && action2) {
    console.log('--- Comparison ---');
    console.log('Action 1 Country:', action1.country || 'NULL');
    console.log('Action 2 Country:', action2.country || 'NULL');
    
    if (action1.country !== action2.country) {
      console.log('\n✅ ACTIONS ARE DIFFERENT - They serve different countries!');
      console.log('   They should NOT be merged.');
    } else if (action1.seasonal_start_date !== action2.seasonal_start_date) {
      console.log('\n✅ ACTIONS ARE DIFFERENT - They have different seasonal dates!');
      console.log('   They may serve different purposes.');
    } else {
      console.log('\n⚠️  ACTIONS APPEAR TO BE TRUE DUPLICATES');
      console.log('   Same country, same dates - can be merged.');
    }
  }
}

checkVeteranActions().catch(console.error);

