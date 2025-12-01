#!/usr/bin/env node

/**
 * Git commit and push script that writes output to a file
 * This allows the AI to read the output even when terminal output isn't visible
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputFile = path.join(projectRoot, 'git-output.txt');

function runCommand(command, description) {
  try {
    const output = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf8'
    });
    
    const result = `\n=== ${description} ===\n${output}\n`;
    fs.appendFileSync(outputFile, result);
    return { success: true, output };
  } catch (error) {
    const errorOutput = `\n=== ERROR: ${description} ===\n${error.message}\n${error.stdout || ''}\n${error.stderr || ''}\n`;
    fs.appendFileSync(outputFile, errorOutput);
    return { success: false, error: errorOutput };
  }
}

// Clear previous output
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

console.log('Starting git operations...\n');

// Get commit message from command line or use default
const commitMessage = process.argv[2] || 'Deploy changes';

// Run commands
const statusResult = runCommand('git status', 'Git Status');
const addResult = runCommand('git add -A', 'Stage All Changes');
const commitResult = runCommand(`git commit -m "${commitMessage}"`, 'Commit Changes');
const pushResult = runCommand('git push origin main', 'Push to GitHub');

// Read and display final output
const finalOutput = fs.readFileSync(outputFile, 'utf8');
console.log(finalOutput);

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Status: ${statusResult.success ? '✓' : '✗'}`);
console.log(`Add: ${addResult.success ? '✓' : '✗'}`);
console.log(`Commit: ${commitResult.success ? '✓' : '✗'}`);
console.log(`Push: ${pushResult.success ? '✓' : '✗'}`);

if (commitResult.success && pushResult.success) {
  console.log('\n✅ Successfully committed and pushed!');
  process.exit(0);
} else {
  console.log('\n❌ Some operations failed. Check .git-output.txt for details.');
  process.exit(1);
}

