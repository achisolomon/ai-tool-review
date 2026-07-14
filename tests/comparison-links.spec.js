// Competitor-links tests. Layers:
//   1. Pure-function unit tests (browser-less, vm-loaded) — this file, below.
//   2. Never-broken invariant (browser-less) — added in Task 2.
//   3. Browser E2E (Playwright page) — added in Task 4.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';

// Load js/comparison-links.js in a minimal sandbox and return window.ComparisonLinks.
// The module only touches window/document inside functions, so stubs suffice for
// the pure functions (norm, buildIndex).
function loadComparisonLinks() {
  const src = readFileSync(path.join(process.cwd(), 'js', 'comparison-links.js'), 'utf8');
  const ctx = { window: {}, document: {}, Map, Set, console };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return ctx.window.ComparisonLinks;
}

test.describe('comparison-links: norm()', () => {
  test('lowercases, strips spaces/punctuation, and drops parentheticals', () => {
    const { norm } = loadComparisonLinks();
    expect(norm('LangChain (Python)')).toBe('langchain');
    expect(norm('Hugging Face')).toBe('huggingface');
    expect(norm('HuggingFace')).toBe('huggingface');
    expect(norm('llama.cpp')).toBe('llamacpp');
    expect(norm('Orq.ai')).toBe('orqai');
    expect(norm('Competitor 1')).toBe('competitor1');
    expect(norm(null)).toBe('');
  });

  test('a superset name does not collapse to the base name', () => {
    const { norm } = loadComparisonLinks();
    expect(norm('HuggingFace Inference')).not.toBe(norm('Hugging Face'));
  });
});

test.describe('comparison-links: buildIndex()', () => {
  test('maps normalized tool names to slugs across both tracks', () => {
    const { buildIndex, norm } = loadComparisonLinks();
    const data = {
      users: [{ subcategories: [{ tools: [{ name: 'Andi', slug: 'andi' }] }] }],
      developers: [{ subcategories: [{ tools: [
        { name: 'Humanloop', slug: 'humanloop' },
        { name: 'PromptLayer', slug: 'promptlayer' },
      ] }] }],
    };
    const idx = buildIndex(data);
    expect(idx.get(norm('Humanloop'))).toBe('humanloop');
    expect(idx.get(norm('promptlayer'))).toBe('promptlayer');
    expect(idx.get(norm('Andi'))).toBe('andi');
  });

  test('drops keys where two different slugs collide (ambiguous → never link)', () => {
    const { buildIndex, norm } = loadComparisonLinks();
    const data = {
      users: [],
      developers: [{ subcategories: [{ tools: [
        { name: 'Foo Bar', slug: 'foo-bar' },
        { name: 'FooBar', slug: 'foobar-other' },
      ] }] }],
    };
    const idx = buildIndex(data);
    expect(idx.has(norm('foobar'))).toBe(false);
  });

  test('indexes only tools that have both a name and a slug', () => {
    const { buildIndex, norm } = loadComparisonLinks();
    const data = {
      users: [],
      developers: [{ subcategories: [{ tools: [
        { name: 'NoSlug' },
        { slug: 'no-name' },
        { name: 'Real', slug: 'real' },
      ] }] }],
    };
    const idx = buildIndex(data);
    // Only the fully-formed tool is indexed — the name-only and slug-only
    // entries are excluded. (A placeholder like "Competitor 1" therefore has
    // no key simply because it is never a catalog tool; that "stays plain"
    // behavior is exercised end-to-end in the browser E2E suite.)
    expect([...idx.keys()]).toEqual([norm('Real')]);
    expect(idx.get(norm('Real'))).toBe('real');
  });
});

import fs from 'fs';

// Load landscapeData from js/data.js (same technique as data-integrity.spec.js).
function loadLandscapeData() {
  const src = readFileSync(path.join(process.cwd(), 'js', 'data.js'), 'utf8');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(src + '\n;this.__data = landscapeData;', ctx);
  return ctx.__data;
}

function forEachTool(data, cb) {
  ['users', 'developers'].forEach((track) =>
    (data[track] || []).forEach((category) =>
      (category.subcategories || []).forEach((sub) =>
        (sub.tools || []).forEach((tool) => cb(tool))
      )
    )
  );
}

test.describe('comparison-links: never-broken invariant', () => {
  test('every catalog slug resolves to a built /tools/{slug}/ page', () => {
    const siteDir = path.join(process.cwd(), '_site');
    test.skip(!fs.existsSync(siteDir), '_site not built — run: bundle exec jekyll build');
    const data = loadLandscapeData();
    const missing = [];
    forEachTool(data, (tool) => {
      if (!tool.slug) return;
      const page = path.join(siteDir, 'tools', tool.slug, 'index.html');
      if (!fs.existsSync(page)) missing.push(tool.slug);
    });
    expect(missing).toEqual([]);
  });

  test('tool permalink format still matches the linker URL template (/tools/:slug/)', () => {
    const cfg = readFileSync(path.join(process.cwd(), '_config.yml'), 'utf8');
    expect(cfg).toMatch(/permalink:\s*\/tools\/:slug\//);
  });
});
