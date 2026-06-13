#!/usr/bin/env node
// Validate auth-page parity (static, fast — runs in CI before browser tests).
//
// Rule: any top-level HTML page that contains a `#login-required` sign-in slot
// MUST load the shared sign-in module (js/auth-signin.js). This catches the
// admin.html/my-reviews.html divergence class of bug without a browser.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Top-level page HTML files (not _site, not includes/layouts).
const htmlFiles = fs
  .readdirSync(ROOT)
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(ROOT, f));

const problems = [];

for (const file of htmlFiles) {
  const src = fs.readFileSync(file, 'utf8');
  const hasLoginSlot = /id=["']login-required["']/.test(src);
  if (!hasLoginSlot) continue;

  const loadsModule = /<script[^>]+src=["'][^"']*js\/auth-signin\.js[^"']*["']/.test(src);
  const callsRender = /AuthSignIn\.renderCard/.test(src);

  if (!loadsModule) {
    problems.push(`${path.basename(file)}: has #login-required but does NOT load js/auth-signin.js`);
  }
  if (!callsRender) {
    problems.push(`${path.basename(file)}: has #login-required but never calls AuthSignIn.renderCard`);
  }
}

if (problems.length > 0) {
  console.error('✗ Auth-page parity check failed:\n');
  problems.forEach(p => console.error(`  - ${p}`));
  console.error('\nEvery sign-in page must use the shared AuthSignIn module.');
  console.error('See tests/auth-parity.spec.js for the contract.');
  process.exit(1);
}

console.log('✓ Auth-page parity check passed (all #login-required pages use AuthSignIn)');
