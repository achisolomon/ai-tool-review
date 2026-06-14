#!/usr/bin/env node
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { stringify as stringifyYaml, parse as parseYaml } from 'yaml';
import { readFileSync as _read, readdirSync as _readdir, statSync as _stat, writeFileSync, mkdirSync, unlinkSync, realpathSync } from 'node:fs';
import { join as _join, dirname, resolve as _resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

// ── Pure helpers (no I/O — unit tested) ─────────────────────────────────────

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const safeComponent = (s) => typeof s === 'string' && SLUG_RE.test(s);

// Only these frontmatter fields may be changed by a tool_edit suggestion.
// Anything else (layout, include, permalink, render_with_liquid, …) could alter Jekyll rendering.
export const ALLOWED_TOOL_EDIT_FIELDS = new Set([
  'website', 'description', 'pricing_model', 'pricing_starting',
  'user_count', 'github_url', 'github_stars', 'type', 'status',
]);

// Validate that a string is a safe http/https URL (blocks javascript:, data:, etc.)
export function isSafeHttpUrl(s) {
  if (typeof s !== 'string') return false;
  try { const u = new URL(s); return u.protocol === 'https:' || u.protocol === 'http:'; }
  catch { return false; }
}

// Tag families a community add_tag may target. Mirrors _tags.yaml top-level keys.
export const VALID_TAG_FAMILIES = new Set([
  'capabilities', 'integrations', 'deployment', 'use-cases',
]);

// Derive a safe slug from a human name. Forms collect `name`, not `slug`,
// for taxonomy add ops, so the slug is computed here at apply time.
export const slugify = (name) =>
  String(name || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

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
    // Prevent Jekyll from processing Liquid tags in user-supplied content.
    render_with_liquid: false,
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
    if (!isSafeHttpUrl(p.website)) return fail(`unsafe website URL: ${JSON.stringify(p.website)}`);
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
    for (const [field, { from, to }] of Object.entries(row.payload.changes || {})) {
      if (!ALLOWED_TOOL_EDIT_FIELDS.has(field)) return fail(`disallowed edit field: ${field}`);
      if ((field === 'website' || field === 'github_url') && !isSafeHttpUrl(to)) {
        return fail(`unsafe URL for ${field}: ${JSON.stringify(to)}`);
      }
      const cur = field === 'website' ? (hit.fm.website || hit.fm.url) : hit.fm[field];
      if ((cur ?? '') !== (from ?? '')) return fail(`stale ${field}: file has ${JSON.stringify(cur)}, payload from is ${JSON.stringify(from)}`);
    }
    return { ok: true };
  }
  if (row.kind === 'taxonomy_change') {
    const p = row.payload, op = p.op;
    if (op === 'other') return fail('op:other is hand-applied (never auto-applied)');
    if (op === 'add_subcategory') {
      if (!p.name || typeof p.name !== 'string') return fail('add_subcategory requires a non-empty name');
      if (!p.parent_category || typeof p.parent_category !== 'string') return fail('add_subcategory requires a non-empty parent_category');
      if (!safeComponent(p.slug)) return fail(`unsafe add_subcategory slug: ${JSON.stringify(p.slug)}`);
      const track = Object.keys(tax.cats).find((t) => tax.cats[t]?.[p.parent_category]);
      if (!track) return fail(`unknown parent_category: ${p.parent_category}`);
      if (tax.cats[track][p.parent_category].subcategories?.[p.slug]) return fail(`subcategory exists: ${p.slug}`);
      return { ok: true };
    }
    if (op === 'add_category') {
      if (!p.name || typeof p.name !== 'string') return fail('add_category requires a non-empty name');
      if (!safeComponent(p.slug)) return fail(`unsafe add_category slug: ${JSON.stringify(p.slug)}`);
      if (!['users', 'developers'].includes(p.track)) return fail(`invalid track: ${p.track}`);
      if (tax.cats[p.track]?.[p.slug]) return fail(`category exists: ${p.slug}`);
      return { ok: true };
    }
    if (op === 'add_tag') {
      if (!p.name || typeof p.name !== 'string') return fail('add_tag requires a non-empty name');
      if (!safeComponent(p.slug)) return fail(`unsafe add_tag slug: ${JSON.stringify(p.slug)}`);
      if (!VALID_TAG_FAMILIES.has(p.family)) return fail(`invalid tag family: ${p.family}`);
      if (tax.tags.has(p.slug)) return fail(`tag exists: ${p.slug}`);
      return { ok: true };
    }
    if (op === 'rename') {
      if (!['category', 'subcategory', 'tag'].includes(p.target_kind)) return fail(`invalid target_kind: ${p.target_kind}`);
      if (!safeComponent(p.target)) return fail(`unsafe rename target: ${JSON.stringify(p.target)}`);
      if (!safeComponent(slugify(p.new_name))) return fail(`unsafe rename new_name: ${JSON.stringify(p.new_name)}`);
      return { ok: true };
    }
    return fail(`unknown taxonomy op: ${op}`);
  }
  return fail(`unknown kind: ${row.kind}`);
}

