#!/usr/bin/env node
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { stringify as stringifyYaml, parse as parseYaml } from 'yaml';
import { readFileSync as _read, readdirSync as _readdir, statSync as _stat } from 'node:fs';
import { join as _join } from 'node:path';
import matter from 'gray-matter';

// ── Pure helpers (no I/O — unit tested) ─────────────────────────────────────

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const safeComponent = (s) => typeof s === 'string' && SLUG_RE.test(s);

export function toolPath({ track, category, subcategory, slug }) {
  for (const c of [track, category, subcategory, slug]) {
    if (!safeComponent(c)) throw new Error(`Unsafe path component: ${JSON.stringify(c)}`);
  }
  return `data/_tools/${track}/${category}/${subcategory}/${slug}.md`;
}

export function buildFrontmatter({ payload, credit_name, public_credit }) {
  const p = payload.placement || {};
  const fm = {
    name: payload.name,
    slug: payload.slug,
    website: payload.website,
    type: payload.type || 'commercial',
    track: p.track,
    category: p.category,
    subcategory: p.subcategory,
    status: 'active',
    description: payload.description,
  };
  if (payload.pricing_model) fm.pricing_model = payload.pricing_model;
  if (Array.isArray(payload.tags) && payload.tags.length) fm.tags = payload.tags;
  fm.last_verified = new Date().toISOString().slice(0, 10);
  if (public_credit && credit_name) fm.suggested_by = credit_name;
  return fm;
}

export function changelogEntry(row, dateStr) {
  const p = row.payload || {};
  let summary;
  if (row.kind === 'new_tool') {
    const where = p.placement ? `${p.placement.category} / ${p.placement.subcategory}` : 'the map';
    summary = `${p.name} added to ${where}`;
  } else if (row.kind === 'tool_placement') {
    summary = `${row.tool_slug} moved to ${p.proposed?.subcategory ?? 'a new shelf'}`;
  } else if (row.kind === 'tool_edit') {
    summary = `${row.tool_slug} details updated`;
  } else {
    summary = `Taxonomy: ${p.op}${p.name ? ` ${p.name}` : ''}`;
  }
  const e = { date: dateStr, kind: row.kind, summary };
  if (row.tool_slug || p.placement) e.tool = row.tool_slug || p.slug || p.name?.toLowerCase();
  if (row.public_credit && row.credit_name) e.credit = row.credit_name;
  return e;
}

// ── I/O helpers (used by pure validators + apply functions) ─────────────────

function walkTools(dir) {
  const out = [];
  for (const e of _readdir(dir)) {
    const p = _join(dir, e);
    if (_stat(p).isDirectory()) out.push(...walkTools(p));
    else if (e.endsWith('.md') && !e.startsWith('_')) out.push(p);
  }
  return out;
}

export function loadTaxonomy(root) {
  const tools = _join(root, 'data', '_tools');
  const cats = parseYaml(_read(_join(tools, '_categories.yaml'), 'utf8')) || {};
  const tagsY = parseYaml(_read(_join(tools, '_tags.yaml'), 'utf8')) || {};
  const triples = new Set();      // track/category/subcategory
  for (const [track, cs] of Object.entries(cats)) {
    for (const [cid, cd] of Object.entries(cs || {})) {
      for (const sid of Object.keys(cd.subcategories || {})) triples.add(`${track}/${cid}/${sid}`);
    }
  }
  const tags = new Set();
  for (const fam of Object.values(tagsY)) if (Array.isArray(fam)) for (const t of fam) tags.add(t.slug);
  return { cats, triples, tags };
}

export function findToolFile(root, slug) {
  const tools = _join(root, 'data', '_tools');
  for (const f of walkTools(tools)) {
    const fm = matter(_read(f, 'utf8')).data;
    if (fm.slug === slug) return { file: f, fm };
  }
  return null;
}

export function validateRow(row, root, tax) {
  const fail = (reason) => ({ ok: false, reason });
  if (row.kind === 'new_tool') {
    const p = row.payload, pl = p.placement;
    if (!pl) return fail('placement is null — admin must set it before approval');
    if (!safeComponent(p.slug)) return fail(`unsafe slug: ${p.slug}`);
    if (!tax.triples.has(`${pl.track}/${pl.category}/${pl.subcategory}`)) return fail(`unknown placement subcategory: ${pl.track}/${pl.category}/${pl.subcategory}`);
    for (const t of p.tags || []) if (!tax.tags.has(t)) return fail(`unknown tag: ${t}`);
    if (findToolFile(root, p.slug)) return fail(`slug collision: ${p.slug}`);
    return { ok: true };
  }
  if (row.kind === 'tool_placement') {
    const hit = findToolFile(root, row.tool_slug);
    if (!hit) return fail(`tool not found: ${row.tool_slug}`);
    const cur = row.payload.current, prop = row.payload.proposed;
    if (hit.fm.category !== cur.category || hit.fm.subcategory !== cur.subcategory) {
      return fail(`stale: file is ${hit.fm.category}/${hit.fm.subcategory}, payload current says ${cur.category}/${cur.subcategory}`);
    }
    if (!tax.triples.has(`${hit.fm.track === 'both' ? 'developers' : hit.fm.track}/${prop.category}/${prop.subcategory}`)) {
      return fail(`unknown proposed placement: ${prop.category}/${prop.subcategory}`);
    }
    for (const t of prop.tags_add || []) if (!tax.tags.has(t)) return fail(`unknown tag: ${t}`);
    return { ok: true };
  }
  if (row.kind === 'tool_edit') {
    const hit = findToolFile(root, row.tool_slug);
    if (!hit) return fail(`tool not found: ${row.tool_slug}`);
    for (const [field, { from }] of Object.entries(row.payload.changes || {})) {
      const cur = field === 'website' ? (hit.fm.website || hit.fm.url) : hit.fm[field];
      if ((cur ?? '') !== (from ?? '')) return fail(`stale ${field}: file has ${JSON.stringify(cur)}, payload from is ${JSON.stringify(from)}`);
    }
    return { ok: true };
  }
  if (row.kind === 'taxonomy_change') {
    const op = row.payload.op;
    if (op === 'other') return fail('op:other is hand-applied (never auto-applied)');
    // add_*: name must not already exist; rename: target must exist. Full checks in Task 2.4.
    return { ok: true };
  }
  return fail(`unknown kind: ${row.kind}`);
}

export const FLAGS = (argv) => ({
  dryRun: argv.includes('--dry-run'),
  yes: argv.includes('--yes'),
  unapply: argv.includes('--unapply') ? argv[argv.indexOf('--unapply') + 1] : null,
  stamp: argv.includes('--stamp') ? argv[argv.indexOf('--stamp') + 1] : null,
});

async function confirmEnv(url, flags) {
  if (flags.dryRun || flags.yes) return true;
  const rl = createInterface({ input: stdin, output: stdout });
  const ans = await rl.question(`Apply against ${url} ? [y/N] `);
  rl.close();
  return ans.trim().toLowerCase() === 'y';
}

async function main() {
  const flags = FLAGS(process.argv.slice(2));
  const url = process.env.SUPABASE_URL;
  if (!url || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see .env.example).');
    process.exit(1);
  }
  if (!(await confirmEnv(url, flags))) { console.log('Aborted.'); return; }
  // orchestration added in Task 2.5
}

// Only run main when executed directly, so the test file can import pure fns.
if (import.meta.url === `file://${process.argv[1]}`) main();
