// Data Integrity Tests (no browser needed)
// Validates js/data.js invariants that the search UI depends on.
// These run in milliseconds and catch data regressions before the
// browser-level search-consistency suite even starts.

import { test, expect } from '@playwright/test';
import fs, { readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';

function loadLandscapeData() {
  const src = readFileSync(path.join(process.cwd(), 'js', 'data.js'), 'utf8');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(src + '\n;this.__data = landscapeData;', ctx);
  return ctx.__data;
}

const data = loadLandscapeData();

function forEachTool(cb) {
  ['users', 'developers'].forEach(track =>
    (data[track] || []).forEach(category =>
      category.subcategories.forEach(subcategory =>
        subcategory.tools.forEach(tool => cb(tool, { track, category, subcategory }))
      )
    )
  );
}

test.describe('data.js integrity', () => {
  test('both tracks exist and are non-empty', () => {
    expect(Array.isArray(data.users) && data.users.length).toBeTruthy();
    expect(Array.isArray(data.developers) && data.developers.length).toBeTruthy();
  });

  test('every tool has the fields the search UI renders', () => {
    const problems = [];
    forEachTool((tool, { track, category, subcategory }) => {
      const where = `${track}/${category.id}/${subcategory.id}/${tool.slug || tool.name}`;
      if (!tool.name) problems.push(`${where}: missing name`);
      if (!tool.slug) problems.push(`${where}: missing slug`);
      if (!tool.desc) problems.push(`${where}: missing desc`);
      if (!tool.type) problems.push(`${where}: missing type`);
      if (!tool.url) problems.push(`${where}: missing url`);
    });
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('no duplicate tool slugs within a single subcategory', () => {
    const problems = [];
    ['users', 'developers'].forEach(track =>
      (data[track] || []).forEach(category =>
        category.subcategories.forEach(subcategory => {
          const slugs = subcategory.tools.map(t => t.slug);
          const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
          if (dupes.length) {
            problems.push(`${track}/${category.id}/${subcategory.id}: ${[...new Set(dupes)].join(', ')}`);
          }
        })
      )
    );
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('no duplicate tool slugs across the whole dataset (cross-listings removed)', () => {
    // additional_categories cross-listing was intentionally removed
    // (2026-06-12) after it produced duplicate cards and inflated tag
    // counts. If a cross-listing is reintroduced on purpose, the search
    // UI dedupes — but flag it here so it's a conscious decision.
    const slugs = [];
    forEachTool(tool => slugs.push(tool.slug));
    const dupes = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
    expect(dupes, `cross-listed slugs: ${dupes.join(', ')}`).toEqual([]);
  });

  test('category and subcategory ids are unique and well-formed', () => {
    const catIds = [];
    const problems = [];
    ['users', 'developers'].forEach(track =>
      (data[track] || []).forEach(category => {
        catIds.push(category.id);
        if (!category.name) problems.push(`category ${category.id}: missing name`);
        const subIds = category.subcategories.map(s => s.id);
        const dupSubs = subIds.filter((s, i) => subIds.indexOf(s) !== i);
        if (dupSubs.length) problems.push(`category ${category.id}: duplicate subcategory ids ${dupSubs.join(', ')}`);
        category.subcategories.forEach(s => {
          if (!s.name) problems.push(`subcategory ${s.id}: missing name`);
        });
      })
    );
    const dupCats = catIds.filter((c, i) => catIds.indexOf(c) !== i);
    expect(dupCats, `duplicate category ids: ${dupCats.join(', ')}`).toEqual([]);
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('every tag is non-empty, lowercase, and hyphen-separated', () => {
    const bad = new Set();
    forEachTool(tool => {
      (tool.all_tags || tool.tags || []).forEach(tag => {
        if (!tag || tag !== tag.toLowerCase() || /\s/.test(tag)) bad.add(tag);
      });
    });
    expect([...bad], `malformed tags: ${[...bad].join(', ')}`).toEqual([]);
  });

  test('tag occurrence count equals unique-tool count for every tag', () => {
    // If these ever differ, dropdown counts and rendered results disagree.
    const occurrences = {};
    const uniques = {};
    forEachTool(tool => {
      (tool.all_tags || tool.tags || []).forEach(tag => {
        occurrences[tag] = (occurrences[tag] || 0) + 1;
        (uniques[tag] = uniques[tag] || new Set()).add(tool.slug);
      });
    });
    const mismatches = Object.keys(occurrences)
      .filter(tag => occurrences[tag] !== uniques[tag].size)
      .map(tag => `${tag}: ${occurrences[tag]} occurrences vs ${uniques[tag].size} unique tools`);
    expect(mismatches, mismatches.join('\n')).toEqual([]);
  });
});

function walkTools(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walkTools(p));
    else if (e.name.endsWith('.md') && !e.name.startsWith('_') && !e.name.startsWith('zzz-test-')) out.push(p);
  }
  return out;
}

test('every tool .md file appears in data.js (no silent drops)', () => {
  // Guards against generate_json_lib.rb silently skipping tools due to
  // missing required frontmatter fields (e.g. subcategory was previously
  // mandatory, causing flat-category tools to vanish from search).
  const toolFiles = walkTools('data/_tools');
  const slugsInDataJs = new Set();
  forEachTool(tool => slugsInDataJs.add(tool.slug));

  const missing = [];
  for (const file of toolFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^---[\s\S]*?^slug:\s*"?([^"\n]+)"?/m);
    if (!match) { missing.push(`${path.relative('data/_tools', file)}: no slug in frontmatter`); continue; }
    const slug = match[1].trim();
    if (!slugsInDataJs.has(slug)) {
      missing.push(`${path.relative('data/_tools', file)}: slug "${slug}" present in .md but missing from data.js`);
    }
  }
  expect(missing, `Tools dropped by generator:\n${missing.join('\n')}`).toEqual([]);
});

test('tools without a subcategory field are not dropped (flat-category regression)', () => {
  // Regression test: generate_json_lib.rb used to require subcategory and silently
  // drop tools that omitted it. Now it defaults to the category id.
  // Uses a Ruby tmpdir so no disk fixture pollutes the real tools tree.
  const { execSync, spawnSync } = require('child_process');
  const os = require('os');
  const root = process.cwd();

  // Write a self-contained Ruby script to a temp file
  const scriptFile = path.join(os.tmpdir(), 'test-flat-category-regression.rb');
  fs.writeFileSync(scriptFile, [
    `$LOAD_PATH.unshift(File.join(${JSON.stringify(root)}, 'scripts'))`,
    `require 'generate_json_lib'`,
    `require 'tmpdir'`,
    `require 'fileutils'`,
    `tmpdir = Dir.mktmpdir`,
    `FileUtils.mkdir_p(File.join(tmpdir, 'users/slide-creation'))`,
    `File.write(File.join(tmpdir, 'users/slide-creation/flat-tool.md'),`,
    `  "---\\nname: \\"Flat Tool\\"\\nslug: \\"flat-tool-regression\\"\\nwebsite: \\"https://example.com\\"\\ntype: \\"commercial\\"\\ntrack: \\"users\\"\\ncategory: \\"slide-creation\\"\\nstatus: \\"active\\"\\ndescription: \\"test\\"\\npricing_model: \\"freemium\\"\\nlast_verified: \\"2026-06-14\\"\\n---\\n")`,
    `result = build_tools_json(tmpdir, {})`,
    `FileUtils.rm_rf(tmpdir)`,
    `slugs = result['users'].flat_map { |c| c['subcategories'].flat_map { |s| s['tools'].map { |t| t['slug'] } } }`,
    `puts slugs.include?('flat-tool-regression') ? 'PASS' : 'FAIL:' + slugs.inspect`,
  ].join("\n"));

  const result = spawnSync('ruby', [scriptFile], { cwd: root, encoding: 'utf8' });
  fs.unlinkSync(scriptFile);

  const output = (result.stdout || '').trim();
  expect(result.status, `Ruby script error: ${result.stderr}`).toBe(0);
  expect(output, `Generator dropped flat-category tool. Slugs found: ${output}`).toBe('PASS');
});

test('no tool description prose hardcodes a GitHub star figure', () => {
  const offenders = [];
  // A star FIGURE (number + optional k/+) followed by "stars", excluding "N/M stars" ratings
  // via the negative lookbehind on '/' or a digit.
  const re = /(?<![\/\d])\b\d[\d.,]*\s*[kK]?\+?\s*(github\s+)?stars?\b/i;
  for (const file of walkTools('data/_tools')) {
    const content = fs.readFileSync(file, 'utf8');
    const body = content.replace(/^---[\s\S]*?---/, ''); // strip frontmatter
    if (re.test(body)) offenders.push(path.relative('data/_tools', file));
  }
  expect(offenders, `Star figures must live only in the badge:\n${offenders.join('\n')}`).toEqual([]);
});
