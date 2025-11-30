/**
 * Export all actions to CSV for Google Sheets
 * Run: node scripts/export-actions-to-csv.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure .env.local has:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define grouping/categories for similar actions
// Based on functional similarity and user grouping patterns
const actionGroups = {
  'Communication - Active Listening & Understanding': [
    'Listen Without Defending',
    'Repeat Back What You Heard',
    'Don\'t Interrupt Her',
    'Ask Follow-Up Questions',
    'Ask Open-Ended Questions',
    'Validate Her Feelings',
    'Remember Something She Told You',
  ],
  'Communication - Sharing & Conversations': [
    'Have a Real Conversation',
    'Have a "No Problem Solving" Conversation',
    'Share Your Day Without Complaining',
    'Share Your Feelings',
    'Daily Check-In',
    'Tell Her Something You Appreciate',
  ],
  'Communication - Needs & Requests': [
    'Ask "What Do You Need From Me?"',
    'Express Gratitude',
  ],
  'Communication - Conflict Resolution': [
    'Apologize Sincerely',
    'Apologize First',
    'Apologize and Make Amends',
    'Stay Calm',
    'Stay Calm and Speak Softly',
    'Use "I Feel" Instead of "You Always"',
    'Find Common Ground',
    'Resolve a Disagreement',
    'Take Responsibility',
    'Take Responsibility for Your Part',
    'Take a Break When Things Get Heated',
    'Propose a Solution',
  ],
  'Romance - Date Nights': [
    'Go Dancing',
    'Go For Beer & Wings',
    'Sign Up for a Couples Art Class Project',
    'Plan a Date Night',
    'Surprise Date Night',
  ],
  'Romance - Appreciation & Affection': [
    'Write a Love Note',
    'Give Her a Compliment',
    'Tell Her Why You Love Her',
  ],
  'Intimacy - Physical Connection': [
    'Physical Touch',
    'Initiate Physical Intimacy Without Pressure',
    'Focus on Her Pleasure',
    'Learn About Her Body',
  ],
  'Intimacy - Emotional Connection': [
    'Create Intimacy Without Sex',
    'Have a Conversation About Intimacy',
    'Love Language Practice',
    'Words of Affirmation',
    'Acts of Service',
  ],
  'Intimacy - Games & Activities': [
    'Play Intimacy Building Games',
    'Play TableTopics for Couples',
    'Play We\'re Not Really Strangers',
    'Try The Gottman Card Decks App',
    'Quality Time',
  ],
  'Partnership - Household & Responsibilities': [
    'Be Proactive',
    'Handle a Responsibility',
    'Do a Deep Clean Together',
    'Create a Cleaning Schedule Together',
    'Organize a Cluttered Space',
    'Organize a Closet or Storage Space Together',
  ],
  'Partnership - Planning & Projects': [
    'Plan Together',
    'Build Something Together',
    'Create a Vision Board Together',
    'Create a Photo Album Together',
    'Create Art Together',
    'Create a Shared Playlist Together',
  ],
  'Gratitude - Daily Appreciation': [
    'Morning Gratitude',
    'Gratitude Text',
    'Send a Gratitude Text',
    'Say Thank You Before Bed',
    'Thank Her for Something Specific',
    'Thank Her for the Little Things',
    'Thank Her for Who She Is',
    'Thank You for Chores',
    'Gratitude List',
    'Write a Gratitude List for Your Partner',
    'Write Down What You\'re Grateful For',
    'Express Gratitude Publicly',
    'Acknowledge Her Effort',
    'Appreciate Her Uniqueness',
    'Appreciate Their Effort',
    'Celebrate Her Accomplishment',
    'Notice the Small Things',
    'Honor Memorial Day Together',
    'Tell Her What You\'re Grateful For',
  ],
  'Quality Time - Activities': [
    'Go for a Walk Together',
    'Cook Together',
    'Watch a Movie Together',
  ],
  'Reconnection - Roommate Recovery': [
    'Break the Routine',
    'Reconnect After a Long Day',
  ],
};

async function exportActions() {
  try {
    // Get all actions
    const { data: actions, error } = await supabase
      .from('actions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching actions:', error);
      process.exit(1);
    }

    if (!actions || actions.length === 0) {
      console.error('No actions found in database');
      process.exit(1);
    }

    console.log(`Found ${actions.length} actions`);

    // Create CSV header
    const headers = [
      'Group',
      'Action Name',
      'Category',
      'Description',
      'Why This Matters',
      'Icon',
      'Type',
      'Requirement Type',
      'Display Order',
      'Eligible for 7-Day Events',
      'Created At',
    ];

    // Create rows
    const rows = [];
    
    // First, add actions that match our groups
    const groupedActions = new Set();
    
    for (const [groupName, actionNames] of Object.entries(actionGroups)) {
      for (const actionName of actionNames) {
        const action = actions.find(a => a.name === actionName);
        if (action) {
          rows.push([
            groupName,
            action.name,
            action.category || '',
            action.description || '',
            action.benefit || '',
            action.icon || '',
            action.type || 'Daily',
            action.requirement_type || '',
            action.display_order || '',
            action.eligible_for_7day_events ? 'Yes' : 'No',
            action.created_at ? new Date(action.created_at).toLocaleDateString() : '',
          ]);
          groupedActions.add(action.id);
        }
      }
    }

    // Add remaining actions (not in groups) - group by category
    const remainingActions = actions.filter(a => !groupedActions.has(a.id));
    
    // Group remaining by category
    const byCategory = {};
    remainingActions.forEach(action => {
      const category = action.category || 'Uncategorized';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(action);
    });

    // Add remaining actions grouped by category
    for (const [category, categoryActions] of Object.entries(byCategory)) {
      for (const action of categoryActions) {
        rows.push([
          `${category} - Other`,
          action.name,
          action.category || '',
          action.description || '',
          action.benefit || '',
          action.icon || '',
          action.type || 'Daily',
          action.requirement_type || '',
          action.display_order || '',
          action.eligible_for_7day_events ? 'Yes' : 'No',
          action.created_at ? new Date(action.created_at).toLocaleDateString() : '',
        ]);
      }
    }

    // Convert to CSV
    const csvRows = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escape commas and quotes in cells
          const cellStr = String(cell || '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ];

    const csv = csvRows.join('\n');

    // Write to file
    const fs = require('fs');
    const path = require('path');
    const outputPath = path.join(__dirname, '..', 'actions-export.csv');
    fs.writeFileSync(outputPath, csv, 'utf8');

    console.log(`\n✅ Exported ${rows.length} actions to: ${outputPath}`);
    console.log(`\n📊 Groups created:`);
    Object.keys(actionGroups).forEach(group => {
      console.log(`   - ${group}`);
    });
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Open Google Sheets`);
    console.log(`   2. File → Import → Upload`);
    console.log(`   3. Select: actions-export.csv`);
    console.log(`   4. Choose: "Insert new sheet(s)"`);
    console.log(`   5. Click "Import data"`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

exportActions();

