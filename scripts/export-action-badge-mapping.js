/**
 * Export comprehensive action-to-badge mapping to CSV
 * Creates a matrix showing which actions count toward which badges
 * Run: node scripts/export-action-badge-mapping.js
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

// Helper function to check if action name/description matches keywords
function matchesKeywords(text, keywords) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// Determine which badges an action counts toward
// An action can count toward MULTIPLE badges (e.g., ski date = outdoor + adventure + quality time)
function getBadgesForAction(action, allBadges) {
  const badges = [];
  const actionName = (action.name || '').toLowerCase();
  const actionDesc = (action.description || '').toLowerCase();
  const actionText = actionName + ' ' + actionDesc;
  const actionCategory = action.category || '';
  const requirementType = action.requirement_type || '';

  for (const badge of allBadges) {
    let counts = false;
    const badgeName = (badge.name || '').toLowerCase();

    // 1. Category-based badges (category_count) - most common
    if (badge.requirement_type === 'category_count' && badge.category) {
      if (actionCategory === badge.category) {
        counts = true;
      }
    }

    // 2. Date night badges
    if (badge.requirement_type === 'date_nights') {
      if (requirementType === 'date_nights' || 
          matchesKeywords(actionText, ['date night', 'date', 'dancing', 'beer & wings', 'art class', 'dinner', 'movie', 'concert'])) {
        counts = true;
      }
    }

    // 3. Gratitude badges
    if (badge.requirement_type === 'gratitude_actions') {
      if (requirementType === 'gratitude_actions' ||
          matchesKeywords(actionText, ['gratitude', 'thank', 'appreciate', 'grateful'])) {
        counts = true;
      }
    }

    // 4. Apology badges
    if (badge.requirement_type === 'apology_actions') {
      if (requirementType === 'apology_actions' ||
          matchesKeywords(actionText, ['apolog', 'sorry', 'amends'])) {
        counts = true;
      }
    }

    // 5. Surprise badges
    if (badge.requirement_type === 'surprise_actions') {
      if (requirementType === 'surprise_actions' ||
          matchesKeywords(actionText, ['surprise'])) {
        counts = true;
      }
    }

    // 6. Outdoor activity badges (keyword-based)
    // Check badge name for outdoor keywords
    const isOutdoorBadge = badge.requirement_type === 'outdoor_activities' || 
                           badge.requirement_type === 'outdoor_actions' ||
                           badge.requirement_type === 'walk_actions' ||
                           badge.requirement_type === 'hiking_actions' ||
                           badge.requirement_type === 'camping_activities' ||
                           matchesKeywords(badgeName, ['outdoor', 'hiking', 'walking', 'trail', 'camping', 'nature']);
    
    if (isOutdoorBadge) {
      if (matchesKeywords(actionText, [
        'outdoor', 'hiking', 'walk', 'camping', 'nature', 'park', 'beach', 
        'bike', 'biking', 'running', 'jogging', 'fishing', 'ski', 'skiing',
        'snowboard', 'kayak', 'canoe', 'climb', 'climbing', 'trail', 'picnic',
        'garden', 'gardening', 'yard', 'backyard', 'hike', 'trail', 'mountain',
        'forest', 'lake', 'river', 'stream'
      ])) {
        counts = true;
      }
    }

    // 7. Adventure activity badges (keyword-based)
    // Check badge name for adventure keywords
    const isAdventureBadge = badge.requirement_type === 'adventure_activities' ||
                             badge.requirement_type === 'adventure_actions' ||
                             matchesKeywords(badgeName, ['adventure', 'explore', 'explorer', 'daredevil']);
    
    if (isAdventureBadge) {
      if (matchesKeywords(actionText, [
        'adventure', 'explore', 'exploring', 'travel', 'trip', 'excursion',
        'road trip', 'new place', 'discover', 'sightsee', 'sightseeing',
        'vacation', 'getaway', 'journey', 'expedition', 'explorer', 'explore',
        'ski', 'skiing', 'snowboard', 'mountain', 'climb', 'climbing'
      ])) {
        counts = true;
      }
    }

    // 8. Active Together / Fitness badges (keyword-based, can overlap with outdoor/adventure)
    // Check badge name for active/fitness/sport keywords
    const isActiveBadge = badge.requirement_type === 'active_together' || 
                          badge.requirement_type === 'sports_actions' ||
                          badge.requirement_type === 'run_actions' ||
                          matchesKeywords(badgeName, ['active', 'fitness', 'sport', 'together', 'running', 'partners']);
    
    if (isActiveBadge) {
      if (matchesKeywords(actionText, [
        'active', 'fitness', 'workout', 'exercise', 'sport', 'gym', 'run', 'bike',
        'hike', 'swim', 'tennis', 'basketball', 'soccer', 'football', 'volleyball',
        'ski', 'skiing', 'snowboard', 'yoga', 'pilates', 'dance', 'dancing',
        'jog', 'jogging', 'training', 'athletic', 'physical activity'
      ])) {
        counts = true;
      }
    }

    // 9. Quality Time badges (category-based OR keyword-based)
    if (badge.requirement_type === 'category_count' && badge.category === 'Quality Time') {
      if (actionCategory === 'Quality Time') {
        counts = true;
      }
    }
    // Also check if badge name suggests quality time
    if (badge.name && matchesKeywords(badge.name, ['quality time', 'time together'])) {
      if (actionCategory === 'Quality Time' || 
          matchesKeywords(actionText, ['together', 'quality time', 'spend time'])) {
        counts = true;
      }
    }

    // 10. Romance badges (category-based)
    if (badge.requirement_type === 'category_count' && badge.category === 'Romance') {
      if (actionCategory === 'Romance') {
        counts = true;
      }
    }

    // 11. Communication badges (category-based)
    if (badge.requirement_type === 'category_count' && badge.category === 'Communication') {
      if (actionCategory === 'Communication') {
        counts = true;
      }
    }

    // 12. Intimacy badges (category-based)
    if (badge.requirement_type === 'category_count' && badge.category === 'Intimacy') {
      if (actionCategory === 'Intimacy') {
        counts = true;
      }
    }

    // 13. Partnership badges (category-based)
    if (badge.requirement_type === 'category_count' && badge.category === 'Partnership') {
      if (actionCategory === 'Partnership') {
        counts = true;
      }
    }

    // 14. Conflict Resolution badges (category-based)
    if (badge.requirement_type === 'category_count' && badge.category === 'Conflict Resolution') {
      if (actionCategory === 'Conflict Resolution') {
        counts = true;
      }
    }

    // 15. Reconnection badges (category-based)
    if (badge.requirement_type === 'category_count' && badge.category === 'Reconnection') {
      if (actionCategory === 'Reconnection') {
        counts = true;
      }
    }

    // 16. Gratitude badges (category-based)
    if (badge.requirement_type === 'category_count' && badge.category === 'Gratitude') {
      if (actionCategory === 'Gratitude') {
        counts = true;
      }
    }

    if (counts) {
      badges.push(badge);
    }
  }

  return badges;
}

async function exportMapping() {
  try {
    // Get all actions
    const { data: actions, error: actionsError } = await supabase
      .from('actions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (actionsError) {
      console.error('Error fetching actions:', actionsError);
      process.exit(1);
    }

    // Get all badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('category', { ascending: true })
      .order('requirement_type', { ascending: true })
      .order('requirement_value', { ascending: true });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      process.exit(1);
    }

    console.log(`Found ${actions.length} actions and ${badges.length} badges`);

    // Create header row
    const headers = [
      'Action Name',
      'Action Description',
      'Category',
      'Sub Category (Requirement Type)',
      ...badges.map(b => b.name)
    ];

    // Create rows
    const rows = [];
    
    for (const action of actions) {
      const actionBadges = getBadgesForAction(action, badges);
      const badgeIds = new Set(actionBadges.map(b => b.id));
      
      const row = [
        action.name || '',
        action.description || '',
        action.category || '',
        action.requirement_type || '',
        ...badges.map(badge => badgeIds.has(badge.id) ? 'X' : '')
      ];
      
      rows.push(row);
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
    const outputPath = path.join(__dirname, '..', 'action-badge-mapping.csv');
    fs.writeFileSync(outputPath, csv, 'utf8');

    console.log(`\n✅ Exported ${rows.length} actions mapped to ${badges.length} badges`);
    console.log(`📊 Output file: ${outputPath}`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Open Google Sheets`);
    console.log(`   2. File → Import → Upload`);
    console.log(`   3. Select: action-badge-mapping.csv`);
    console.log(`   4. Choose: "Insert new sheet(s)"`);
    console.log(`   5. Click "Import data"`);
    console.log(`\n💡 Tip: Use "X" marks to see which actions count toward which badges`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

exportMapping();

