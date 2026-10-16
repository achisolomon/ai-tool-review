#!/usr/bin/env node
// Lints tool .md file bodies against the exact regex used by
// tests/data-integrity.spec.js's "no tool description prose hardcodes a
// GitHub star figure" test, so scripts/tool-page-check.sh's local pass
// guarantees that Playwright test also passes on this rule.
//
// Kept as its own file (not an inline shell grep) because macOS's default
// BSD grep has no -P/PCRE support, and this regex needs a lookbehind.
//
// Usage: node check-star-figures.mjs <file.md> [file.md ...]

import { readFileSync } from 'node:fs';

// Exact regex from tests/data-integrity.spec.js:198. Must match verbatim;
// do not re-derive an approximation here.
export const STAR_FIGURE_REGEX = /(?<![\/\d])\b\d[\d.,]*\s*[kK]?\+?\s*(github\s+)?stars?\b/i;

export function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---/, '');
}

/**
 * Find star-figure violations in a tool .md file's body (frontmatter stripped).
 * @param {string} content raw file content
 * @returns {string|null} the first matched offending text, or null if clean
 */
export function findStarFigureViolation(content) {
  const body = stripFrontmatter(content);
  const match = body.match(STAR_FIGURE_REGEX);
  return match ? match[0] : null;
}

function main(files) {
  const offenders = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const violation = findStarFigureViolation(content);
    if (violation) {
      offenders.push({ file, match: violation });
    }
  }

  if (offenders.length > 0) {
    console.error('Star figures must live only in the key-stats badge, not in prose:');
    for (const { file, match } of offenders) {
      console.error(`    ${file}: "${match}"`);
    }
    process.exit(1);
  }

  process.exit(0);
}

// Only run as a CLI when invoked directly (not when imported by the test file).
if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2));
}
