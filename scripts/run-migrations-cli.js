#!/usr/bin/env node

/**
 * Supabase Migration Runner using Supabase CLI
 * 
 * This script checks for Supabase CLI and runs migrations automatically.
 * If CLI is not installed, it provides installation instructions.
 * 
 * Usage: npm run migrations:run
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function runMigrationsWithCLI() {
  try {
    console.log('🚀 Running migrations with Supabase CLI...\n');
    
    // Check if project is linked
    try {
      execSync('supabase status', { stdio: 'ignore' });
    } catch (error) {
      console.log('⚠️  Supabase project not linked.');
      console.log('   Please link your project first:');
      console.log('   supabase link --project-ref your-project-ref\n');
      return false;
    }

    // Push migrations
    console.log('📤 Pushing migrations to Supabase...\n');
    execSync('supabase db push', { stdio: 'inherit' });
    
    console.log('\n✅ Migrations completed successfully!\n');
    return true;
  } catch (error) {
    console.error('\n❌ Error running migrations:', error.message);
    return false;
  }
}

function main() {
  console.log('📋 Supabase Migration Runner\n');

  if (!checkSupabaseCLI()) {
    console.log('⚠️  Supabase CLI is not installed.\n');
    console.log('📦 To install Supabase CLI:');
    console.log('   npm install -g supabase\n');
    console.log('   Or visit: https://supabase.com/docs/guides/cli\n');
    console.log('💡 Alternative: Run migrations manually in Supabase Dashboard:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste each migration file from supabase/migrations/\n');
    
    // List pending migrations
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      if (migrationFiles.length > 0) {
        console.log('📝 Migration files to run:\n');
        migrationFiles.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file}`);
        });
        console.log('');
      }
    }
    
    return;
  }

  // CLI is installed, run migrations
  runMigrationsWithCLI();
}

if (require.main === module) {
  main();
}

module.exports = { checkSupabaseCLI, runMigrationsWithCLI };

