#!/usr/bin/env node

/**
 * Simple Supabase Migration Runner
 * 
 * This script reads migration files and provides instructions for running them.
 * Since Supabase JS doesn't support raw SQL execution, it helps track which
 * migrations need to be run.
 * 
 * Usage: node scripts/run-migration-simple.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
function getEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Please check your .env.local file.`
    );
  }
  return value;
}

// Create Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Get list of executed migrations
async function getExecutedMigrations(adminSupabase) {
  try {
    const { data, error } = await adminSupabase
      .from('schema_migrations')
      .select('migration_name')
      .order('id', { ascending: true });

    if (error) {
      // Table doesn't exist yet - that's okay for first run
      return [];
    }

    return data.map(row => row.migration_name);
  } catch (error) {
    return [];
  }
}

// Record migration as executed
async function recordMigration(adminSupabase, migrationName) {
  try {
    // First, ensure the table exists
    const { error: checkError } = await adminSupabase
      .from('schema_migrations')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist - we can't create it via JS client
      console.log(`⚠️  schema_migrations table doesn't exist.`);
      console.log(`   Please create it first by running this SQL in Supabase dashboard:`);
      console.log(`\n   CREATE TABLE IF NOT EXISTS schema_migrations (`);
      console.log(`     id SERIAL PRIMARY KEY,`);
      console.log(`     migration_name TEXT UNIQUE NOT NULL,`);
      console.log(`     executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`);
      console.log(`   );\n`);
      return false;
    }

    const { error } = await adminSupabase
      .from('schema_migrations')
      .insert({
        migration_name: migrationName,
      });

    if (error) {
      console.error(`Error recording migration ${migrationName}:`, error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error recording migration ${migrationName}:`, error.message);
    return false;
  }
}

// Main function
async function listMigrations() {
  console.log('📋 Supabase Migration Status\n');

  try {
    const adminSupabase = getSupabaseAdmin();
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('No migration files found.');
      return;
    }

    console.log(`Found ${migrationFiles.length} migration files.\n`);

    // Get executed migrations
    const executedMigrations = await getExecutedMigrations(adminSupabase);
    
    if (executedMigrations.length === 0) {
      console.log('⚠️  No migrations tracking found.');
      console.log('   This might be your first run, or the schema_migrations table doesn\'t exist.\n');
    } else {
      console.log(`✅ Executed migrations: ${executedMigrations.length}\n`);
    }

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ All migrations are up to date!\n');
      return;
    }

    console.log(`📝 Pending migrations: ${pendingMigrations.length}\n`);
    console.log('To run these migrations:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run each migration file in order:\n');

    pendingMigrations.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });

    console.log('\n💡 Alternative: Use Supabase CLI for automatic migrations');
    console.log('   npm install -g supabase');
    console.log('   supabase link --project-ref your-project-ref');
    console.log('   supabase db push\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('Missing required environment variable')) {
      console.error('\n   Make sure your .env.local file has:');
      console.error('   - NEXT_PUBLIC_SUPABASE_URL');
      console.error('   - SUPABASE_SERVICE_ROLE_KEY\n');
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  listMigrations();
}

module.exports = { listMigrations };

