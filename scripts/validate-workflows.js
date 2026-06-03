#!/usr/bin/env node
/**
 * Validate GitHub Actions workflow files for common issues
 * Run with: npm run validate:workflows
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const WORKFLOWS_DIR = path.join(__dirname, '..', '.github', 'workflows');

// Minimum recommended versions for common actions
const RECOMMENDED_VERSIONS = {
  'actions/checkout': 'v4',
  'actions/setup-node': 'v4',
  'actions/upload-artifact': 'v4',
  'actions/download-artifact': 'v4',
  'actions/configure-pages': 'v5',
  'actions/upload-pages-artifact': 'v3',
  'actions/deploy-pages': 'v4',
  'ruby/setup-ruby': 'v1',
};

// Node.js versions that are deprecated or will be deprecated
const DEPRECATED_NODE_VERSIONS = ['16', '18', '20'];

let hasErrors = false;
let hasWarnings = false;

function log(type, file, message) {
  const prefix = type === 'error' ? '\x1b[31mERROR\x1b[0m' : '\x1b[33mWARN\x1b[0m';
  console.log(`${prefix} [${path.basename(file)}]: ${message}`);
  if (type === 'error') hasErrors = true;
  if (type === 'warning') hasWarnings = true;
}

function checkWorkflow(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let workflow;

  try {
    workflow = yaml.parse(content);
  } catch (e) {
    log('error', filePath, `Invalid YAML syntax: ${e.message}`);
    return;
  }

  if (!workflow) {
    log('error', filePath, 'Empty workflow file');
    return;
  }

  // Check for FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 env var
  const hasNode24Env =
    (workflow.env && workflow.env.FORCE_JAVASCRIPT_ACTIONS_TO_NODE24) ||
    content.includes('FORCE_JAVASCRIPT_ACTIONS_TO_NODE24');

  // Check jobs
  if (workflow.jobs) {
    for (const [jobName, job] of Object.entries(workflow.jobs)) {
      if (!job.steps) continue;

      for (const step of job.steps) {
        if (!step.uses) continue;

        // Check for deprecated Node.js versions in setup-node
        if (step.uses.startsWith('actions/setup-node')) {
          const nodeVersion = step.with?.['node-version'];
          if (nodeVersion) {
            const version = String(nodeVersion).replace(/['"]/g, '');
            if (DEPRECATED_NODE_VERSIONS.some(v => version.startsWith(v))) {
              if (!hasNode24Env) {
                log(
                  'warning',
                  filePath,
                  `Job "${jobName}" uses Node.js ${version} without FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`
                );
              }
            }
          }
        }

        // Check action versions
        const match = step.uses.match(/^([^@]+)@(.+)$/);
        if (match) {
          const [, action, version] = match;
          const recommended = RECOMMENDED_VERSIONS[action];
          if (recommended && version !== recommended) {
            // Only warn if it's an older version (not a SHA or newer)
            if (version.startsWith('v') && version < recommended) {
              log(
                'warning',
                filePath,
                `Action ${action}@${version} is outdated (recommended: ${recommended})`
              );
            }
          }
        }
      }
    }
  }
}

function main() {
  console.log('Validating GitHub Actions workflows...\n');

  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.log('No .github/workflows directory found');
    return;
  }

  const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

  if (files.length === 0) {
    console.log('No workflow files found');
    return;
  }

  for (const file of files) {
    const filePath = path.join(WORKFLOWS_DIR, file);
    console.log(`Checking ${file}...`);
    checkWorkflow(filePath);
  }

  console.log('');

  if (hasErrors) {
    console.log('\x1b[31mValidation failed with errors\x1b[0m');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\x1b[33mValidation passed with warnings\x1b[0m');
  } else {
    console.log('\x1b[32mAll workflows valid\x1b[0m');
  }
}

main();
