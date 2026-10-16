import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findStarFigureViolation, stripFrontmatter, STAR_FIGURE_REGEX } from './check-star-figures.mjs';

test('stripFrontmatter removes the YAML frontmatter block', () => {
  const content = '---\nname: "Tool"\n---\n\n## Overview\n\n<p>Body text.</p>';
  assert.equal(stripFrontmatter(content), '\n\n## Overview\n\n<p>Body text.</p>');
});

test('stripFrontmatter leaves content unchanged when there is no frontmatter', () => {
  const content = '## Overview\n\n<p>Body text.</p>';
  assert.equal(stripFrontmatter(content), content);
});

test('findStarFigureViolation flags a bare star figure in prose', () => {
  const content = '---\nname: "Tool"\n---\n<p>This tool has 12k stars on GitHub.</p>';
  assert.equal(findStarFigureViolation(content), '12k stars');
});

test('findStarFigureViolation flags "N GitHub stars" phrasing', () => {
  const content = '---\nname: "Tool"\n---\n<p>Backed by 1,500 GitHub stars and growing.</p>';
  assert.equal(findStarFigureViolation(content), '1,500 GitHub stars');
});

test('findStarFigureViolation ignores the exempt key-stats badge markup', () => {
  // Number and label sit in separate <span> elements with a tag boundary
  // between them, which the regex does not cross -- this must stay clean.
  const content = [
    '---\nname: "Tool"\n---',
    '<div class="key-stats">',
    '  <div class="key-stat">',
    '    <span class="number">1.5k+</span>',
    '    <span class="label">GitHub Stars</span>',
    '  </div>',
    '</div>',
  ].join('\n');
  assert.equal(findStarFigureViolation(content), null);
});

test('findStarFigureViolation does not flag an "N/M stars" rating', () => {
  const content = '---\nname: "Tool"\n---\n<p>Rated 4.5/5 stars on G2.</p>';
  assert.equal(findStarFigureViolation(content), null);
});

test('findStarFigureViolation returns null for clean prose', () => {
  const content = '---\nname: "Tool"\n---\n<p>Strong, fast-growing adoption; see badge for count.</p>';
  assert.equal(findStarFigureViolation(content), null);
});

test('STAR_FIGURE_REGEX matches the exact pattern used by the Playwright data-integrity test', () => {
  // Pinned so a drift between this script and tests/data-integrity.spec.js:198
  // fails loudly here rather than silently passing locally and failing in CI.
  assert.equal(
    STAR_FIGURE_REGEX.source,
    '(?<![\\/\\d])\\b\\d[\\d.,]*\\s*[kK]?\\+?\\s*(github\\s+)?stars?\\b'
  );
});
