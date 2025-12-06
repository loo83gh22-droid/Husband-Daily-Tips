/**
 * Script to check for duplicate actions in the database
 * Run with: node scripts/check-duplicate-actions.js
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

async function checkDuplicates() {
  console.log('Checking for duplicate actions...\n');

  // Get all actions
  const { data: actions, error } = await supabase
    .from('actions')
    .select('id, name, description, category, theme')
    .order('name');

  if (error) {
    console.error('Error fetching actions:', error);
    return;
  }

  console.log(`Total actions: ${actions.length}\n`);

  // Check for exact name duplicates
  const nameMap = new Map();
  const duplicatesByName = [];

  actions.forEach(action => {
    const normalizedName = action.name?.toLowerCase().trim();
    if (nameMap.has(normalizedName)) {
      duplicatesByName.push({
        name: action.name,
        id: action.id,
        existingId: nameMap.get(normalizedName).id,
        category: action.category,
        theme: action.theme,
      });
    } else {
      nameMap.set(normalizedName, action);
    }
  });

  // Check for similar names (fuzzy matching)
  const similarNames = [];
  const actionNames = actions.map(a => ({
    id: a.id,
    name: a.name?.toLowerCase().trim() || '',
    original: a.name,
    category: a.category,
  }));

  for (let i = 0; i < actionNames.length; i++) {
    for (let j = i + 1; j < actionNames.length; j++) {
      const name1 = actionNames[i].name;
      const name2 = actionNames[j].name;
      
      // Check if names are very similar (same words, different order, or minor variations)
      if (name1 && name2 && name1.length > 5 && name2.length > 5) {
        const words1 = name1.split(/\s+/).sort();
        const words2 = name2.split(/\s+/).sort();
        
        // If 80% of words match, consider them similar
        const commonWords = words1.filter(w => words2.includes(w));
        const similarity = commonWords.length / Math.max(words1.length, words2.length);
        
        if (similarity > 0.8 && name1 !== name2) {
          similarNames.push({
            action1: { id: actionNames[i].id, name: actionNames[i].original, category: actionNames[i].category },
            action2: { id: actionNames[j].id, name: actionNames[j].original, category: actionNames[j].category },
            similarity: (similarity * 100).toFixed(1) + '%',
          });
        }
      }
    }
  }

  // Check for duplicate descriptions
  const descMap = new Map();
  const duplicatesByDesc = [];

  actions.forEach(action => {
    const normalizedDesc = action.description?.toLowerCase().trim().substring(0, 100);
    if (normalizedDesc && descMap.has(normalizedDesc)) {
      duplicatesByDesc.push({
        name: action.name,
        id: action.id,
        existingId: descMap.get(normalizedDesc).id,
        description: action.description?.substring(0, 100) + '...',
      });
    } else if (normalizedDesc) {
      descMap.set(normalizedDesc, action);
    }
  });

  // Report results
  if (duplicatesByName.length > 0) {
    console.log('⚠️  EXACT NAME DUPLICATES FOUND:');
    duplicatesByName.forEach(dup => {
      console.log(`  - "${dup.name}" (ID: ${dup.id}) duplicates (ID: ${dup.existingId})`);
      console.log(`    Category: ${dup.category}, Theme: ${dup.theme}\n`);
    });
  } else {
    console.log('✅ No exact name duplicates found');
  }

  console.log('\n');

  if (similarNames.length > 0) {
    console.log('⚠️  SIMILAR NAMES FOUND (potential duplicates):');
    similarNames.forEach(pair => {
      console.log(`  - "${pair.action1.name}" (ID: ${pair.action1.id}, ${pair.action1.category})`);
      console.log(`    vs "${pair.action2.name}" (ID: ${pair.action2.id}, ${pair.action2.category})`);
      console.log(`    Similarity: ${pair.similarity}\n`);
    });
  } else {
    console.log('✅ No similar names found');
  }

  console.log('\n');

  if (duplicatesByDesc.length > 0) {
    console.log('⚠️  DUPLICATE DESCRIPTIONS FOUND:');
    duplicatesByDesc.forEach(dup => {
      console.log(`  - "${dup.name}" (ID: ${dup.id}) has same description as (ID: ${dup.existingId})`);
      console.log(`    Description: ${dup.description}\n`);
    });
  } else {
    console.log('✅ No duplicate descriptions found');
  }

  console.log('\n--- Summary ---');
  console.log(`Total actions: ${actions.length}`);
  console.log(`Exact duplicates: ${duplicatesByName.length}`);
  console.log(`Similar names: ${similarNames.length}`);
  console.log(`Duplicate descriptions: ${duplicatesByDesc.length}`);
}

checkDuplicates().catch(console.error);

