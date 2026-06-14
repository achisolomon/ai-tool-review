import { test, expect } from '@playwright/test';

// Loads suggest-logic.js into a blank page and returns window.SuggestLogic.
async function load(page) {
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ path: 'js/suggest-logic.js' });
}

test('slugify lowercases, hyphenates, strips junk', async ({ page }) => {
  await load(page);
  const out = await page.evaluate(() => [
    SuggestLogic.slugify('Letta AI'),
    SuggestLogic.slugify('  Weird__Name!! '),
    SuggestLogic.slugify('already-good'),
  ]);
  expect(out).toEqual(['letta-ai', 'weird-name', 'already-good']);
});

test('findDuplicates matches by name (case-insensitive) and registered domain', async ({ page }) => {
  await load(page);
  const data = {
    developers: [{ subcategories: [{ tools: [
      { name: 'Mem0', slug: 'mem0', url: 'https://mem0.ai/' },
    ] }] }], users: [],
  };
  const res = await page.evaluate((d) => ({
    byName: SuggestLogic.findDuplicates({ name: 'mem0', website: '' }, d).map((t) => t.slug),
    byDomain: SuggestLogic.findDuplicates({ name: 'Other', website: 'https://www.mem0.ai/pricing' }, d).map((t) => t.slug),
    none: SuggestLogic.findDuplicates({ name: 'Fresh', website: 'https://fresh.io' }, d),
  }), data);
  expect(res.byName).toContain('mem0');
  expect(res.byDomain).toContain('mem0');
  expect(res.none).toEqual([]);
});

test('buildPayload(new_tool) nulls placement when section skipped', async ({ page }) => {
  await load(page);
  const p = await page.evaluate(() => SuggestLogic.buildPayload('new_tool', {
    name: 'Letta', slug: 'letta', website: 'https://letta.com', description: 'd',
    placementProvided: false, tags: [], type: 'oss',
  }));
  expect(p.placement).toBeNull();
  expect(p.slug).toBe('letta');
});

test('buildPayload(tool_edit) keeps only changed fields as {from,to}', async ({ page }) => {
  await load(page);
  const p = await page.evaluate(() => SuggestLogic.buildPayload('tool_edit', {
    original: { description: 'Old', website: 'https://a.io', type: 'oss' },
    edited: { description: 'New', website: 'https://a.io', type: 'oss' },
  }));
  expect(Object.keys(p.changes)).toEqual(['description']);
  expect(p.changes.description).toEqual({ from: 'Old', to: 'New' });
});

test('taxonomyObjects lists categories/subcategories/tags as {slug,label}', async ({ page }) => {
  await load(page);
  const res = await page.evaluate(() => {
    const tax = {
      categories: {
        developers: {
          'ai-coding': {
            name: 'AI Coding',
            subcategories: { 'ai-ides': { name: 'AI IDEs' } },
          },
        },
      },
      tags: { capabilities: [{ slug: 'reasoning', name: 'Reasoning' }] },
    };
    return {
      cats: SuggestLogic.taxonomyObjects(tax, 'category'),
      subs: SuggestLogic.taxonomyObjects(tax, 'subcategory'),
      tags: SuggestLogic.taxonomyObjects(tax, 'tag'),
    };
  });
  expect(res.cats).toContainEqual({ slug: 'ai-coding', label: 'AI Coding' });
  expect(res.subs).toContainEqual({ slug: 'ai-ides', label: 'AI Coding › AI IDEs' });
  expect(res.tags).toContainEqual({ slug: 'reasoning', label: 'Reasoning (capabilities)' });
});
