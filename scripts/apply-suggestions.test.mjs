import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import matter from 'gray-matter';
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

// ── Task 2.3: Validation tests ───────────────────────────────────────────────
import { validateRow, loadTaxonomy } from './apply-suggestions.mjs';

function fixtureTree() {
  const root = mkdtempSync(join(tmpdir(), 'apply-'));
  const tools = join(root, 'data', '_tools');
  mkdirSync(join(tools, 'developers', 'agent-frameworks', 'agent-memory'), { recursive: true });
  writeFileSync(join(tools, '_categories.yaml'),
    'developers:\n  agent-frameworks:\n    name: "Agent Frameworks"\n    subcategories:\n      agent-memory:\n        name: "Agent Memory"\n      orchestration:\n        name: "Orchestration"\n');
  writeFileSync(join(tools, '_tags.yaml'),
    'capabilities:\n  - slug: agents\n    name: Agents\ndeployment:\n  - slug: open-source\n    name: Open Source\n');
  writeFileSync(join(tools, 'developers', 'agent-frameworks', 'agent-memory', 'mem0.md'),
    matter.stringify('body', { name: 'Mem0', slug: 'mem0', website: 'https://mem0.ai', type: 'oss',
      track: 'developers', category: 'agent-frameworks', subcategory: 'agent-memory', description: 'Memory', tags: ['agents'] }));
  return root;
}

test('validateRow: new_tool with known placement and tags is ok', () => {
  const root = fixtureTree();
  const tax = loadTaxonomy(root);
  const row = { kind: 'new_tool', payload: { name: 'Letta', slug: 'letta', website: 'https://letta.com',
    description: 'd', type: 'oss', placement: { track: 'developers', category: 'agent-frameworks', subcategory: 'agent-memory' },
    tags: ['agents'] } };
  assert.equal(validateRow(row, root, tax).ok, true);
  rmSync(root, { recursive: true, force: true });
});

test('validateRow: new_tool with unknown subcategory is rejected', () => {
  const root = fixtureTree();
  const tax = loadTaxonomy(root);
  const row = { kind: 'new_tool', payload: { name: 'L', slug: 'l', website: 'https://l.io', description: 'd', type: 'oss',
    placement: { track: 'developers', category: 'agent-frameworks', subcategory: 'nope' }, tags: [] } };
  const r = validateRow(row, root, tax);
  assert.equal(r.ok, false);
  assert.match(r.reason, /subcategory/);
  rmSync(root, { recursive: true, force: true });
});

test('validateRow: new_tool slug collision is rejected', () => {
  const root = fixtureTree();
  const tax = loadTaxonomy(root);
  const row = { kind: 'new_tool', payload: { name: 'Mem0', slug: 'mem0', website: 'https://x.io', description: 'd', type: 'oss',
    placement: { track: 'developers', category: 'agent-frameworks', subcategory: 'agent-memory' }, tags: [] } };
  assert.equal(validateRow(row, root, tax).ok, false);
  rmSync(root, { recursive: true, force: true });
});

test('validateRow: tool_placement stale current is rejected', () => {
  const root = fixtureTree();
  const tax = loadTaxonomy(root);
  const row = { kind: 'tool_placement', tool_slug: 'mem0',
    payload: { current: { category: 'agent-frameworks', subcategory: 'orchestration' },   // wrong; file says agent-memory
      proposed: { category: 'agent-frameworks', subcategory: 'orchestration' } } };
  const r = validateRow(row, root, tax);
  assert.equal(r.ok, false);
  assert.match(r.reason, /stale|current/i);
  rmSync(root, { recursive: true, force: true });
});

test('validateRow: tool_placement with unknown tag in tags_add is rejected', () => {
  const root = fixtureTree();
  const tax = loadTaxonomy(root);
  const row = { kind: 'tool_placement', tool_slug: 'mem0',
    payload: { current: { category: 'agent-frameworks', subcategory: 'agent-memory', tags: ['agents'] },
      proposed: { category: 'agent-frameworks', subcategory: 'orchestration', tags_add: ['ghost-tag'] } } };
  assert.equal(validateRow(row, root, tax).ok, false);
  rmSync(root, { recursive: true, force: true });
});

// ── Task 2.4: Apply function tests ──────────────────────────────────────────
import { existsSync, readFileSync } from 'node:fs';
import { applyNewTool, applyToolPlacement, applyToolEdit, applyTaxonomyChange, slugWithSuffix } from './apply-suggestions.mjs';

test('slugWithSuffix appends -2 on collision', () => {
  const root = fixtureTree();
  assert.equal(slugWithSuffix(root, 'letta'), 'letta');      // free
  assert.equal(slugWithSuffix(root, 'mem0'), 'mem0-2');      // taken -> suffixed
  rmSync(root, { recursive: true, force: true });
});

