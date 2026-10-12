// Shared helpers for the suggestion email Edge Functions.
// Ported from js/admin-suggestions.js oneLiner(), kept logic-identical so
// email text matches what the admin sees in the moderation queue.

export interface Suggestion {
    id: string;
    user_id: string;
    kind: 'new_tool' | 'taxonomy_change' | 'tool_placement' | 'tool_edit';
    tool_slug: string | null;
    payload: Record<string, unknown>;
    rationale: string | null;
    status: string;
    admin_note: string | null;
    created_at: string;
}

export function oneLiner(s: Suggestion): string {
    const p = s.payload || {};
    switch (s.kind) {
        case 'new_tool':
            return `Add "${p.name ?? 'unnamed'}" - ${p.website ?? ''}`;
        case 'taxonomy_change':
            return `Taxonomy: ${p.op ?? 'change'} - ${p.details ?? ''}`.slice(0, 120);
        case 'tool_placement': {
            const prop = (p.proposed as Record<string, unknown>) || {};
            return `Move ${s.tool_slug ?? ''} -> ${prop.category ?? ''}/${prop.subcategory ?? ''}`;
        }
        case 'tool_edit': {
            const fields = Object.keys((p.changes as Record<string, unknown>) || {}).join(', ') || 'details';
            return `Fix ${fields} on ${s.tool_slug ?? ''}`;
        }
        default:
            return s.kind || 'unknown';
    }
}

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
}

interface SendEmailArgs {
    to: string;
    subject: string;
    html: string;
    from: string;
    replyTo?: string;
    bcc?: string;
}

// Returns true on a 2xx from Resend, false otherwise. Never throws, callers
// degrade gracefully on a false return instead of failing the whole request.
export async function sendEmail(args: SendEmailArgs): Promise<boolean> {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
        console.error('[notify] RESEND_API_KEY is not set');
        return false;
    }
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: args.from,
                to: args.to,
                subject: args.subject,
                html: args.html,
                ...(args.replyTo ? { reply_to: args.replyTo } : {}),
                ...(args.bcc ? { bcc: args.bcc } : {}),
            }),
        });
        if (!res.ok) {
            console.error('[notify] Resend send failed', res.status, await res.text());
            return false;
        }
        return true;
    } catch (err) {
        console.error('[notify] Resend send threw', err);
        return false;
    }
}

export const FROM_ADDRESS = 'AI Tool Review <contact@aitoolreview.ai>';
export const ADMIN_URL = 'https://aitoolreview.ai/admin.html';
