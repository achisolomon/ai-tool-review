import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeComponent, toolPath, buildFrontmatter, changelogEntry } from './apply-suggestions.mjs';

test('safeComponent accepts slug-shaped strings, rejects traversal', () => {
  assert.equal(safeComponent('agent-memory'), true);
  assert.equal(safeComponent('letta'), true);
  assert.equal(safeComponent('../evil'), false);
  assert.equal(safeComponent('a/b'), false);
  assert.equal(safeComponent('Cap'), false);
  assert.equal(safeComponent('trailing-'), false);
});

test('toolPath builds a 3-level path from validated components', () => {
  assert.equal(
    toolPath({ track: 'developers', category: 'agent-frameworks', subcategory: 'agent-memory', slug: 'letta' }),
    'data/_tools/developers/agent-frameworks/agent-memory/letta.md'
  );
});

test('toolPath throws on an unsafe component', () => {
  assert.throws(() => toolPath({ track: 'developers', category: '..', subcategory: 'x', slug: 'y' }));
});

test('buildFrontmatter includes required fields and credit when opted in', () => {
  const fm = buildFrontmatter({
    payload: { name: 'Letta', slug: 'letta', website: 'https://letta.com', description: 'Stateful agents',
      placement: { track: 'developers', category: 'agent-frameworks', subcategory: 'agent-memory' },
      tags: ['open-source','agents'], type: 'oss' },
    credit_name: 'dani', public_credit: true,
  });
  assert.equal(fm.name, 'Letta');
  assert.equal(fm.slug, 'letta');
  assert.equal(fm.track, 'developers');
  assert.equal(fm.category, 'agent-frameworks');
  assert.equal(fm.subcategory, 'agent-memory');
  assert.deepEqual(fm.tags, ['open-source','agents']);
  assert.equal(fm.suggested_by, 'dani');
});

test('buildFrontmatter omits suggested_by when public_credit is false', () => {
  const fm = buildFrontmatter({
    payload: { name: 'X', slug: 'x', website: 'https://x.io', description: 'd',
      placement: { track: 'developers', category: 'agent-frameworks', subcategory: 'agent-memory' }, type: 'oss' },
    credit_name: 'dani', public_credit: false,
  });
  assert.equal('suggested_by' in fm, false);
});

test('changelogEntry maps a row to a changelog record, crediting only when opted in', () => {
  const e = changelogEntry({ kind: 'new_tool', tool_slug: 'letta', credit_name: 'dani', public_credit: true,
    payload: { name: 'Letta', placement: { category: 'agent-frameworks', subcategory: 'agent-memory' } } }, '2026-06-13');
  assert.equal(e.kind, 'new_tool');
  assert.equal(e.tool, 'letta');
  assert.equal(e.credit, 'dani');
  assert.match(e.summary, /Letta/);
  const anon = changelogEntry({ kind: 'new_tool', tool_slug: 'x', public_credit: false, payload: { name: 'X' } }, '2026-06-13');
  assert.equal('credit' in anon, false);
});
