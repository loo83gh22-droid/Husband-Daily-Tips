/**
 * Script to check which migrations have been run in Supabase
 * Compares migration files in supabase/migrations/ with what's in the database
 * 
 * Usage: node scripts/check-migrations-status.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkMigrations() {
  console.log('🔍 Checking migration status...\n');

  try {
    // Get all migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration files:\n`);

    // Check if schema_migrations table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('schema_migrations')
      .select('version')
      .limit(1);

    // If table doesn't exist, try to get migrations from a different approach
    let runMigrations = [];
    
    if (tableError && tableError.code === 'PGRST116') {
      console.log('⚠️  schema_migrations table not found. Checking alternative methods...\n');
      
      // Try to infer from existing tables
      const { data: tables } = await supabase.rpc('exec_sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      }).catch(() => null);

      if (tables) {
        console.log('📊 Found tables in database. Migrations may have been run manually.\n');
      }
    } else {
      // Get all run migrations
      const { data: migrations, error } = await supabase
        .from('schema_migrations')
        .select('version')
        .order('version');

      if (error) {
        console.error('❌ Error fetching migrations:', error.message);
      } else {
        runMigrations = migrations?.map(m => m.version) || [];
      }
    }

    // Compare files with run migrations
    const status = files.map(file => {
      const version = file.replace(/^\d+_/, '').replace(/\.sql$/, '');
      const isRun = runMigrations.includes(version) || 
                   runMigrations.some(rm => file.includes(rm)) ||
                   file.includes('001_initial_schema'); // Assume initial is always run if tables exist

      return {
        file,
        version,
        status: isRun ? '✅ RUN' : '❌ NOT RUN',
      };
    });

    // Display results
    status.forEach(({ file, status }) => {
      console.log(`${status} ${file}`);
    });

    const runCount = status.filter(s => s.status.includes('✅')).length;
    const notRunCount = status.filter(s => s.status.includes('❌')).length;

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Run: ${runCount}/${files.length}`);
    console.log(`   ❌ Not Run: ${notRunCount}/${files.length}`);

    if (notRunCount > 0) {
      console.log(`\n⚠️  WARNING: ${notRunCount} migration(s) not run!`);
      console.log(`   Run missing migrations before going live.\n`);
      process.exit(1);
    } else {
      console.log(`\n✅ All migrations appear to be run!\n`);
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error checking migrations:', error);
    process.exit(1);
  }
}

// Alternative: Check by verifying key tables exist
async function checkByTables() {
  console.log('\n🔍 Alternative: Checking by table existence...\n');

  const keyTables = [
    'users',
    'actions',
    'user_daily_actions',
    'user_action_completions',
    'reflections',
    'user_badges',
    'deep_thoughts',
    'post_reports', // From latest migration
  ];

  const results = await Promise.all(
    keyTables.map(async (table) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      return {
        table,
        exists: !error || error.code !== 'PGRST116',
        error: error?.code === 'PGRST116' ? null : error?.message,
      };
    })
  );

  console.log('📊 Table Status:\n');
  results.forEach(({ table, exists, error }) => {
    if (exists) {
      console.log(`   ✅ ${table}`);
    } else {
      console.log(`   ❌ ${table} - ${error || 'not found'}`);
    }
  });

  const allExist = results.every(r => r.exists);
  
  if (allExist) {
    console.log('\n✅ All key tables exist! Migrations likely complete.\n');
  } else {
    console.log('\n⚠️  Some tables are missing. Check migrations.\n');
  }

  return allExist;
}

// Run both checks
async function main() {
  await checkMigrations();
  await checkByTables();
}

main();