// ── Per-kind apply functions (file mutations) ─────────────────────────────────

export function slugWithSuffix(root, slug) {
  if (!findToolFile(root, slug)) return slug;
  for (let i = 2; ; i++) if (!findToolFile(root, `${slug}-${i}`)) return `${slug}-${i}`;
}

export function applyNewTool(row, root, tax) {
  const baseSlug = row.payload.slug || slugify(row.payload.name);
  const finalSlug = slugWithSuffix(root, baseSlug);
  const renamed = finalSlug !== baseSlug;
  const fm = buildFrontmatter({ ...row, payload: { ...row.payload, slug: finalSlug } });
  const rel = toolPath({ track: fm.track, category: fm.category, subcategory: fm.subcategory, slug: finalSlug });
  const abs = _join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, matter.stringify(`\n${row.payload.description}\n`, fm));
  return `created ${rel}${renamed ? ` (slug renamed from ${baseSlug})` : ''}`;
}

export function applyToolPlacement(row, root, tax) {
  const hit = findToolFile(root, row.tool_slug);
  const prop = row.payload.proposed;
  const track = hit.fm.track === 'both' ? 'developers' : hit.fm.track;
  const fm = { ...hit.fm, category: prop.category, subcategory: prop.subcategory };
  let tags = new Set(hit.fm.tags || []);
  (prop.tags_add || []).forEach((t) => tags.add(t));
  (prop.tags_remove || []).forEach((t) => tags.delete(t));
  fm.tags = [...tags];
  const destRel = toolPath({ track, category: prop.category, subcategory: prop.subcategory, slug: row.tool_slug });
  const destAbs = _join(root, destRel);
  mkdirSync(dirname(destAbs), { recursive: true });
  const body = matter(_read(hit.file, 'utf8')).content;
  writeFileSync(destAbs, matter.stringify(body, fm));
  if (destAbs !== hit.file) unlinkSync(hit.file);
  return `moved ${row.tool_slug} -> ${prop.category}/${prop.subcategory}`;
}

export function applyToolEdit(row, root, tax) {
  const hit = findToolFile(root, row.tool_slug);
  const parsed = matter(_read(hit.file, 'utf8'));
  for (const [field, { to }] of Object.entries(row.payload.changes || {})) {
    if (!ALLOWED_TOOL_EDIT_FIELDS.has(field)) throw new Error(`disallowed edit field: ${field}`);
    parsed.data[field] = to;
  }
  writeFileSync(hit.file, matter.stringify(parsed.content, parsed.data));
  return `edited ${row.tool_slug}: ${Object.keys(row.payload.changes).join(', ')}`;
}

export function applyRename(row, root) {
  const { target_kind } = row.payload;
  const target = row.payload.target;
  const new_name = slugify(row.payload.new_name);
  if (!safeComponent(target)) throw new Error(`Unsafe rename target: ${JSON.stringify(target)}`);
  if (!safeComponent(new_name)) throw new Error(`Unsafe rename new_name: ${JSON.stringify(row.payload.new_name)}`);
  const tools = _join(root, 'data', '_tools');
  const catsPath = _join(tools, '_categories.yaml');
  if (target_kind === 'tag') {
    const tagsPath = _join(tools, '_tags.yaml');
    const tags = parseYaml(_read(tagsPath, 'utf8'));
    for (const fam of Object.values(tags)) if (Array.isArray(fam)) for (const t of fam) if (t.slug === target) t.slug = new_name;
    writeFileSync(tagsPath, stringifyYaml(tags));
    for (const f of walkTools(tools)) {
      const parsed = matter(_read(f, 'utf8'));
      if (Array.isArray(parsed.data.tags) && parsed.data.tags.includes(target)) {
        parsed.data.tags = parsed.data.tags.map((t) => (t === target ? new_name : t));
        writeFileSync(f, matter.stringify(parsed.content, parsed.data));
      }
    }
    return `renamed tag ${target} -> ${new_name}`;
  }
  // category or subcategory: update YAML key, move dirs, rewrite frontmatter
  const cats = parseYaml(_read(catsPath, 'utf8'));
  for (const [track, cs] of Object.entries(cats)) {
    for (const [cid, cd] of Object.entries(cs || {})) {
      if (target_kind === 'category' && cid === target) {
        cs[new_name] = cd; delete cs[cid];
      } else if (target_kind === 'subcategory' && cd.subcategories?.[target]) {
        cd.subcategories[new_name] = cd.subcategories[target]; delete cd.subcategories[target];
      }
    }
  }
  writeFileSync(catsPath, stringifyYaml(cats));
  for (const f of walkTools(tools)) {
    const parsed = matter(_read(f, 'utf8'));
    let changed = false;
    if (target_kind === 'category' && parsed.data.category === target) { parsed.data.category = new_name; changed = true; }
    if (target_kind === 'subcategory' && parsed.data.subcategory === target) { parsed.data.subcategory = new_name; changed = true; }
    if (changed) {
      const track = parsed.data.track === 'both' ? 'developers' : parsed.data.track;
      const destRel = toolPath({ track, category: parsed.data.category, subcategory: parsed.data.subcategory, slug: parsed.data.slug });
      const destAbs = _join(root, destRel);
      mkdirSync(dirname(destAbs), { recursive: true });
      writeFileSync(destAbs, matter.stringify(parsed.content, parsed.data));
      if (destAbs !== f) unlinkSync(f);
    }
  }
  return `renamed ${target_kind} ${target} -> ${new_name}`;
}

