#!/usr/bin/env node

/**
 * Git status script that writes output to a file
 * This allows the AI to read the output even when terminal output isn't visible
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputFile = path.join(projectRoot, 'git-output.txt');

try {
  // Run git status and capture output
  const status = execSync('git status', {
    cwd: projectRoot,
    encoding: 'utf8'
  });
  
  // Write to file
  fs.writeFileSync(outputFile, status);
  console.log('Git status written to .git-output.txt');
  console.log(status);
} catch (error) {
  const errorOutput = error.message + '\n' + (error.stdout || '') + (error.stderr || '');
  fs.writeFileSync(outputFile, errorOutput);
  console.error('Error:', errorOutput);
  process.exit(1);
}