test('applyNewTool writes a schema-shaped file with credit', () => {
  const root = fixtureTree();
  const tax = loadTaxonomy(root);
  const row = { kind: 'new_tool', credit_name: 'dani', public_credit: true,
    payload: { name: 'Letta', slug: 'letta', website: 'https://letta.com', description: 'Stateful agents',
      type: 'oss', tags: ['agents'],
      placement: { track: 'developers', category: 'agent-frameworks', subcategory: 'agent-memory' } } };
  applyNewTool(row, root, tax);
  const f = join(root, 'data/_tools/developers/agent-frameworks/agent-memory/letta.md');
  assert.ok(existsSync(f));
  const fm = matter(readFileSync(f, 'utf8')).data;
  assert.equal(fm.suggested_by, 'dani');
  assert.equal(fm.subcategory, 'agent-memory');
  rmSync(root, { recursive: true, force: true });
});

test('applyToolPlacement moves the file and rewrites frontmatter', () => {
  const root = fixtureTree();
  const tax = loadTaxonomy(root);
  const row = { kind: 'tool_placement', tool_slug: 'mem0',
    payload: { current: { category: 'agent-frameworks', subcategory: 'agent-memory', tags: ['agents'] },
      proposed: { category: 'agent-frameworks', subcategory: 'orchestration', tags_add: ['open-source'], tags_remove: [] } } };
  applyToolPlacement(row, root, tax);
  assert.ok(!existsSync(join(root, 'data/_tools/developers/agent-frameworks/agent-memory/mem0.md')));
  const moved = join(root, 'data/_tools/developers/agent-frameworks/orchestration/mem0.md');
  assert.ok(existsSync(moved));
  const fm = matter(readFileSync(moved, 'utf8')).data;
  assert.equal(fm.subcategory, 'orchestration');
  assert.ok(fm.tags.includes('open-source'));
  rmSync(root, { recursive: true, force: true });
});

test('applyToolEdit updates only changed fields', () => {
  const root = fixtureTree();
  const tax = loadTaxonomy(root);
  const row = { kind: 'tool_edit', tool_slug: 'mem0',
    payload: { changes: { description: { from: 'Memory', to: 'Memory layer for agents' } } } };
  applyToolEdit(row, root, tax);
  const fm = matter(readFileSync(join(root, 'data/_tools/developers/agent-frameworks/agent-memory/mem0.md'), 'utf8')).data;
  assert.equal(fm.description, 'Memory layer for agents');
  rmSync(root, { recursive: true, force: true });
});

test('applyTaxonomyChange add_subcategory writes to _categories.yaml', () => {
  const root = fixtureTree();
  const row = { kind: 'taxonomy_change',
    payload: { op: 'add_subcategory', parent_category: 'agent-frameworks', name: 'Agent Eval',
      slug: 'agent-eval', description: 'Evaluating agents' } };
  applyTaxonomyChange(row, root, loadTaxonomy(root));
  const y = readFileSync(join(root, 'data/_tools/_categories.yaml'), 'utf8');
  assert.match(y, /agent-eval/);
  rmSync(root, { recursive: true, force: true });
});

test('applyTaxonomyChange rename cascades to YAML and tool frontmatter', () => {
  const root = fixtureTree();
  const row = { kind: 'taxonomy_change',
    payload: { op: 'rename', target_kind: 'subcategory', target: 'agent-memory', new_name: 'memory' } };
  applyTaxonomyChange(row, root, loadTaxonomy(root));
  const y = readFileSync(join(root, 'data/_tools/_categories.yaml'), 'utf8');
  assert.match(y, /\bmemory\b/);
  assert.doesNotMatch(y, /agent-memory/);
  // file moved into the renamed directory, frontmatter updated
  const moved = join(root, 'data/_tools/developers/agent-frameworks/memory/mem0.md');
  assert.ok(existsSync(moved));
  assert.equal(matter(readFileSync(moved, 'utf8')).data.subcategory, 'memory');
  rmSync(root, { recursive: true, force: true });
});

// ── Task 2.5: Orchestration pure tests ──────────────────────────────────────
import { orderForApply, appendChangelog } from './apply-suggestions.mjs';

test('orderForApply runs taxonomy_change before tool kinds, oldest-first within group', () => {
  const rows = [
    { id: '1', kind: 'new_tool', created_at: '2026-06-01' },
    { id: '2', kind: 'taxonomy_change', created_at: '2026-06-05', payload: { op: 'add_tag' } },
    { id: '3', kind: 'tool_edit', created_at: '2026-05-30' },
  ];
  assert.deepEqual(orderForApply(rows).map((r) => r.id), ['2', '3', '1']);
});

test('appendChangelog adds an entry under entries:, newest preserved', () => {
  const root = fixtureTree();
  writeFileSync(join(root, 'data', '_landscape_changelog.yaml'), 'entries: []\n');
  appendChangelog(root, { date: '2026-06-13', kind: 'new_tool', summary: 'Letta added', tool: 'letta', credit: 'dani' });
  const y = readFileSync(join(root, 'data', '_landscape_changelog.yaml'), 'utf8');
  assert.match(y, /Letta added/);
  assert.match(y, /credit: dani/);
  rmSync(root, { recursive: true, force: true });
});
