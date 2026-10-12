// Notifies the submitter and the owner when a suggestion is approved or
// rejected. Triggered fire-and-forget from js/admin-api.js
// approveSuggestion()/rejectSuggestion().
//
// Staff check is duplicated here (mirrors checkIsAdmin() in js/admin-api.js)
// because the caller's JWT, not a trusted server session, is what reaches
// this function; client-side checks can't be relied on.

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
import { buildDecisionEmail } from '../_shared/decision-email.ts';


Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

    const ownerEmail = Deno.env.get('OWNER_EMAIL');
    if (!ownerEmail) console.error('[notify-suggestion-decision] OWNER_EMAIL is not set');

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Caller-scoped client: used only to identify who is calling, via their JWT.
    const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) {
        return jsonResponse({ error: 'Not authenticated' }, 401);
    }

    // Service-role client: used for the actual staff check and all data reads,
    // since RLS on user_roles/suggestions would otherwise scope to the caller.
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleRow } = await admin
        .from('user_roles')
        .select('role')
        .eq('user_id', userData.user.id)
        .in('role', ['admin', 'moderator'])
        .maybeSingle();
    if (!roleRow) {
        return jsonResponse({ error: 'Staff role required' }, 403);
    }

    let suggestionId: string | undefined;
    try {
        ({ suggestion_id: suggestionId } = await req.json());
    } catch (_) {
        return jsonResponse({ error: 'invalid JSON body' }, 400);
    }
    if (!suggestionId) return jsonResponse({ error: 'suggestion_id is required' }, 400);

    const { data: suggestion, error: suggestionError } = await admin
        .from('suggestions')
        .select('id, user_id, kind, tool_slug, payload, rationale, status, admin_note, created_at')
        .eq('id', suggestionId)
        .maybeSingle<Suggestion>();

    if (suggestionError || !suggestion) {
        console.error('[notify-suggestion-decision] suggestion lookup failed', suggestionError);
        return jsonResponse({ submitter_sent: false, owner_sent: false }, 200);
    }
    if (suggestion.status !== 'approved' && suggestion.status !== 'rejected') {
        return jsonResponse({ error: `suggestion status is '${suggestion.status}', expected approved or rejected` }, 400);
    }

    const { data: profile } = await admin
        .from('user_profiles')
        .select('email, display_name')
        .eq('id', suggestion.user_id)
        .maybeSingle();

    const summary = oneLiner(suggestion);
    const verb = suggestion.status === 'approved' ? 'approved' : 'rejected';

    let submitterSent = false;
    if (profile?.email) {
        const { subject, html } = buildDecisionEmail({
            suggestion,
            displayName: profile.display_name ?? null,
        });
        submitterSent = await sendEmail({
            to: profile.email,
            from: FROM_ADDRESS,
            replyTo: ownerEmail,
            subject,
            html,
        });
    } else {
        console.error('[notify-suggestion-decision] no email on file for user', suggestion.user_id);
    }

    const ownerSubject = `[AI Tool Review] Suggestion ${verb}: ${summary}`;
    const ownerHtml = `
        <p>Suggestion ${suggestion.id} was <strong>${verb}</strong>.</p>
        <ul>
            <li><strong>Submitter:</strong> ${escapeHtml(profile?.email ?? '(no email on file)')}</li>
            <li><strong>Summary:</strong> ${escapeHtml(summary)}</li>
            ${suggestion.admin_note ? `<li><strong>Admin note:</strong> ${escapeHtml(suggestion.admin_note)}</li>` : ''}
        </ul>
        <p><a href="${ADMIN_URL}">View in the admin console</a></p>
    `;
    const ownerSent = ownerEmail
        ? await sendEmail({ to: ownerEmail, from: FROM_ADDRESS, subject: ownerSubject, html: ownerHtml })
        : false;

    return jsonResponse({ submitter_sent: submitterSent, owner_sent: ownerSent });
});
