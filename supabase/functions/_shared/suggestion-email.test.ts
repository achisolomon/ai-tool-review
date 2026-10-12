import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { oneLiner, type Suggestion } from './suggestion-email.ts';

function makeSuggestion(overrides: Partial<Suggestion>): Suggestion {
    return {
        id: 'id-1',
        user_id: 'user-1',
        kind: 'new_tool',
        tool_slug: null,
        payload: {},
        rationale: null,
        status: 'pending',
        admin_note: null,
        created_at: new Date().toISOString(),
        ...overrides,
    };
}

Deno.test('oneLiner: new_tool', () => {
    const s = makeSuggestion({ kind: 'new_tool', payload: { name: 'Acme', website: 'https://acme.dev' } });
    assertEquals(oneLiner(s), 'Add "Acme" - https://acme.dev');
});

Deno.test('oneLiner: taxonomy_change', () => {
    const s = makeSuggestion({ kind: 'taxonomy_change', payload: { op: 'rename', details: 'Rename Foo to Bar' } });
    assertEquals(oneLiner(s), 'Taxonomy: rename - Rename Foo to Bar');
});

Deno.test('oneLiner: tool_placement', () => {
    const s = makeSuggestion({
        kind: 'tool_placement',
        tool_slug: 'acme',
        payload: { proposed: { category: 'writing', subcategory: 'editors' } },
    });
    assertEquals(oneLiner(s), 'Move acme -> writing/editors');
});

Deno.test('oneLiner: tool_edit', () => {
    const s = makeSuggestion({
        kind: 'tool_edit',
        tool_slug: 'acme',
        payload: { changes: { website: 'x', pricing: 'y' } },
    });
    assertEquals(oneLiner(s), 'Fix website, pricing on acme');
});

Deno.test('oneLiner: tool_edit with no changes falls back to "details"', () => {
    const s = makeSuggestion({ kind: 'tool_edit', tool_slug: 'acme', payload: {} });
    assertEquals(oneLiner(s), 'Fix details on acme');
});
