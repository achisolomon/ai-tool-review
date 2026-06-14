#!/usr/bin/env node
// Moves 2-level tool files into their declared subcategory directory. Idempotent.
// Run: node scripts/normalize-paths.mjs        (dry run)
//      node scripts/normalize-paths.mjs --go    (perform git mv)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { parse } from 'yaml';

const GO = process.argv.includes('--go');
const TOOLS = 'data/_tools';

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith('.md') && !e.startsWith('_')) out.push(p);
  }
  return out;
}
const fm = (f) => { const m = readFileSync(f, 'utf8').match(/^---\s*\n([\s\S]*?)\n---/); return m ? parse(m[1]) : null; };

for (const f of walk(TOOLS)) {
  const parts = f.split('/');             // data/_tools/<track>/<category>/<slug>.md  => length 5
  if (parts.length !== 5) continue;       // already 3-level
  const meta = fm(f);
  if (!meta?.subcategory) continue;
  // Use frontmatter track/category (may differ from directory name)
  const track = (meta.track === 'both' ? 'developers' : meta.track) || parts[2];
  const category = meta.category || parts[3];
  const dest = join(TOOLS, track, category, meta.subcategory, parts[4]);
  if (dest === f) continue;
  console.log(`${GO ? 'MOVE' : 'PLAN'}: ${f}  ->  ${dest}`);
  if (GO) {
    execSync(`mkdir -p "${dirname(dest)}"`);
    execSync(`git mv "${f}" "${dest}"`);
  }
}
