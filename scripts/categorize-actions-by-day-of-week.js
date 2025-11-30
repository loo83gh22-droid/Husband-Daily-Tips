/**
 * Categorize all actions as either "weekly_routine" or "planning_required"
 * 
 * Weekly Routine: Simple actions that can be done at home any day
 * Planning Required: Actions that need planning/going out (better for weekends)
 * 
 * Usage:
 *   node scripts/categorize-actions-by-day-of-week.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Make sure .env.local has:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Keywords that indicate planning is required (must be specific to avoid false positives)
// These are checked AFTER weekly_routine to catch complex activities
const planningRequiredKeywords = [
  // Going out / activities (specific phrases that require leaving home)
  'take her out', 'take your partner out', 'date night', 'go to', 'go for a', 'go on a', 'go out',
  'go dancing', 'go hiking', 'go camping', 'go get', 'go streaking',
  'restaurant', 'movie theater', 'theater', 'concert', 'show', 'live music',
  'camping trip', 'camping', 'hiking', 'outdoor adventure', 'adventure', 'trip', 'travel', 'vacation', 'weekend getaway', 'getaway',
  'beach day', 'beach', 'park', 'lake', 'river', 'mountain', 'trail',
  'shopping', 'mall', 'store', 'gift shop',
  'event', 'party', 'celebration', 'festival', 'fair',
  'museum', 'gallery', 'exhibit', 'zoo', 'aquarium',
  'sport', 'game', 'match', 'tournament', 'race',
  'spa', 'salon', 'appointment',
  'dinner out', 'lunch out', 'brunch out', 'breakfast out',
  'road trip', 'roadtrip',
  'picnic', 'outdoor meal',
  'wine tasting', 'brewery', 'winery',
  'class', 'workshop', 'lesson', 'course',
  'reservation', 'book tickets', 'tickets',
  'bike ride', 'scenic drive', 'stargazing', 'rock climbing', 'disc golf',
  'geocaching', 'kayaking', 'canoeing', 'swimming', 'yoga in nature',
  'outdoor concert', 'outdoor event', 'outdoor dance', 'outdoor game',
  
  // Planning/coordination needed (specific phrases)
  'plan a trip', 'plan a weekend', 'plan a surprise date', 'plan a romantic',
  'plan a special', 'plan a family activity', 'plan a valentine',
  'organize a', 'arrange', 'schedule', 'coordinate',
  'surprise her', 'surprise your partner',
  'special occasion', 'special event',
  
  // Activities that require leaving home (specific)
  'explore a new place', 'visit', 'long distance walk',
  'take the kids out', 'take the kids',
];

// Keywords that indicate it's a simple routine action (can do at home)
// These are checked FIRST to catch simple actions before planning_required
// Must be specific to avoid catching complex activities
const weeklyRoutineKeywords = [
  // Simple communication (very common patterns - must be specific)
  'tell her something', 'tell her she', 'tell her why', 'tell her what', 'tell her you',
  'say thank you', 'say something', 'say sorry',
  'send a text', 'send a message', 'gratitude text',
  'check in', 'check-in', 'daily check-in',
  'ask her', 'ask your partner', 'ask what', 'ask about',
  'listen to her', 'listen without', 'listen actively',
  
  // Simple gratitude/appreciation (specific patterns)
  'gratitude text', 'gratitude list', 'express gratitude', 'show gratitude',
  'thank her for', 'thank you for', 'say thank you',
  'appreciate her', 'appreciate their', 'acknowledge her',
  
  // Simple compliments/affirmation (specific)
  'compliment her', 'compliment your partner', 'words of affirmation',
  'tell her she\'s', 'tell her why you',
  
  // Simple physical (at home - specific)
  'hug', 'kiss', 'cuddle', 'non-sexual physical touch',
  'physical affection', 'physical touch',
  
  // Simple chores (at home - specific)
  'take over a chore', 'handle a responsibility', 'do the dishes',
  'handle bedtime', 'handle pet',
  
  // Simple cooking (at home - but not "cook together" which might need planning)
  'make dinner', 'make breakfast', 'make mom breakfast',
  'cook her favorite', 'prepare a meal',
  
  // Simple help/support (at home)
  'support their goal', 'help her',
  
  // Simple apologies (at home)
  'apologize', 'apologize sincerely', 'apologize first',
  
  // Simple sharing (at home)
  'share your feelings', 'share one feeling', 'share your day',
  'open up', 'be vulnerable',
  
  // Simple organization (at home - but not "organize a" which might need planning)
  'put away', 'declutter', 'tackle a cleaning',
  
  // Simple at-home activities (specific)
  'at home', 'around the house',
  'write a note', 'write a letter', 'leave a love note', 'love note',
  'put your phone down', 'give her your full attention',
  'tech-free quality time',
];

function categorizeAction(action) {
  const name = (action.name || '').toLowerCase();
  const description = (action.description || '').toLowerCase();
  const benefit = (action.benefit || '').toLowerCase();
  
  const fullText = `${name} ${description} ${benefit}`;
  
  // Check for routine keywords FIRST (simple actions should be caught here)
  // This ensures simple communication/gratitude actions are weekly_routine
  const hasRoutineKeyword = weeklyRoutineKeywords.some(keyword => 
    fullText.includes(keyword.toLowerCase())
  );
  
  if (hasRoutineKeyword) {
    return 'weekly_routine';
  }
  
  // Then check for planning required keywords (more specific, less common)
  const hasPlanningKeyword = planningRequiredKeywords.some(keyword => 
    fullText.includes(keyword.toLowerCase())
  );
  
  if (hasPlanningKeyword) {
    return 'planning_required';
  }
  
  // Default to weekly_routine for safety (better to err on the side of simplicity)
  // Most actions should be doable at home
  return 'weekly_routine';
}

async function categorizeAllActions() {
  console.log('\n🔍 Fetching all actions...\n');
  
  const { data: actions, error } = await supabase
    .from('actions')
    .select('id, name, description, benefit, day_of_week_category')
    .order('name');
  
  if (error) {
    console.error('❌ Error fetching actions:', error);
    process.exit(1);
  }
  
  if (!actions || actions.length === 0) {
    console.log('⚠️  No actions found in database');
    process.exit(0);
  }
  
  console.log(`📋 Found ${actions.length} actions to categorize\n`);
  
  const categorized = {
    weekly_routine: [],
    planning_required: [],
    unchanged: [],
  };
  
  for (const action of actions) {
    const category = categorizeAction(action);
    const currentCategory = action.day_of_week_category;
    
    if (currentCategory === category) {
      categorized.unchanged.push({ name: action.name, category });
      continue;
    }
    
    // Update the action
    const { error: updateError } = await supabase
      .from('actions')
      .update({ day_of_week_category: category })
      .eq('id', action.id);
    
    if (updateError) {
      console.error(`❌ Error updating action "${action.name}":`, updateError);
      continue;
    }
    
    categorized[category].push({
      name: action.name,
      oldCategory: currentCategory || 'null',
      newCategory: category,
    });
    
    console.log(`✓ ${action.name}`);
    console.log(`  ${currentCategory || 'null'} → ${category}`);
  }
  
  // Summary
  console.log('\n📊 Categorization Summary:\n');
  console.log(`   Weekly Routine: ${categorized.weekly_routine.length} actions`);
  console.log(`   Planning Required: ${categorized.planning_required.length} actions`);
  console.log(`   Unchanged: ${categorized.unchanged.length} actions`);
  console.log(`   Total: ${actions.length} actions\n`);
  
  if (categorized.weekly_routine.length > 0) {
    console.log('📝 Weekly Routine Actions:');
    categorized.weekly_routine.forEach(a => {
      console.log(`   - ${a.name} (${a.oldCategory} → ${a.newCategory})`);
    });
    console.log('');
  }
  
  if (categorized.planning_required.length > 0) {
    console.log('📝 Planning Required Actions:');
    categorized.planning_required.forEach(a => {
      console.log(`   - ${a.name} (${a.oldCategory} → ${a.newCategory})`);
    });
    console.log('');
  }
  
  console.log('✅ Categorization complete!\n');
}

categorizeAllActions().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

