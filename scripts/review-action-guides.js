const fs = require('fs');
const path = require('path');

// Read the action-guide-mapping file
const mappingContent = fs.readFileSync('lib/action-guide-mapping.ts', 'utf8');

// Extract all direct matches
const directMatches = {};
const directMatchRegex = /'([^']+)':\s*'([^']+)',/g;
let match;
while ((match = directMatchRegex.exec(mappingContent)) !== null) {
  directMatches[match[1].toLowerCase().trim()] = match[2];
}

// Read all migration files
const migrationsDir = 'supabase/migrations';
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

const actions = new Map();

// Extract actions from migration files
files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    // Match INSERT INTO actions statements
    const insertRegex = /INSERT INTO actions[^;]+VALUES[^;]+'([^']+)',[^;]+'([^']+)',[^;]+'([^']+)',[^;]+'([^']+)'/gis;
    let m;
    while ((m = insertRegex.exec(content)) !== null) {
      const name = m[1];
      const description = m[2]?.substring(0, 150) || '';
      const category = m[3] || '';
      const theme = m[4] || '';
      
      if (name && name.length < 200) {
        const normalizedName = name.toLowerCase().trim();
        if (!actions.has(normalizedName)) {
          actions.set(normalizedName, {
            name: name,
            description: description,
            category: category,
            theme: theme,
            currentGuide: directMatches[normalizedName] || 'NO_MAPPING'
          });
        }
      }
    }
  } catch (e) {
    // Skip files that can't be read
  }
});

// Output results
console.log(`Found ${actions.size} unique actions\n`);
console.log('Actions and their current guide mappings:\n');

const sortedActions = Array.from(actions.values()).sort((a, b) => a.name.localeCompare(b.name));

sortedActions.forEach(action => {
  console.log(`Action: "${action.name}"`);
  console.log(`  Category: ${action.category}`);
  console.log(`  Theme: ${action.theme}`);
  console.log(`  Current Guide: ${action.currentGuide}`);
  console.log(`  Description: ${action.description.substring(0, 100)}...`);
  console.log('');
});

// Generate a report
const report = {
  totalActions: actions.size,
  actionsWithMappings: Array.from(actions.values()).filter(a => a.currentGuide !== 'NO_MAPPING').length,
  actionsWithoutMappings: Array.from(actions.values()).filter(a => a.currentGuide === 'NO_MAPPING').length,
  actions: sortedActions
};

fs.writeFileSync('action-guide-review.json', JSON.stringify(report, null, 2));
console.log('\nReport saved to action-guide-review.json');