export function applyTaxonomyChange(row, root, tax) {
  const p = row.payload;
  const catsPath = _join(root, 'data', '_tools', '_categories.yaml');
  const tagsPath = _join(root, 'data', '_tools', '_tags.yaml');
  if (p.op === 'add_subcategory') {
    // Forms collect `name`, not `slug`; derive the YAML key here (mirrors validateRow).
    const slug = slugify(p.name);
    if (!safeComponent(slug)) throw new Error(`unsafe subcategory name: ${JSON.stringify(p.name)}`);
    const cats = parseYaml(_read(catsPath, 'utf8'));
    const track = Object.keys(cats).find((t) => cats[t]?.[p.parent_category]);
    if (!track) throw new Error(`unknown parent_category: ${p.parent_category}`);
    cats[track][p.parent_category].subcategories ||= {};
    cats[track][p.parent_category].subcategories[slug] = { name: p.name, description: p.description };
    writeFileSync(catsPath, stringifyYaml(cats));
    return `added subcategory ${slug} under ${p.parent_category}`;
  }
  if (p.op === 'add_category') {
    const slug = slugify(p.name);
    if (!safeComponent(slug)) throw new Error(`unsafe category name: ${JSON.stringify(p.name)}`);
    if (!['users', 'developers'].includes(p.track)) throw new Error(`invalid track: ${p.track}`);
    const cats = parseYaml(_read(catsPath, 'utf8'));
    cats[p.track] ||= {};
    cats[p.track][slug] = { name: p.name, description: p.description, subcategories: {} };
    writeFileSync(catsPath, stringifyYaml(cats));
    return `added category ${slug} (${p.track})`;
  }
  if (p.op === 'add_tag') {
    const slug = slugify(p.name);
    if (!safeComponent(slug)) throw new Error(`unsafe tag name: ${JSON.stringify(p.name)}`);
    if (!VALID_TAG_FAMILIES.has(p.family)) throw new Error(`invalid tag family: ${p.family}`);
    const tags = parseYaml(_read(tagsPath, 'utf8'));
    tags[p.family] ||= [];
    tags[p.family].push({ slug, name: p.name, description: p.description });
    writeFileSync(tagsPath, stringifyYaml(tags));
    return `added tag ${slug} (${p.family})`;
  }
  if (p.op === 'rename') {
    return applyRename(row, root);
  }
  throw new Error(`taxonomy op not auto-applicable: ${p.op}`);
}

// ── Orchestration pure helpers ────────────────────────────────────────────────

const KIND_ORDER = { taxonomy_change: 0, new_tool: 1, tool_placement: 1, tool_edit: 1 };
export function orderForApply(rows) {
  return [...rows].sort((a, b) =>
    (KIND_ORDER[a.kind] - KIND_ORDER[b.kind]) || (a.created_at < b.created_at ? -1 : 1));
}

export function appendChangelog(root, entry) {
  const path = _join(root, 'data', '_landscape_changelog.yaml');
  const doc = parseYaml(_read(path, 'utf8')) || { entries: [] };
  doc.entries = doc.entries || [];
  doc.entries.push(entry);
  writeFileSync(path, stringifyYaml(doc));
}

// ── CLI shell (I/O — not unit tested) ────────────────────────────────────────

