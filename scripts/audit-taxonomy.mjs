#!/usr/bin/env node
// Audits dataset consistency. Read-only. Run: node scripts/audit-taxonomy.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

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

function frontmatter(file) {
  const m = readFileSync(file, 'utf8').match(/^---\s*\n([\s\S]*?)\n---/);
  return m ? parse(m[1]) : null;
}

const files = walk(TOOLS);

// (a) tag vocabulary gap
const tagsYaml = parse(readFileSync(join(TOOLS, '_tags.yaml'), 'utf8'));
const vocab = new Set();
for (const fam of Object.values(tagsYaml)) if (Array.isArray(fam)) for (const t of fam) vocab.add(t.slug);
const usedTags = new Set();
for (const f of files) for (const t of frontmatter(f)?.tags || []) usedTags.add(t);
const undefinedTags = [...usedTags].filter((t) => !vocab.has(t)).sort();

// (b) taxonomy triples gap
const cats = parse(readFileSync(join(TOOLS, '_categories.yaml'), 'utf8'));
const known = new Set();
for (const [track, cs] of Object.entries(cats)) for (const [cid, cd] of Object.entries(cs || {})) {
  for (const sid of Object.keys(cd.subcategories || {})) known.add(`${track}/${cid}/${sid}`);
}
const usedTriples = new Set();
for (const f of files) {
  const fm = frontmatter(f); if (!fm) continue;
  const track = fm.track === 'both' ? 'developers' : fm.track;
  if (fm.category && fm.subcategory) usedTriples.add(`${track}/${fm.category}/${fm.subcategory}`);
}
const missingTriples = [...usedTriples].filter((t) => !known.has(t)).sort();

// (c) flat-path files (2-level: track/category/slug.md, frontmatter declares a subcategory)
const flat = files.filter((f) => f.split('/').length === 5 && frontmatter(f)?.subcategory).sort();

console.log('UNDEFINED TAGS:', undefinedTags);
console.log('MISSING TAXONOMY TRIPLES:', missingTriples);
console.log('FLAT-PATH FILES (need moving):', flat.length);
flat.forEach((f) => console.log('  ', f));
