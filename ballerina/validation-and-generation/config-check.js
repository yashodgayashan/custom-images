const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let basePath;

function parseArgs(args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-path') {
      basePath = args[i + 1];
      i++;
    } else {
      console.error(`Unknown parameter passed: ${args[i]}`);
      process.exit(1);
    }
  }
}

parseArgs(args);

if (!basePath) {
  console.error('Usage: node config.js --base-path <base-path>');
  process.exit(1);
}

const componentYamlPath = path.join(basePath, '.choreo', 'component.yaml');
const componentConfigYamlPath = path.join(basePath, '.choreo', 'component-config.yaml');
const endpointsYamlPath = path.join(basePath, '.choreo', 'endpoints.yaml');

let hasSrcConfigFile = false;
let hasComponentYaml = false;
let srcConfigFileType = '';

if (fs.existsSync(componentYamlPath)) {
  hasSrcConfigFile = true;
  hasComponentYaml = true;
  srcConfigFileType = 'component.yaml';
} else if (fs.existsSync(componentConfigYamlPath)) {
  hasSrcConfigFile = true;
  hasComponentYaml = false;
  srcConfigFileType = 'component-config.yaml';
} else if (fs.existsSync(endpointsYamlPath)) {
  hasSrcConfigFile = true;
  hasComponentYaml = false;
  srcConfigFileType = 'endpoints.yaml';
}

const envContent = `
hasSrcConfigFile=${hasSrcConfigFile}
hasComponentYaml=${hasComponentYaml}
srcConfigFileType=${srcConfigFileType}
`.trim();

// Write the variables to a .env file
fs.writeFileSync('.env', envContent, 'utf8');
