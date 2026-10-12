import { assert, assertEquals, assertStringIncludes } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { buildDecisionEmail, toolSlugFor } from './decision-email.ts';
import type { Suggestion } from './suggestion-email.ts';

const newTool: Suggestion = {
    id: 's1',
    user_id: 'u1',
    kind: 'new_tool',
    tool_slug: null,
    payload: { name: 'Acme', website: 'https://acme.dev', slug: 'acme' },
    rationale: null,
    status: 'approved',
    admin_note: null,
    created_at: '2026-10-12T00:00:00Z',
};

Deno.test('approved new tool links the page, the review dialog, and suggest-more', () => {
    const { subject, html } = buildDecisionEmail({ suggestion: newTool, displayName: 'Dana' });
    assertEquals(subject, 'Acme is live on AI Tool Review, thanks to you');
    assertStringIncludes(html, 'https://aitoolreview.ai/tools/acme/?review=1');
    assertStringIncludes(html, 'href="https://aitoolreview.ai/tools/acme/"');
    assertStringIncludes(html, 'Suggest it');
    assertStringIncludes(html, 'Just reply');
    assertStringIncludes(html, 'Hi Dana,');
});

Deno.test('all links share one style', () => {
    const { html } = buildDecisionEmail({ suggestion: newTool, displayName: null });
    const anchors = html.match(/<a [^>]*>/g) ?? [];
    assert(anchors.length >= 4);
    const styles = new Set(anchors.map((a) => a.match(/style="[^"]*"/)?.[0]));
    assertEquals(styles.size, 1);
});

Deno.test('user-supplied text is HTML-escaped', () => {
    const evil = { ...newTool, payload: { ...newTool.payload, name: '<script>x</script>' }, admin_note: '<img src=x>' };
    const { html } = buildDecisionEmail({ suggestion: evil, displayName: '<b>d</b>' });
    assert(!html.includes('<script>'));
    assert(!html.includes('<b>d</b>'));
    const rejected = buildDecisionEmail({ suggestion: { ...evil, status: 'rejected' }, displayName: null }).html;
    assert(!rejected.includes('<img src=x>'));
});

Deno.test('rejected email is polite, includes the reason and the resubmit link', () => {
    const rejected = { ...newTool, status: 'rejected', admin_note: 'Site is offline' };
    const { subject, html } = buildDecisionEmail({ suggestion: rejected, displayName: 'Dana' });
    assertEquals(subject, 'About your suggestion: Acme');
    assertStringIncludes(html, 'Thank you for suggesting <strong>Acme</strong>');
    assertStringIncludes(html, 'Site is offline');
    assertStringIncludes(html, '/my-suggestions');
});

Deno.test('toolSlugFor uses payload slug for new tools and tool_slug otherwise', () => {
    assertEquals(toolSlugFor(newTool), 'acme');
    assertEquals(toolSlugFor({ ...newTool, kind: 'tool_edit', tool_slug: 'langfuse', payload: {} }), 'langfuse');
});
