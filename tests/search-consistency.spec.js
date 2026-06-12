// Search Consistency Tests
// Verifies the search dropdown (autocomplete) and the rendered results grid
// agree with each other and with the underlying data, for every entity type:
// tags, categories, subcategories, and tools.
//
// Expectations are computed from js/data.js at test load time (data-driven),
// so these tests stay correct as tools are added/removed.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';
import vm from 'vm';

// ---------------------------------------------------------------------------
// Load landscapeData in Node and compute expectations (mirrors site data, not
// site logic — the assertions below check the LIVE page against this data).
// Tests always run from the repo root (playwright.config.js lives there).
// ---------------------------------------------------------------------------
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

// Unique tools (deduped by slug) per tag — this is what the UI must show.
function toolsByTag(tagSlug) {
  const seen = new Set();
  const tools = [];
  forEachTool(tool => {
    const tags = tool.all_tags || tool.tags || [];
    if (tags.includes(tagSlug) && !seen.has(tool.slug)) {
      seen.add(tool.slug);
      tools.push(tool);
    }
  });
  return tools;
}

// Unique tools per category / subcategory (deduped by slug).
function toolsByCategory(categoryId, subcategoryId = null) {
  const seen = new Set();
  const tools = [];
  forEachTool((tool, { category, subcategory }) => {
    if (category.id !== categoryId) return;
    if (subcategoryId && subcategory.id !== subcategoryId) return;
    if (seen.has(tool.slug)) return;
    seen.add(tool.slug);
    tools.push(tool);
  });
  return tools;
}

function allCategories() {
  const cats = [];
  ['users', 'developers'].forEach(track =>
    (data[track] || []).forEach(category => cats.push({ ...category, track }))
  );
  return cats;
}

function allSubcategories() {
  const subs = [];
  ['users', 'developers'].forEach(track =>
    (data[track] || []).forEach(category =>
      category.subcategories.forEach(subcategory =>
        subs.push({ ...subcategory, categoryId: category.id, categoryName: category.name, track })
      )
    )
  );
  return subs;
}

function allTags() {
  const tags = new Set();
  forEachTool(tool => (tool.all_tags || tool.tags || []).forEach(t => tags.add(t)));
  return [...tags];
}

// Deterministic sample: spread evenly across the (sorted) list.
function sample(arr, n) {
  const sorted = [...arr].sort((a, b) => (a.id || a).toString().localeCompare((b.id || b).toString()));
  if (sorted.length <= n) return sorted;
  const step = sorted.length / n;
  return Array.from({ length: n }, (_, i) => sorted[Math.floor(i * step)]);
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
// Errors thrown by third-party scripts (AdSense/GTM) on localhost are not
// ours to fix — everything else must fail the test.
function isThirdPartyError(err) {
  const stack = err.stack || '';
  return /googlesyndication|googletagmanager|adsbygoogle|google-analytics/.test(stack) ||
    (err.message.length <= 2 && !stack.includes('localhost'));
}

async function setup(page) {
  const errors = [];
  page.on('pageerror', err => {
    if (!isThirdPartyError(err)) errors.push(err.message);
  });
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted');
  });
  await page.goto('/');
  return errors;
}

async function typeQuery(page, text) {
  const input = page.locator('#action-input');
  await input.click();
  await input.fill(text);
  // wait past autocomplete debounce (100ms) and search debounce (250ms)
  await page.waitForTimeout(450);
}

