import { test, expect } from '@playwright/test';

test.describe('Tool Page Title Links', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });
  });

  test('tool title links to external website, not internal page', async ({ page }) => {
    // Navigate to a tool page (Cursor has a known external URL)
    await page.goto('/tools/cursor/');

    // Get the title link
    const titleLink = page.locator('.tool-header h1 a');
    await expect(titleLink).toBeVisible();

    // Get the href attribute
    const href = await titleLink.getAttribute('href');

    // Should link to external website, NOT to internal /tools/cursor/ page
    expect(href, 'Title should link to external website').not.toMatch(/^\/tools\//);
    expect(href, 'Title should link to external website').not.toMatch(/^\/[^h]/); // Not a relative path
    expect(href, 'Title should be an external URL').toMatch(/^https?:\/\//);

    // Specifically for Cursor, should link to cursor.com
    expect(href).toContain('cursor.com');
  });

  test('tool title link opens in new tab', async ({ page }) => {
    await page.goto('/tools/cursor/');

    const titleLink = page.locator('.tool-header h1 a');

    // Should have target="_blank" for external link
    await expect(titleLink).toHaveAttribute('target', '_blank');

    // Should have rel="noopener" for security
    const rel = await titleLink.getAttribute('rel');
    expect(rel).toContain('noopener');
  });

  test('multiple tool pages have correct external links', async ({ page }) => {
    // Test a sample of tool pages to ensure the fix is applied broadly
    const toolsToTest = [
      { slug: 'cursor', expectedDomain: 'cursor.com' },
      { slug: 'langchain', expectedDomain: 'langchain.com' },
    ];

    for (const tool of toolsToTest) {
      await page.goto(`/tools/${tool.slug}/`);

      const titleLink = page.locator('.tool-header h1 a');
      const href = await titleLink.getAttribute('href');

      // Should be an external URL containing the expected domain
      expect(href, `${tool.slug} title should link externally`).toMatch(/^https?:\/\//);
      expect(href, `${tool.slug} should link to ${tool.expectedDomain}`).toContain(tool.expectedDomain);
    }
  });

  test('tool page Schema.org JSON-LD has correct external URL', async ({ page }) => {
    await page.goto('/tools/cursor/');

    // Get the JSON-LD script content
    const jsonLdScript = page.locator('script[type="application/ld+json"]').first();
    const jsonLdContent = await jsonLdScript.textContent();
    const jsonLd = JSON.parse(jsonLdContent);

    // The URL in Schema.org should be the external website
    expect(jsonLd.url, 'Schema.org URL should be external').toMatch(/^https?:\/\//);
    expect(jsonLd.url, 'Schema.org URL should not be internal').not.toMatch(/aitoolreview\.ai/);
    expect(jsonLd.url).toContain('cursor.com');
  });
});

test.describe('Tool Page Review Modal', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted');
    });
  });

  test('review modal is hidden by default on page load', async ({ page }) => {
    // Navigate to a tool page
    await page.goto('/tools/cursor/');

    // Wait for reviews section to load
    await page.waitForSelector('#reviews');

    // Review modal should exist but be hidden (no 'active' class)
    const reviewModal = page.locator('#review-modal');

    // Modal may not exist yet until Leave Review is clicked
    // But if it exists, it should not have 'active' class
    const modalCount = await reviewModal.count();
    if (modalCount > 0) {
      await expect(reviewModal).not.toHaveClass(/active/);
    }

    // Body should not have overflow:hidden (which is set when modal is open)
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).not.toBe('hidden');
  });

  test('review modal does not open on page navigation back (bfcache scenario)', async ({ page }) => {
    // This tests the fix for the bug where the modal opened on back navigation

    // Go to tool page
    await page.goto('/tools/cursor/');
    await page.waitForSelector('#reviews');

    // Navigate away (simulate clicking external link by going to another page)
    await page.goto('/');

    // Navigate back
    await page.goBack();
    await page.waitForSelector('#reviews');

    // Review modal should NOT be open
    const reviewModal = page.locator('#review-modal');
    const modalCount = await reviewModal.count();
    if (modalCount > 0) {
      await expect(reviewModal).not.toHaveClass(/active/);
    }

    // Body should not have overflow:hidden
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).not.toBe('hidden');
  });

  test('auth modal does not open automatically on page load', async ({ page }) => {
    await page.goto('/tools/cursor/');
    await page.waitForSelector('#reviews');

    // Auth modal should not be open by default
    const authModal = page.locator('#auth-modal');
    const authModalCount = await authModal.count();
    if (authModalCount > 0) {
      await expect(authModal).not.toHaveClass(/active/);
    }
  });
});

test('star badge renders count from stars.json (formatted k)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
  // Stub the stars.json fetch with a known value before navigation.
  await page.route('**/data/stars.json*', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ generated_at: 'T', stars: { 'aider': { count: 142318, fetched_at: 'T' } } })
  }));
  await page.goto('/tools/aider/');
  await expect(page.locator('.tool-stars .star-count')).toHaveText('142k');
});

test('star badge keeps build-time fallback when stars.json fails', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cookie_consent', 'accepted'));
  await page.route('**/data/stars.json*', route => route.fulfill({ status: 500, body: '' }));
  await page.goto('/tools/aider/');
  // Fallback is the build-time rendered value; assert it is a non-empty "...k".
  await expect(page.locator('.tool-stars .star-count')).toHaveText(/\d+k/);
});
