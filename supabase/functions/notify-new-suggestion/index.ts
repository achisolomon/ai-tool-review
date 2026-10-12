// Notifies the owner when a new suggestion is submitted.
// Triggered fire-and-forget from js/supabase-client.js createSuggestion().
// No staff check needed: the caller already owns the row (RLS-scoped read).

import { createClient } from 'npm:@supabase/supabase-js@2';
import {
    ADMIN_URL,
    FROM_ADDRESS,
    escapeHtml,
    jsonResponse,
    oneLiner,
    sendEmail,
    CORS_HEADERS,
    type Suggestion,
} from '../_shared/suggestion-email.ts';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

    const ownerEmail = Deno.env.get('OWNER_EMAIL');
    if (!ownerEmail) {
        console.error('[notify-new-suggestion] OWNER_EMAIL is not set');
        return jsonResponse({ sent: false }, 200);
    }

    let suggestionId: string | undefined;
    try {
        ({ suggestion_id: suggestionId } = await req.json());
    } catch (_) {
        return jsonResponse({ error: 'invalid JSON body' }, 400);
    }
    if (!suggestionId) return jsonResponse({ error: 'suggestion_id is required' }, 400);

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: suggestion, error } = await supabase
        .from('suggestions')
        .select('id, user_id, kind, tool_slug, payload, rationale, status, admin_note, created_at')
        .eq('id', suggestionId)
        .maybeSingle<Suggestion>();

    if (error || !suggestion) {
        console.error('[notify-new-suggestion] suggestion lookup failed', error);
        return jsonResponse({ sent: false }, 200);
    }

    const summary = oneLiner(suggestion);
    const subject = `[AI Tool Review] New suggestion: ${summary}`;
    const html = `
        <p>A new suggestion was submitted.</p>
        <ul>
            <li><strong>Kind:</strong> ${escapeHtml(suggestion.kind)}</li>
            ${suggestion.tool_slug ? `<li><strong>Tool:</strong> ${escapeHtml(suggestion.tool_slug)}</li>` : ''}
            <li><strong>Summary:</strong> ${escapeHtml(summary)}</li>
            ${suggestion.rationale ? `<li><strong>Rationale:</strong> ${escapeHtml(suggestion.rationale)}</li>` : ''}
        </ul>
        <p><a href="${ADMIN_URL}">Review it in the admin console</a></p>
    `;

    const sent = await sendEmail({
        to: ownerEmail,
        from: FROM_ADDRESS,
        subject,
        html,
    });

    return jsonResponse({ sent });
});
