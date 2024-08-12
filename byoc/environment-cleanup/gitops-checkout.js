const { execSync } = require('child_process');
const minimist = require('minimist');
const path = require('path');

// Parse command-line arguments
const args = minimist(process.argv.slice(2), {
  string: ['GIT_USERNAME', 'GIT_EMAIL', 'GIT_PAT', 'REPO_URL', 'BRANCH'],
  alias: {
    u: 'GIT_USERNAME',
    e: 'GIT_EMAIL',
    p: 'GIT_PAT',
    r: 'REPO_URL',
    b: 'BRANCH',
  },
  unknown: (arg) => {
    console.error(`Unknown option: ${arg}`);
    process.exit(1);
  },
});

// Get input parameters
const { GIT_USERNAME, GIT_EMAIL, GIT_PAT, REPO_URL, BRANCH } = args;

// Validate required parameters
if (!GIT_USERNAME || !GIT_EMAIL || !GIT_PAT || !REPO_URL || !BRANCH) {
  console.error('Missing required parameters. Usage: node script.js --GIT_USERNAME <username> --GIT_EMAIL <email> --GIT_PAT <pat> --REPO_URL <repo_url> --BRANCH <branch>');
  process.exit(1);
}

try {
  // Configure Git global settings
  execSync(`git config --global user.name "${GIT_USERNAME}"`);
  execSync(`git config --global user.email "${GIT_EMAIL}"`);
  execSync(`git config --global credential.helper store`);
  execSync(`echo "https://${GIT_USERNAME}:${GIT_PAT}@github.com" > ~/.git-credentials`);

  // Clone the repository
  const repoName = path.basename(REPO_URL, '.git');
  execSync(`git clone ${REPO_URL}`);

  // Change directory to the cloned repository
  process.chdir(repoName);

  // Checkout the specified branch
  execSync(`git checkout ${BRANCH}`);

  console.log('Git configuration and checkout completed successfully.');

} catch (error) {
  console.error(`Error during Git operations: ${error.message}`);
  process.exit(1);
}
