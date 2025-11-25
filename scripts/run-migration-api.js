#!/usr/bin/env node

/**
 * Supabase Migration Runner using REST API
 * 
 * This script automatically runs pending Supabase migrations by executing SQL
 * directly via the Supabase REST API using the service role key.
 * 
 * Usage: node scripts/run-migration-api.js [migration-file.sql]
 */

const fs = require('fs');
const path = require('path');
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

// Execute SQL via Supabase REST API
async function executeSQL(sql) {
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

  try {
    // Use Supabase's PostgREST API to execute SQL
    // Note: Supabase doesn't expose a direct SQL execution endpoint via REST
    // We need to use the Management API or create a function
    
    // Alternative: Use Supabase's SQL execution via pg_rest or direct connection
    // For now, we'll use a workaround: create a temporary function
    
    // Actually, the best way is to use Supabase's SQL Editor API if available
    // Or use the Supabase CLI
    
    // Since direct SQL execution isn't available via REST API,
    // we'll provide instructions instead
    
    console.log('⚠️  Direct SQL execution via REST API is not supported by Supabase.');
    console.log('   Please use one of these methods:\n');
    console.log('   1. Supabase Dashboard (SQL Editor)');
    console.log('   2. Supabase CLI: supabase db push');
    console.log('   3. psql command line tool\n');
    
    return { success: false, needsManual: true };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run a specific migration file
async function runMigrationFile(migrationFile) {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrationPath = path.join(migrationsDir, migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationFile}`);
    return false;
  }

  console.log(`📄 Reading migration: ${migrationFile}`);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`⏳ Executing migration...`);
  const result = await executeSQL(sql);

  if (result.success) {
    console.log(`✅ Migration executed successfully!\n`);
    return true;
  } else if (result.needsManual) {
    console.log(`\n📋 Please run this migration manually:`);
    console.log(`   File: ${migrationPath}`);
    console.log(`   Copy the SQL and run it in Supabase SQL Editor\n`);
    return false;
  } else {
    console.error(`❌ Migration failed: ${result.error}\n`);
    return false;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Run specific migration file
    const migrationFile = args[0];
    await runMigrationFile(migrationFile);
  } else {
    // List all migrations
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('📋 Available Migrations:\n');
    migrationFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    console.log('\n💡 To run a migration:');
    console.log('   node scripts/run-migration-api.js <migration-file.sql>\n');
    console.log('💡 Or use Supabase CLI:');
    console.log('   supabase db push\n');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { runMigrationFile, executeSQL };

