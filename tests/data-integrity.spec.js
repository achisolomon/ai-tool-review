// Data Integrity Tests (no browser needed)
// Validates js/data.js invariants that the search UI depends on.
// These run in milliseconds and catch data regressions before the
// browser-level search-consistency suite even starts.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';
const fs = require('fs');
const fsPath = require('path');
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
    const p = fsPath.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walkTools(p));
    else if (e.name.endsWith('.md') && !e.name.startsWith('_')) out.push(p);
  }
  return out;
}

test('no tool description prose hardcodes a GitHub star figure', () => {
  const offenders = [];
  // A star FIGURE (number + optional k/+) followed by "stars", excluding "N/M stars" ratings
  // via the negative lookbehind on '/' or a digit.
  const re = /(?<![\/\d])\b\d[\d.,]*\s*[kK]?\+?\s*(github\s+)?stars?\b/i;
  for (const file of walkTools('data/_tools')) {
    const content = fs.readFileSync(file, 'utf8');
    const body = content.replace(/^---[\s\S]*?---/, ''); // strip frontmatter
    if (re.test(body)) offenders.push(fsPath.relative('data/_tools', file));
  }
  expect(offenders, `Star figures must live only in the badge:\n${offenders.join('\n')}`).toEqual([]);
});