export const FLAGS = (argv) => ({
  dryRun: argv.includes('--dry-run'),
  yes: argv.includes('--yes'),
  unapply: argv.includes('--unapply') ? argv[argv.indexOf('--unapply') + 1] : null,
});

async function confirmEnv(url, flags) {
  if (flags.dryRun || flags.yes) return true;
  const rl = createInterface({ input: stdin, output: stdout });
  const ans = await rl.question(`Apply against ${url} ? [y/N] `);
  rl.close();
  return ans.trim().toLowerCase() === 'y';
}

async function applyOne(row, root, tax) {
  switch (row.kind) {
    case 'new_tool': return applyNewTool(row, root, tax);
    case 'tool_placement': return applyToolPlacement(row, root, tax);
    case 'tool_edit': return applyToolEdit(row, root, tax);
    case 'taxonomy_change': return applyTaxonomyChange(row, root, tax);
    default: throw new Error(`unknown kind ${row.kind}`);
  }
}

async function run(flags) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } });
  const root = process.cwd();   // run from ai-tool-review/

  if (flags.unapply) {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(flags.unapply || '')) {
      console.error('--unapply requires a valid suggestion UUID.');
      process.exit(1);
    }
    const { data: target, error: fetchErr } = await supabase
      .from('suggestions').select('id,status').eq('id', flags.unapply).maybeSingle();
    if (fetchErr) { console.error(fetchErr.message); process.exit(1); }
    if (!target) { console.error(`No suggestion found: ${flags.unapply}`); process.exit(1); }
    if (target.status !== 'applied') {
      console.error(`Refusing to un-apply: status is '${target.status}', not 'applied'.`);
      process.exit(1);
    }
    const { error: upErr } = await supabase
      .from('suggestions').update({ status: 'approved', applied_at: null }).eq('id', flags.unapply);
    if (upErr) { console.error(upErr.message); process.exit(1); }
    console.log(`Un-applied ${flags.unapply} (revert its diff manually).`);
    return;
  }

  const { data: rows, error } = await supabase.from('suggestions').select('*').eq('status', 'approved');
  if (error) { console.error(error.message); process.exit(1); }
  const today = new Date().toISOString().slice(0, 10);
  const ordered = orderForApply(rows);

  let tax = loadTaxonomy(root);
  const applied = [], skipped = [], failed = [];
  for (const row of ordered) {
    const v = validateRow(row, root, tax);
    if (!v.ok) { skipped.push(`SKIP ${row.id} (${row.kind}): ${v.reason}`); continue; }
    if (flags.dryRun) { applied.push(`PLAN ${row.id} (${row.kind})`); continue; }
    try {
      const report = await applyOne(row, root, tax);
      appendChangelog(root, changelogEntry(row, today));
      // Taxonomy mutations change the on-disk YAML; reload so later rows in the
      // same run (e.g. a new_tool into a just-added subcategory) validate correctly.
      if (row.kind === 'taxonomy_change') tax = loadTaxonomy(root);
      const { error: upErr } = await supabase.from('suggestions')
        .update({ status: 'applied', applied_at: new Date().toISOString() }).eq('id', row.id);
      if (upErr) {
        // Files are mutated but the row stays 'approved' — warn loudly so the
        // operator can fix status manually rather than silently re-applying next run.
        failed.push(`WRITEBACK-FAILED ${row.id} (${row.kind}): applied to disk but DB update errored: ${upErr.message}`);
      } else {
        applied.push(`APPLIED ${row.id}: ${report}`);
      }
    } catch (e) {
      failed.push(`FAILED ${row.id} (${row.kind}): ${e.message}`);
    }
  }

  applied.forEach((l) => console.log(l));
  skipped.forEach((l) => console.warn(l));
  failed.forEach((l) => console.error(l));
  if (!flags.dryRun && applied.length) {
    console.log('\nNext: npm run generate && git diff   (review, then commit).');
  }
  if (failed.length) process.exitCode = 1;
}

async function main() {
  const flags = FLAGS(process.argv.slice(2));
  const url = process.env.SUPABASE_URL;
  if (!url || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see .env.example).');
    process.exit(1);
  }
  if (!(await confirmEnv(url, flags))) { console.log('Aborted.'); return; }
  await run(flags);
}

// Only run main when executed directly, so the test file can import pure fns.
// Use fileURLToPath + realpathSync to handle spaces and symlinks in the path.
{
  const thisFile = realpathSync(fileURLToPath(import.meta.url));
  const entryFile = process.argv[1] ? realpathSync(_resolve(process.argv[1])) : null;
  if (thisFile === entryFile) main();
}
