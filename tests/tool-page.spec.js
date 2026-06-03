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
