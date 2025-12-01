#!/usr/bin/env node

/**
 * Reliable deployment script
 * Stages all changes, commits, and pushes to GitHub
 * Vercel will auto-deploy on push
 */

const { execSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    const output = execSync(command, {
      cwd: projectRoot,
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return { success: true, output };
  } catch (error) {
    console.error(`\n❌ Error: ${description} failed`);
    console.error(error.message);
    process.exit(1);
  }
}

console.log('🚀 Starting deployment process...\n');

// Check git status first
runCommand('git status --short', 'Checking git status');

// Stage all changes
runCommand('git add -A', 'Staging all changes');

// Get commit message from command line or use default
const commitMessage = process.argv[2] || 'Deploy changes';
runCommand(`git commit -m "${commitMessage}"`, 'Committing changes');

// Push to GitHub
runCommand('git push origin main', 'Pushing to GitHub');

console.log('\n✅ Deployment complete!');
console.log('📡 Vercel should auto-deploy within 1-2 minutes.');
console.log('🔍 Check Vercel dashboard to confirm deployment.');

