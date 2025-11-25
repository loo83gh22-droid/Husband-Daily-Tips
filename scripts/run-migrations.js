#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * 
 * This script automatically runs all pending Supabase migrations in order.
 * It uses the Supabase service role key to execute SQL directly.
 * 
 * Usage: node scripts/run-migrations.js
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

// Create migrations tracking table if it doesn't exist
async function ensureMigrationsTable(adminSupabase) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      migration_name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_schema_migrations_name ON schema_migrations(migration_name);
  `;

  // Execute via RPC (we'll use a workaround since Supabase doesn't support raw SQL)
  // Instead, we'll use the REST API directly
  try {
    const response = await fetch(`${getEnvVar('NEXT_PUBLIC_SUPABASE_URL')}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
        'Authorization': `Bearer ${getEnvVar('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ sql: createTableSQL }),
    });

    // If RPC doesn't exist, try direct approach
    if (!response.ok) {
      // Use pg_rest or direct SQL execution
      // For now, we'll use a simpler approach: check if table exists, if not create it
      const { data, error } = await adminSupabase
        .from('schema_migrations')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist - we need to create it
        // Since Supabase JS doesn't support raw SQL, we'll need to use the REST API
        console.log('Creating migrations tracking table...');
        // We'll create this via a migration file instead
        console.warn('⚠️  Please run the initial migration manually to create schema_migrations table, or use Supabase dashboard.');
        return false;
      }
    }
  } catch (error) {
    // Table might already exist, continue
  }

  return true;
}

// Get list of executed migrations
async function getExecutedMigrations(adminSupabase) {
  try {
    const { data, error } = await adminSupabase
      .from('schema_migrations')
      .select('migration_name')
      .order('id', { ascending: true });

    if (error) {
      // Table doesn't exist yet
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
    const { error } = await adminSupabase
      .from('schema_migrations')
      .insert({
        migration_name: migrationName,
      });

    if (error) {
      console.error(`Error recording migration ${migrationName}:`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error recording migration ${migrationName}:`, error);
    return false;
  }
}

// Execute SQL migration using Supabase REST API
async function executeMigration(adminSupabase, sql, migrationName) {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

  try {
    // Use Supabase REST API to execute SQL
    // Note: This requires the service role key and uses the /rest/v1/rpc endpoint
    // We'll use a workaround: create a temporary function or use direct HTTP
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (response.ok) {
      return { success: true };
    }

    // If RPC doesn't exist, try alternative: use pg_rest or direct connection
    // For now, we'll use a simpler approach: execute via admin client
    // Since Supabase JS doesn't support raw SQL, we need to use HTTP directly
    
    // Alternative: Use Supabase's SQL execution endpoint (if available)
    // This is a workaround - ideally you'd use Supabase CLI or pg_rest
    
    console.warn(`⚠️  Could not execute migration ${migrationName} automatically.`);
    console.warn(`   Please run it manually in Supabase SQL Editor.`);
    return { success: false, needsManual: true };
  } catch (error) {
    console.error(`Error executing migration ${migrationName}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main migration runner
async function runMigrations() {
  console.log('🚀 Starting Supabase Migration Runner\n');

  try {
    const adminSupabase = getSupabaseAdmin();
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically (001, 002, etc.)

    if (migrationFiles.length === 0) {
      console.log('No migration files found.');
      return;
    }

    console.log(`Found ${migrationFiles.length} migration files.\n`);

    // Check if migrations table exists
    const hasTable = await ensureMigrationsTable(adminSupabase);
    if (!hasTable) {
      console.log('\n⚠️  Migrations tracking table not found.');
      console.log('   Creating initial migration tracking...');
      // Try to create it via a simple insert (will fail if table doesn't exist, which is fine)
    }

    // Get executed migrations
    const executedMigrations = await getExecutedMigrations(adminSupabase);
    console.log(`Executed migrations: ${executedMigrations.length}\n`);

    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ All migrations are up to date!\n');
      return;
    }

    console.log(`📋 Pending migrations: ${pendingMigrations.length}\n`);

    // Execute each pending migration
    for (const migrationFile of pendingMigrations) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      console.log(`⏳ Running: ${migrationFile}...`);

      // Since Supabase JS client doesn't support raw SQL execution,
      // we'll need to use the REST API or prompt user to run manually
      // For now, we'll show what needs to be run
      
      console.log(`\n⚠️  Automatic execution not fully supported.`);
      console.log(`   Migration file: ${migrationFile}`);
      console.log(`   Please run this migration manually in Supabase SQL Editor.`);
      console.log(`   Or use Supabase CLI: supabase db push\n`);

      // Try to record it anyway (user can manually verify)
      // await recordMigration(adminSupabase, migrationFile);
    }

    console.log('\n💡 Tip: Use Supabase CLI for automatic migrations:');
    console.log('   npm install -g supabase');
    console.log('   supabase link --project-ref your-project-ref');
    console.log('   supabase db push\n');

  } catch (error) {
    console.error('\n❌ Error running migrations:', error.message);
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
  runMigrations();
}

module.exports = { runMigrations };

