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

const DUP_DATA = {
  developers: [{ subcategories: [{ tools: [
    { name: 'Mem0', slug: 'mem0', url: 'https://mem0.ai/' },
    { name: 'ECC', slug: 'ecc', url: 'https://github.com/affaan-m/ecc' },
    { name: 'Other Repo', slug: 'other-repo', url: 'https://github.com/someone/else' },
  ] }] }], users: [],
};

async function dupSlugs(page, website, name = '') {
  return page.evaluate(([w, n, d]) =>
    SuggestLogic.findDuplicates({ name: n, website: w }, d).map((t) => t.slug), [website, name, DUP_DATA]);
}

test('findDuplicates: same repo with different casing / trailing slash / .git / scheme is a match', async ({ page }) => {
  await load(page);
  for (const url of ['github.com/affaan-m/ecc', 'https://github.com/Affaan-M/ecc.git', 'http://www.github.com/affaan-m/ecc/', 'https://github.com/affaan-m/ecc?tab=readme#top']) {
    expect(await dupSlugs(page, url), url).toEqual(['ecc']);
  }
});

test('findDuplicates: another repo on the same code host is not a match', async ({ page }) => {
  await load(page);
  expect(await dupSlugs(page, 'https://github.com/affaan-m/other')).toEqual([]);
  expect(await dupSlugs(page, 'https://github.com/')).toEqual([]);
});

test('findDuplicates: same site URL ignoring scheme, www, host case and trailing slash is a match', async ({ page }) => {
  await load(page);
  expect(await dupSlugs(page, 'https://www.MEM0.ai')).toEqual(['mem0']);
  expect(await dupSlugs(page, 'mem0.ai/')).toEqual(['mem0']);
});

test('findDuplicates: same domain with a different path is not a match', async ({ page }) => {
  await load(page);
  expect(await dupSlugs(page, 'https://mem0.ai/pricing')).toEqual([]);
});

test('findDuplicates: a matching name alone is not a match', async ({ page }) => {
  await load(page);
  expect(await dupSlugs(page, 'https://fresh.io', 'Mem0')).toEqual([]);
  expect(await dupSlugs(page, '', 'Mem0')).toEqual([]);
});

test('normalizeToolUrl adds https:// and rejects things that are not web links', async ({ page }) => {
  await load(page);
  const out = await page.evaluate(() => [
    'github.com/affaan-m/ecc', 'https://example.com/x', '  example.com ', 'not a link', 'localhost', 'ftp://example.com', '',
  ].map((u) => SuggestLogic.normalizeToolUrl(u)));
  expect(out).toEqual([
    'https://github.com/affaan-m/ecc', 'https://example.com/x', 'https://example.com/', null, null, null, null,
  ]);
});

test('deriveNameFromUrl uses the repo/package name on code hosts and the site name elsewhere', async ({ page }) => {
  await load(page);
  const out = await page.evaluate(() => [
    'https://github.com/affaan-m/ecc',
    'gitlab.com/group/everything-claude-code.git',
    'https://huggingface.co/meta-llama/Llama-3',
    'https://www.npmjs.com/package/left-pad',
    'https://www.cursor.com/',
    'app.letta.com',
    'github.com/openai',
  ].map((u) => SuggestLogic.deriveNameFromUrl(u)));
  expect(out).toEqual(['Ecc', 'Everything Claude Code', 'Llama 3', 'Left Pad', 'Cursor', 'Letta', 'Openai']);
});

test('buildPayload(new_tool) with only a URL derives name + slug and allows an empty description', async ({ page }) => {
  await load(page);
  const p = await page.evaluate(() => SuggestLogic.buildPayload('new_tool', { website: 'https://github.com/affaan-m/ecc' }));
  expect(p).toMatchObject({ name: 'Ecc', slug: 'ecc', name_derived: true, description: '', placement: null });
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