function dropdownItem(page, type, name) {
  return page
    .locator(`.autocomplete-item[data-type="${type}"]`)
    .filter({ has: page.locator('.autocomplete-item-name', { hasText: new RegExp(`^${escapeRegex(name)}$`, 'i') }) })
    .first();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function expectResultCount(page, n) {
  await expect(page.locator('#results-count')).toHaveText(`${n} tool${n === 1 ? '' : 's'} found`, { timeout: 5000 });
  await expect(page.locator('.result-card')).toHaveCount(n);
}

async function visibleToolNames(page) {
  return page.locator('.result-card').evaluateAll(cards => cards.map(c => c.dataset.name));
}

async function expectNoDuplicateCards(page) {
  const names = await visibleToolNames(page);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  expect(dupes, `duplicate result cards: ${dupes.join(', ')}`).toEqual([]);
}

// ===========================================================================
// 1. TAG flows — dropdown count must equal rendered results, and every
//    rendered tool must actually carry the tag.
// ===========================================================================
test.describe('Tag search consistency', () => {
  // Regression: the original bug — clicking a tag did nothing
  // (showSearchResults was undefined) and stale fuzzy results stayed visible.
  const REGRESSION_TAGS = ['skills-catalog'];
  // Deterministic sample across the tag universe + the tags that previously
  // had inflated counts due to cross-listed tools.
  const SAMPLED_TAGS = [
    ...REGRESSION_TAGS,
    'voice-ai',
    'unified-communications',
    'no-code',
    ...sample(allTags(), 12),
  ];
  const uniqueTags = [...new Set(SAMPLED_TAGS)].filter(t => toolsByTag(t).length > 0);

  for (const tag of uniqueTags) {
    test(`tag "${tag}": dropdown count == clicked results == data`, async ({ page }) => {
      const errors = await setup(page);
      const expected = toolsByTag(tag);
      const tagName = tag.replace(/-/g, ' ');

      await typeQuery(page, tagName);

      const item = dropdownItem(page, 'tag', tagName);
      await expect(item, `tag "${tagName}" should appear in dropdown`).toBeVisible();
      await expect(item.locator('.autocomplete-item-meta')).toHaveText(
        `${expected.length} tools with this tag`
      );

      await item.click();

      await expectResultCount(page, expected.length);
      await expectNoDuplicateCards(page);

      // Every rendered tool must actually have the tag.
      const names = await visibleToolNames(page);
      const expectedNames = expected.map(t => t.name).sort();
      expect(names.slice().sort()).toEqual(expectedNames);

      // URL must reflect the tag filter (shareable link).
      expect(new URL(page.url()).searchParams.get('tag')).toBe(tag);

      expect(errors, `page errors: ${errors.join('; ')}`).toEqual([]);
    });
  }

  test('tag deep link ?tag= renders the same tools as clicking the tag', async ({ page }) => {
    const errors = await setup(page);
    const tag = uniqueTags[0];
    const expected = toolsByTag(tag);

    await page.goto(`/?tag=${tag}`);
    await expectResultCount(page, expected.length);
    const names = await visibleToolNames(page);
    expect(names.slice().sort()).toEqual(expected.map(t => t.name).sort());
    expect(errors).toEqual([]);
  });

  test('multi-tag deep link ?tag=a,b applies AND logic', async ({ page }) => {
    const errors = await setup(page);
    // find two tags that co-occur on at least one tool
    let pair = null;
    forEachTool(tool => {
      const tags = tool.all_tags || tool.tags || [];
      if (!pair && tags.length >= 2) pair = [tags[0], tags[1]];
    });
    test.skip(!pair, 'no tool with 2+ tags in data');

    const expected = toolsByTag(pair[0]).filter(t =>
      (t.all_tags || t.tags || []).includes(pair[1])
    );
    await page.goto(`/?tag=${pair[0]},${pair[1]}`);
    await expectResultCount(page, expected.length);
    expect(errors).toEqual([]);
  });
});

// ===========================================================================
// 2. CATEGORY flows — every category: dropdown count, clicked results, URL.
// ===========================================================================
test.describe('Category search consistency', () => {
  for (const category of allCategories()) {
    test(`category "${category.name}": dropdown count == clicked results == data`, async ({ page }) => {
      const errors = await setup(page);
      const expected = toolsByCategory(category.id);

      await typeQuery(page, category.name);

      const item = dropdownItem(page, 'category', category.name);
      await expect(item, `category "${category.name}" should appear in dropdown`).toBeVisible();
      await expect(item.locator('.autocomplete-item-meta')).toHaveText(`${expected.length} tools`);

      await item.click();

      await expectResultCount(page, expected.length);
      await expectNoDuplicateCards(page);

      // Every rendered card must belong to this category.
      const cardCategories = await page
        .locator('.result-card')
        .evaluateAll(cards => cards.map(c => c.dataset.category));
      for (const c of cardCategories) expect(c).toBe(category.name);

      expect(new URL(page.url()).searchParams.get('category')).toBe(category.id);
      expect(errors, `page errors: ${errors.join('; ')}`).toEqual([]);
    });
  }

  test('category deep link ?category= renders correct tools', async ({ page }) => {
    const errors = await setup(page);
    const category = allCategories()[0];
    const expected = toolsByCategory(category.id);
    await page.goto(`/?category=${category.id}`);
    await expectResultCount(page, expected.length);
    expect(errors).toEqual([]);
  });

  test('invalid ?category= shows empty state without crashing', async ({ page }) => {
    const errors = await setup(page);
    await page.goto('/?category=definitely-not-a-category');
    await expect(page.locator('#results-count')).toHaveText('0 tools found');
    await expect(page.locator('.no-results')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

// ===========================================================================
// 3. SUBCATEGORY flows — every subcategory: dropdown count, results, URL.
// ===========================================================================
test.describe('Subcategory search consistency', () => {
  for (const sub of allSubcategories()) {
    test(`subcategory "${sub.name}" (${sub.categoryId}): dropdown == results == data`, async ({ page }) => {
      const errors = await setup(page);
      const expected = toolsByCategory(sub.categoryId, sub.id);

      await typeQuery(page, sub.name);

      // Same subcategory name can exist under multiple categories — match on
      // the meta line (which includes the parent category name) when needed.
      const items = page
        .locator('.autocomplete-item[data-type="subcategory"]')
        .filter({ has: page.locator('.autocomplete-item-name', { hasText: new RegExp(`^${escapeRegex(sub.name)}$`, 'i') }) })
        .filter({ has: page.locator('.autocomplete-item-meta', { hasText: sub.categoryName }) });
      const item = items.first();
      await expect(item, `subcategory "${sub.name}" should appear in dropdown`).toBeVisible();
      await expect(item.locator('.autocomplete-item-meta')).toHaveText(
        `${sub.categoryName} • ${expected.length} tools`
      );

      await item.click();

      await expectResultCount(page, expected.length);
      await expectNoDuplicateCards(page);

      const cardSubs = await page
        .locator('.result-card')
        .evaluateAll(cards => cards.map(c => c.dataset.subcategory));
      for (const s of cardSubs) expect(s).toBe(sub.name);

      expect(new URL(page.url()).searchParams.get('subcategory')).toBe(sub.id);
      expect(errors, `page errors: ${errors.join('; ')}`).toEqual([]);
    });
  }

  test('subcategory deep link ?subcategory= renders correct tools', async ({ page }) => {
    const errors = await setup(page);
    const sub = allSubcategories()[0];
    const expected = toolsByCategory(sub.categoryId, sub.id);
    await page.goto(`/?subcategory=${sub.id}`);
    await expectResultCount(page, expected.length);
    expect(errors).toEqual([]);
  });

  test('invalid ?subcategory= shows empty state without crashing', async ({ page }) => {
    const errors = await setup(page);
    await page.goto('/?subcategory=not-a-real-subcategory');
    await expect(page.locator('#results-count')).toHaveText('0 tools found');
    expect(errors).toEqual([]);
  });
});

// ===========================================================================
// 4. TOOL flows — dropdown shows the tool with correct meta; clicking
//    navigates to its tool page; free-text search surfaces it.
// ===========================================================================
test.describe('Tool search consistency', () => {
  const tools = [];
  forEachTool((tool, { category, subcategory }) =>
    tools.push({ ...tool, categoryName: category.name, subcategoryName: subcategory.name })
  );
  // dedupe by slug, deterministic sample of 10
  const uniqueTools = [...new Map(tools.map(t => [t.slug, t])).values()];
  const sampledTools = sample(uniqueTools.map(t => ({ ...t, id: t.slug })), 10);

  for (const tool of sampledTools) {
    test(`tool "${tool.name}": appears in dropdown and navigates to its page`, async ({ page }) => {
      const errors = await setup(page);

      await typeQuery(page, tool.name);

      const item = dropdownItem(page, 'tool', tool.name);
      await expect(item, `tool "${tool.name}" should appear in dropdown`).toBeVisible();
      await expect(item.locator('.autocomplete-item-meta')).toContainText(tool.subcategoryName);

      await item.click();
      await page.waitForURL(`**/tools/${tool.slug}/**`, { timeout: 10000 });

      expect(errors, `page errors: ${errors.join('; ')}`).toEqual([]);
    });

    test(`tool "${tool.name}": free-text search shows it exactly once`, async ({ page }) => {
      const errors = await setup(page);

      await typeQuery(page, tool.name);
      // let the debounced full search render
      await expect(page.locator('#search-results')).not.toHaveClass(/hidden/);

      const matches = page.locator(`.result-card[data-slug="${tool.slug}"]`);
      await expect(matches, `"${tool.name}" should appear exactly once in results`).toHaveCount(1);
      await expectNoDuplicateCards(page);

      expect(errors, `page errors: ${errors.join('; ')}`).toEqual([]);
    });
  }

  test('cross-listed tools never produce duplicate cards (regression: ringcentral)', async ({ page }) => {
    const errors = await setup(page);
    await typeQuery(page, 'ringcentral');
    await expect(page.locator('#search-results')).not.toHaveClass(/hidden/);
    const cards = page.locator('.result-card[data-slug="ringcentral"]');
    await expect(cards).toHaveCount(1);
    expect(errors).toEqual([]);
  });
});

// ===========================================================================
// 5. Keyboard navigation — ArrowDown + Enter must behave like a click.
// ===========================================================================
test.describe('Keyboard selection consistency', () => {
  test('ArrowDown + Enter on a tag applies the tag filter', async ({ page }) => {
    const errors = await setup(page);
    const tag = allTags().filter(t => toolsByTag(t).length > 0).sort()[0];
    const expected = toolsByTag(tag);

    await typeQuery(page, tag.replace(/-/g, ' '));

    // Walk the dropdown to the tag item, then press Enter.
    const items = page.locator('.autocomplete-item');
    const count = await items.count();
    let tagIndex = -1;
    for (let i = 0; i < count; i++) {
      if ((await items.nth(i).getAttribute('data-type')) === 'tag') {
        const name = await items.nth(i).locator('.autocomplete-item-name').innerText();
        if (name.toLowerCase() === tag.replace(/-/g, ' ')) { tagIndex = i; break; }
      }
    }
    test.skip(tagIndex === -1, 'tag not present in dropdown for this query');

    for (let i = 0; i <= tagIndex; i++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expectResultCount(page, expected.length);
    expect(new URL(page.url()).searchParams.get('tag')).toBe(tag);
    expect(errors).toEqual([]);
  });
});
