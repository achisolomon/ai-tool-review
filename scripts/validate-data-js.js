#!/usr/bin/env node
/**
 * Validates that js/data.js has the correct JavaScript format.
 *
 * This prevents the regression where data.js was accidentally overwritten
 * with raw JSON (missing 'const landscapeData = ' prefix), causing the
 * landscape and search pages to show 0 tools.
 */

const fs = require('fs');
const path = require('path');

const DATA_JS_PATH = path.join(__dirname, '..', 'js', 'data.js');

function validateDataJs() {
  console.log('Validating js/data.js format...');

  // Check file exists
  if (!fs.existsSync(DATA_JS_PATH)) {
    console.error('ERROR: js/data.js does not exist');
    process.exit(1);
  }

  const content = fs.readFileSync(DATA_JS_PATH, 'utf-8');
  const errors = [];

  // Must not start with raw JSON
  if (content.trimStart().startsWith('{')) {
    errors.push('File starts with "{" - appears to be raw JSON instead of JavaScript');
    errors.push('Expected: const landscapeData = { ... };');
  }

  // Must contain variable declaration
  if (!content.includes('const landscapeData')) {
    errors.push('Missing "const landscapeData" declaration');
  }

  // Must end with semicolon (valid JS statement)
  if (!content.trimEnd().endsWith(';')) {
    errors.push('File does not end with semicolon - invalid JavaScript');
  }

  // Must contain expected structure
  if (!content.includes('"users"') || !content.includes('"developers"')) {
    errors.push('Missing expected "users" or "developers" arrays');
  }

  // Try to actually parse it
  try {
    // Extract the object part and parse it
    const match = content.match(/const landscapeData\s*=\s*(\{[\s\S]*\});?\s*$/);
    if (match) {
      const jsonStr = match[1];
      const data = JSON.parse(jsonStr);

      if (!Array.isArray(data.users)) {
        errors.push('landscapeData.users is not an array');
      }
      if (!Array.isArray(data.developers)) {
        errors.push('landscapeData.developers is not an array');
      }

      // Count tools
      let totalTools = 0;
      ['users', 'developers'].forEach(track => {
        if (data[track]) {
          data[track].forEach(category => {
            if (category.subcategories) {
              category.subcategories.forEach(sub => {
                if (sub.tools) {
                  totalTools += sub.tools.length;
                }
              });
            }
          });
        }
      });

      if (totalTools === 0) {
        errors.push('No tools found in data');
      } else {
        console.log(`  Found ${totalTools} tools across ${data.users.length + data.developers.length} categories`);
      }
    } else {
      errors.push('Could not extract landscapeData object from file');
    }
  } catch (e) {
    errors.push(`Failed to parse data: ${e.message}`);
  }

  if (errors.length > 0) {
    console.error('\nERROR: js/data.js validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nThis usually means the file was overwritten with raw JSON.');
    console.error('Run: git checkout HEAD -- js/data.js');
    process.exit(1);
  }

  console.log('  js/data.js format is valid');
  return true;
}

validateDataJs();
