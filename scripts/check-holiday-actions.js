/**
 * Script to check if Labor/Labour Day and Thanksgiving actions are country-specific
 * Run with: node scripts/check-holiday-actions.js
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

async function checkHolidayActions() {
  console.log('Checking Labor/Labour Day and Thanksgiving actions...\n');

  // Get Labor/Labour Day actions
  const { data: laborActions, error: laborError } = await supabase
    .from('actions')
    .select('id, name, description, category, theme, country, seasonal_start_date, seasonal_end_date')
    .or('name.ilike.%labor day%,name.ilike.%labour day%')
    .order('name');

  // Get Thanksgiving actions
  const { data: thanksgivingActions, error: thanksgivingError } = await supabase
    .from('actions')
    .select('id, name, description, category, theme, country, seasonal_start_date, seasonal_end_date')
    .or('name.ilike.%thanksgiving%')
    .order('name');

  if (laborError) {
    console.error('Error fetching Labor Day actions:', laborError);
  }
  if (thanksgivingError) {
    console.error('Error fetching Thanksgiving actions:', thanksgivingError);
  }

  console.log('=== LABOR/LABOUR DAY ACTIONS ===\n');
  if (laborActions && laborActions.length > 0) {
    laborActions.forEach(action => {
      console.log(`Name: "${action.name}"`);
      console.log(`  ID: ${action.id}`);
      console.log(`  Category: ${action.category || 'N/A'}`);
      console.log(`  Theme: ${action.theme || 'N/A'}`);
      console.log(`  Country: ${action.country || 'NULL (all countries)'}`);
      console.log(`  Seasonal Start: ${action.seasonal_start_date || 'N/A'}`);
      console.log(`  Seasonal End: ${action.seasonal_end_date || 'N/A'}`);
      console.log('');
    });

    // Check for duplicates
    const laborNames = laborActions.map(a => a.name.toLowerCase());
    const uniqueNames = new Set(laborNames);
    if (laborNames.length !== uniqueNames.size) {
      console.log('⚠️  DUPLICATE NAMES FOUND:');
      const nameCounts = {};
      laborNames.forEach(name => {
        nameCounts[name] = (nameCounts[name] || 0) + 1;
      });
      Object.entries(nameCounts).forEach(([name, count]) => {
        if (count > 1) {
          console.log(`  - "${name}" appears ${count} times`);
          const duplicates = laborActions.filter(a => a.name.toLowerCase() === name);
          duplicates.forEach(dup => {
            console.log(`    ID: ${dup.id}, Country: ${dup.country || 'all'}`);
          });
        }
      });
    } else {
      // Check if they're country-specific variations
      const laborVariations = laborActions.filter(a => a.name.toLowerCase().includes('labor'));
      const labourVariations = laborActions.filter(a => a.name.toLowerCase().includes('labour'));
      
      if (laborVariations.length > 0 && labourVariations.length > 0) {
        console.log('✅ LABOR vs LABOUR - These are spelling variations:');
        laborVariations.forEach(action => {
          console.log(`  - "${action.name}" (${action.country || 'all'})`);
        });
        labourVariations.forEach(action => {
          console.log(`  - "${action.name}" (${action.country || 'all'})`);
        });
        console.log('\n  Recommendation: These should be country-specific (US vs CA)');
      }
    }
  } else {
    console.log('No Labor/Labour Day actions found');
  }

  console.log('\n=== THANKSGIVING ACTIONS ===\n');
  if (thanksgivingActions && thanksgivingActions.length > 0) {
    thanksgivingActions.forEach(action => {
      console.log(`Name: "${action.name}"`);
      console.log(`  ID: ${action.id}`);
      console.log(`  Category: ${action.category || 'N/A'}`);
      console.log(`  Theme: ${action.theme || 'N/A'}`);
      console.log(`  Country: ${action.country || 'NULL (all countries)'}`);
      console.log(`  Seasonal Start: ${action.seasonal_start_date || 'N/A'}`);
      console.log(`  Seasonal End: ${action.seasonal_end_date || 'N/A'}`);
      console.log('');
    });

    // Group by similar names
    const thanksgivingGroups = {};
    thanksgivingActions.forEach(action => {
      const baseName = action.name
        .toLowerCase()
        .replace(/canadian|us |united states |special /g, '')
        .trim();
      
      if (!thanksgivingGroups[baseName]) {
        thanksgivingGroups[baseName] = [];
      }
      thanksgivingGroups[baseName].push(action);
    });

    console.log('--- Grouped by Similar Names ---\n');
    Object.entries(thanksgivingGroups).forEach(([baseName, actions]) => {
      if (actions.length > 1) {
        console.log(`Base: "${baseName}"`);
        actions.forEach(action => {
          console.log(`  - "${action.name}" (ID: ${action.id}, Country: ${action.country || 'all'})`);
        });
        
        const countries = actions.map(a => a.country || 'all');
        const uniqueCountries = [...new Set(countries)];
        
        if (uniqueCountries.length > 1) {
          console.log(`  ✅ Country-specific variations (${uniqueCountries.join(', ')})`);
        } else if (uniqueCountries.length === 1 && uniqueCountries[0] !== 'all') {
          console.log(`  ⚠️  All variations are for same country: ${uniqueCountries[0]}`);
        } else {
          console.log(`  ⚠️  All variations are for all countries - may be duplicates`);
        }
        console.log('');
      }
    });
  } else {
    console.log('No Thanksgiving actions found');
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Labor/Labour Day actions: ${laborActions?.length || 0}`);
  console.log(`Thanksgiving actions: ${thanksgivingActions?.length || 0}`);
}

checkHolidayActions().catch(console.error);

