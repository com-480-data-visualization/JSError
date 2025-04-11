#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

try {
  // Define the deployment directory (passed as input, or default to current directory)
  const deployPath = process.env.INPUT_DEPLOY_PATH || '.';

  // Configure Git credentials for the action runtime environment
  execSync('git config --global user.email "action@github.com"', { stdio: 'inherit' });
  execSync('git config --global user.name "GitHub Action"', { stdio: 'inherit' });

  // Create a temporary orphan branch for GitHub Pages deployment.
  // This is a common pattern for static deployment.
  execSync('git checkout --orphan gh-pages', { stdio: 'inherit' });

  // Add all files from the deployment path (adjust if your build output directory differs)
  execSync(`git --work-tree=${deployPath} add --all`, { stdio: 'inherit' });
  
  // Commit the changes
  execSync(`git --work-tree=${deployPath} commit -m "Deploy website"`, { stdio: 'inherit' });
  
  // Force push to the gh-pages branch
  execSync('git push origin HEAD:gh-pages --force', { stdio: 'inherit' });
  
  console.log("Deployment successful.");
} catch (error) {
  console.error("Deployment failed:", error);
  process.exit(1);
}
