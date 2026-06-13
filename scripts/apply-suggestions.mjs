#!/usr/bin/env node
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { stringify as stringifyYaml } from 'yaml';

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
